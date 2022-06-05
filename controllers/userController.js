const User = require("../models/User");
//library for status code
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const cloudinary = require("cloudinary");
const sendEmail = require("../errors/sendEmail");

//signup register
const register = async (req, res) => {
  try {
    if (!req.body.avatar) {
      const user = await User.create({ ...req.body });
      const token = user.createJWT();
      res.status(StatusCodes.CREATED).json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
          gender: user.gender,
          country: user.country,
          state: user.state,
          fav: user.fav,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      });
    } else {
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "photographer-avatar",
        width: 150,
        crop: "scale",
      });
      const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        gender: req.body.gender,
        country: req.body.country,
        state: req.body.state,
        fav: req.body.fav,
        role: req.body.role,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });
      const token = user.createJWT();
      res.status(StatusCodes.CREATED).json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          age: user.age,
          gender: user.gender,
          country: user.country,
          state: user.state,
          fav: user.fav,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

//signin / login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      country: user.country,
      state: user.state,
      fav: user.fav,
      role: user.role,
      avatar: user.avatar
    },
    token,
  });
};

//get all user
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" });
  res.status(StatusCodes.OK).json({ count: users.length, users });
};

//get single user by id
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

//update User Profile
// const updateProfile = async (req, res) => {
//   var token;
//   try {
//     const newUserData = {
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         email: req.body.email,
//         age: req.body.age,
//         gender: req.body.gender,
//         country: req.body.country,
//         state: req.body.state,
//         fav: req.body.fav,
//         role: req.body.role,
//     };
//     if (req.body.avatar !== "") {
//       const user = await User.findById(req.user._id);
//       token = user.createJWT();
//       const imageId = user.avatar.public_id;
  
//       await cloudinary.v2.uploader.destroy(imageId);
  
//       const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
//         folder: "photographer-avatar",
//         width: 150,
//         crop: "scale",
//       });
//       newUserData.avatar = {
//         public_id: myCloud.public_id,
//         url: myCloud.secure_url,
//       };
//     }
  
//     const userupdate = await User.findByIdAndUpdate(req.user._id,newUserData, {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     });

//     return res.status(200).json({ msg: "Updated Profile",success:true ,user:userupdate, token});
//   } catch (error) {
//     return res.status(500).json({ msg: error.message });
//   }
// };

//updata user data
const updateProfile = async (req, res) => {
  const { firstName, lastName, email, age, gender, country, state, fav, role } = req.body;
  
  if (!firstName || !lastName || !email || !age || !gender || !country || !state || !fav || !role) {
      throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne(req.user._id);

  if(!user) return res.status(404).json({msg: "No User Exist"})

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.age = age;
  user.gender = gender;
  user.country = country;
  user.state = state;
  user.fav = fav;
  user.role = role;

  await user.save();

  const token = user.createJWT(user);
  res.status(StatusCodes.OK).json({
      user: { 
          id: user._id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          age: user.age, 
          gender: user.gender, 
          country: user.country, 
          state: user.state,
          fav: user.fav,
          role: user.role,
          avatar: user.avatar
      }, token 
  })
};

//updata password
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
      throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.params.id });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;
  await user.save();
  const token = user.createJWT(user);
  res.status(StatusCodes.OK).json({msg: 'password updated', token })
};

// forget Password
const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) return res.status(500).json({ msg: "User Not Found" });
  // Get ResetPassword Token
  const resetToken = user.getRestPasswordToken();
  await user.save({ validateBeforeSave: false });
console.log(req.protocol)
  const resetPasswordUrl = `${req.protocol}://${req.get("host" )}/api/v1/reset/${resetToken}`;

  
  const message = `Your Password  reset token is :- \n\n${resetPasswordUrl} \n\nIf you are not require this email then ,Please Ignore IT`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Photographer Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} Successfuly`,
      proto: req.protocol
    });
  } catch (error) {
    user.resetPasswordToken = undefined; // to prevent user to make two change just one change
    user.resetPasswordExpire = undefined; // to prevent user to make two change just one change
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ msg: error.message });
  }
};

//delete user
const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete({ _id: req.params.id });
  res.status(StatusCodes.CREATED).json({ msg: "Success! User Deleted." });
};

module.exports = {
  register,
  login,
  getAllUsers,
  getSingleUser,
  updateProfile,
  updatePassword,
  forgetPassword,
  deleteUser,
};
