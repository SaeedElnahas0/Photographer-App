const User = require("../models/User");
//library for status code
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const cloudinary = require("cloudinary");

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

//updata user name
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
  updatePassword,
  deleteUser,
};
