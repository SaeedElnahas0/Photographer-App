const User = require('../models/User');
//library for status code
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const cloudinary = require("cloudinary");

//signup register
const register = async (req, res) => {
    if(!req.body.avatar){
            const user = await User.create({ ...req.body });
            const token = user.createJWT()
            res.status(StatusCodes.CREATED).json({ 
            user: { 
                id: user._id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                age: user.age, 
                gender: user.gender, 
                country: user.country, 
                fav: user.fav,
                role: user.role,
                avatar: user.avatar 
            }, token 
        })
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
            fav: req.body.fav,
            role: req.body.role,
            avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
        });
            const token = user.createJWT()
            res.status(StatusCodes.CREATED).json({ 
            user: { 
                id: user._id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                age: user.age, 
                gender: user.gender, 
                country: user.country, 
                fav: user.fav,
                role: user.role,
                profilePic: user.profilePic 
            }, token 
        })
    }
}

// const Register = async (req, res) => {
//     try {
//       if (!req.body.pic) {
//         const { name, email, password,phone } = req.body;
//         //check if user Already exist in DB or not
//         const user = await User.findOne({ email });
//         //return this message if user exist in db
//         if (user) return res.status(400).json({ msg: "This user Already Exist" });
//         //check length of password
//         if (password.length < 6)
//           return res.status(400).json({ msg: "Password must be More Than 5" });
//           if (phone.length < 11)
//           return res.status(400).json({ msg: "Password must be  11" });
//         // ecrypt password
//         const passwordHash = await bcrypt.hash(password, 10);
//         const newUser = new User({
//           name,
//           email,
//           password: passwordHash,
//           phone
//         });
  
//         //To Save In DB U Can USed Create But this is anthor way
//         await newUser.save();
//         const accesstoken = createAccessToken({ id: newUser._id });
//         res.status(200).json({
//           success: true,
//           user: newUser,
//           accesstoken: accesstoken,
//         });
//       } else {
//         const myCloud = await cloudinary.v2.uploader.upload(req.body.pic, {
//           folder: "chat-avatars",
//           width: 150,
//           crop: "scale",
//         });
  
//         const { name, email, password,phone } = req.body;
//         //check if user Already exist in DB or not
//         const user = await User.findOne({ email });
//         //return this message if user exist in db
//         if (user) return res.status(400).json({ msg: "This user Already Exist" });
//         //check length of password
//         if (password.length < 6)
//           return res.status(400).json({ msg: "Password must be More Than 5" });
//         // ecrypt password
//         const passwordHash = await bcrypt.hash(password, 10);
//         console.log(phone)
//         const newUser = new User({
//           name,
//           email,
//           password: passwordHash,
//           pic: {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url,
//           },
//           phone
//         });
  
//         //To Save In DB U Can USed Create But this is anthor way
//         await newUser.save();
//         const accesstoken = createAccessToken({ id: newUser._id });
//         res.status(200).json({
//           success: true,
//           _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         phone:newUser.phone,
//         pic: newUser.pic,
//         accesstoken: accesstoken,
//         });
//       }
//     } catch (error) {
  
//       return res.status(500).json({ msg: error.message });
//     }
//   };

//signin / login
const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials')
    }
    const token = user.createJWT()
    res.status(StatusCodes.OK).json({
        user: { 
            id: user._id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, 
            age: user.age, 
            gender: user.gender, 
            country: user.country, 
            fav: user.fav,
            role: user.role,
            // profilePic: user.profilePic
        }, token 
    })
}

//get all user 
const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' });
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


//delete user
const deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete({ _id: req.params.id });
    res.status(StatusCodes.CREATED).json({ msg: 'Success! User Deleted.' })
}

module.exports = {
    register,
    login,
    getAllUsers,
    getSingleUser,
    deleteUser
}