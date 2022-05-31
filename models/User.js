const mongoose = require('mongoose');
const validator = require('validator'); // handle input data validation
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        minlength: 3,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
    age: {
        type: String,
        required: [true, 'Please provide age']
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    country: {
        type: String,
        required: [true, 'Please provide country']
    },
    fav: {
        type: String,
        required: [true, 'Please provide fav']
    },
    role: {
        type: String,
        enum: ['photographer', 'user'],
        default: 'user',
    },
    avatar: {
        public_id: {
            type: String,
            required: [true, 'Please provide public_id'],
            default: 'unkown User',
        },
        url: {
            type: String,
            required: [true, 'Please provide url'],
            default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        }
        
    }
});

//pre middleware executed one after another when each middleware calls
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
//token
userSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    )
}
//compare password
userSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model('User', userSchema);  
