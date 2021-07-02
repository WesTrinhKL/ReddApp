const { csrfProtection, asyncHandler } = require('./utils');
const express = require('express');
const db = require('../db/models');
const { check, validationResult } = require('express-validator');
const { Op } = require("sequelize");
const bcrypt = require('bcryptjs');
const { requireAuth, loginUser, logoutUser, restoreUser } = require('../auth');


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
    res.redirect('/users/my-profile');
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
          req.session.save(error => {
            if(error){
              next(error)
            } else {
              return res.redirect('/posts/feed');
            }
          })
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

router.get('/logout', (req, res, next) => {
  logoutUser(req, res);
  req.session.save(error => {
    if(error){
      next(error)
    } else {
      return res.redirect('/users/login');
    }
  })
});

router.get('/demo', (async (req, res) => {
  const user = await db.User.findByPk(1);
  loginUser(req, res, user);
  res.redirect('/');
}));

router.get('/my-profile', requireAuth, asyncHandler(async (req, res) => {
  // @feature: will fetch the user's own profile.
  if (req.session.auth) {
     // console.log("local user", res.locals.user);
    const { userId } = req.session.auth;
    const user = await db.User.findByPk(userId);

    if (user) {

      const currentUserPosts = await db.Post.findAll({
        where:{
          userId: user.id,
        },
        attributes: ['id','header', 'content'],
        include: { model: db.User, as: 'user' },
        limit: 20,
        order:  [['updatedAt', 'DESC']],
    })
      res.render('profile.pug', {
        title: 'Profile Page',
        user,
        userBeingViewed: user,
        currentUserPosts
      });
    }
  } else {
    res.redirect('/users/login');
  }
}));

router.get('/profile/:id(\\d+)', asyncHandler(async (req, res) => {

  const userId  = parseInt(req.params.id, 10);
  const userBeingViewed = await db.User.findByPk(userId);
  if(userBeingViewed){ //if user being viewed exists
    const ourUser = res.locals.user

    // console.log(`${userId} ${ourUser.id}`)
    //default data if follower not found
    let buttonClass = "follow-button";
    let text= "Follow"
    let follow;
    if(req.session.auth){
      follow = await db.Follow.findOne({ //find if user is following the one being viewed
        where:{
          [Op.and]: [
            { followBelongsToUserID: userId },
            { followerUserID: ourUser.id }
          ]
        }
      })
      if(follow){
        buttonClass= "unfollow-button";
        text = "Following";
      }
    }
    // console.log("follow obj!!! ", follow)
    res.render('profile.pug', {
      title: 'Profile Page',
      user: ourUser,
      userBeingViewed,
      buttonClass,
      text,
      follow,
    });
  }
  else{
    res.redirect('/');
  }
}));


router.get('/followers' , asyncHandler(async(req,res)=>{
  if(req.session.auth){
    const loggedInUserID = req.session.auth.userId;
    const followers = await db.Follow.findAll({
      where: {
        followerUserID: loggedInUserID
      },
      include:[{
        model: db.User,
      }]
    })
  }
  else {
    res.redirect('/users/login');
  }

}))

router.get('/follow/:id(\\d+)', asyncHandler(async (req,res)=>{
  if(!req.session.auth){
    res.status(301).end();
    return;
  }
  const userToFollowID = parseInt(req.params.id, 10);
  const loggedInUserID = req.session.auth.userId //.userId is placed in res from login in auth.js
  //make sure user is authenticated and user ID is not itself.
  if ((req.session.auth && userToFollowID !== loggedInUserID)){
    //TODO: Verify that the relationship does not exist, if it does exist, send back status error 401;

    //add the follow relationship to db. create the following record
    const follow = await db.Follow.create({followBelongsToUserID:userToFollowID, followerUserID:loggedInUserID})
    res.json({follow});
  }
  else{
    res.status(401).end();
  }
}));

router.delete('/follow/:id(\\d+)', asyncHandler(async (req,res,next)=>{
  const userToUnfollowID = parseInt(req.params.id, 10);
  const loggedInUserID = req.session.auth.userId
  if ((req.session.auth && userToUnfollowID !== loggedInUserID)){
    //TODO: Verify that the relationship does not exist, if it does exist, send back status error 401;
    const follow = await db.Follow.findOne({
      where:{
        [Op.and]: [
          { followBelongsToUserID: userToUnfollowID },
          { followerUserID:loggedInUserID }
        ]
      }
    })
    if(follow){
      await follow.destroy()
      res.status(204).end();
    }
  }
  else{
    next(unfollowNotFoundError(userToUnfollowID));
  }

}));
const unfollowNotFoundError = unfollow =>{
  const err = Error('no valid unfollow request');
  err.title = "unfollow not found";
  err.status = 404;
  return err;
}




module.exports = router;
