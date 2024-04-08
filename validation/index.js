const { body } = require('express-validator');

const firstnameValidation = body('firstname').notEmpty().withMessage('firstname is required');
const lastnameValidation = body('lastname').notEmpty().withMessage('lastname is required');
const emailValidation = body('email').notEmpty()
.withMessage('Email is required')
.isEmail()
.withMessage('Not a valid email address');

const passwordValidation = body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('password must be at least 6 characters');

const mobileValidation = body('mobile').notEmpty().withMessage('Mobile is required').isLength({ min:10, max:10 }).withMessage('Mobile must be at 10 characters')




module.exports = {firstnameValidation, lastnameValidation, emailValidation, passwordValidation, mobileValidation}