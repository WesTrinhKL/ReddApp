const { csrfProtection, asyncHandler } = require('./utils');
const express = require('express');
const db = require('../db/models');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { requireAuth, loginUser, logoutUser, restoreUser } = require('../auth');
const { Comment } = db;

const router = express.Router();

const userValidator = [
  check('username')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Username')
    .isLength({ max: 50 })
    .withMessage('Username must not be more than 50 characters long')
    .custom((value) => {
      return db.User.findOne({ where: { username: value } })
        .then((user) => {
          if (user) {
            return Promise.reject('The provided Username is already in use by another account');
          }
        });
    }),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Password')
    .isLength({ max: 50 })
    .withMessage('Password must not be more than 50 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'g')
    .withMessage('Password must contain at least 1 lowercase letter, uppercase letter, number, and special character (i.e. "!@#$%^&*")'),
  check('confirmPassword')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Confirm Password')
    .isLength({ max: 50 })
    .withMessage('Confirm Password must not be more than 50 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm Password does not match Password');
      }
      return true;
    }),
];

/* GET users listing. */
router.get('/sign-up', csrfProtection, (req, res, next) => {
  const user = db.User.build() //CREATE EMPTY USER INSTANCE, VIEW BELOW WILL INITIALLY RENDER EMPTY USER FIELDS
  res.render('sign-up', {
    title: 'Sign-up',
    user,
    csrfToken: req.csrfToken(),
  })
});

router.post('/sign-up', csrfProtection, userValidator, asyncHandler(async (req, res) => {
  const {
    username,
    password,
  } = req.body;

  const user = db.User.build({
    username,
  });

  const validationErrors = validationResult(req);
  if (validationErrors.isEmpty()) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.hashedPassword = hashedPassword;
    await user.save();
    loginUser(req, res, user);
    res.redirect('/');
  } else {
    const errors = validationErrors.array().map((error) => error.msg);
    res.render('sign-up', {
      title: 'Sign-up',
      user,
      errors,
      csrfToken: req.csrfToken()
    })
  };

}))

router.get('/login', csrfProtection, (req, res) => {
  res.render('login', {
    title: 'Login',
    csrfToken: req.csrfToken(),
  });
});

const loginValidators = [
  check('username')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Username'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Password'),
];

router.post('/login', csrfProtection, loginValidators,
  asyncHandler(async (req, res) => {
    const {
      username,
      password,
    } = req.body;

    let errors = [];
    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
      const user = await db.User.findOne({ where: { username } });
      if(user !== null) {
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword.toString());
        if (passwordMatch) {
          loginUser(req, res, user);
          return res.redirect('/');
        }
      }
      errors.push('Login failed for the provided username and password');
    } else {
      errors = validatorErrors.array().map((error) => error.msg);
    }

    res.render('login', {
      title: 'Login',
      username,
      errors,
      csrfToken: req.csrfToken(),
    });
  }));

router.get('/logout', (req, res) => {
  logoutUser(req, res);
  res.redirect('/users/login');
});

router.get('/demo',((req, res) => {
  const user = {
    id:1,
  }
  loginUser(req, res, user);
  res.redirect('/');
}));

router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  // console.log("local user", res.locals.user);
  if (req.session.auth) {
    const { userId } = req.session.auth;
    const user = await db.User.findByPk(userId);

    if (user) {
      res.render('profile.pug', {
        title: 'Profile Page',
        user,
      });
    }
  } else {
    res.redirect('/users/login');
  }

}));

router.get('/comments', (req, res, next) => {
  const comment = db.Comment.build() //CREATE EMPTY USER INSTANCE, VIEW BELOW WILL INITIALLY RENDER EMPTY USER FIELDS
  res.render('comment', {
    title: 'user-comment',
    comment,
  })
});

router.post('/comments', asyncHandler(async (req, res) => {
  const {
    content,
    userId,
    postId,
  } = req.body;

  const comment = db.Comment.build({
    content,
    userId,
    postId,
  });
    await comment.save();
    res.redirect('/');
}))

module.exports = router;
