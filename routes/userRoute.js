const express = require('express');
const auth = require('../middleware/authentication')
const router = express.Router();
const { 
    register,
    login,
    getAllUsers,
    getSingleUser,
    updateProfile,
    updatePassword,
    forgetPassword,
    resetPassword,
    deleteUser
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/', getAllUsers);
router.get('/:id', getSingleUser);
router.patch('/updateprofile', auth, updateProfile);
router.patch('/updatepassword/:id',  updatePassword);
router.post('/forgetpassword',  forgetPassword);
router.patch('/resetpassword',  resetPassword);
router.delete('/:id', deleteUser);

module.exports = router;