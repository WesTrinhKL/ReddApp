const { csrfProtection, asyncHandler } = require('./utils');
const express = require('express');
const router = express.Router();
const db = require('../db/models');
const { check, validationResult } = require('express-validator');

const userValidator =

/* GET users listing. */
router.get('/sign-up', csrfProtection,  (req, res, next) => {
 const user = db.User.build() //CREATE EMPTY USER INSTANCE, VIEW BELOW WILL INITIALLY RENDER EMPTY USER FIELDS
  res.render('sign-up', {
    title: 'Sign-up',
    user,
    csrfToken: req.csrfToken(),
   })
});


module.exports = router;
