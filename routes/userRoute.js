const express = require('express');
const router = express.Router();
const { 
    register,
    login,
    getAllUsers,
    getSingleUser,
    deleteUser
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/', getAllUsers);
router.get('/:id', getSingleUser);
router.delete('/:id', deleteUser);

module.exports = router;