const { csrfProtection, asyncHandler } = require('./utils');
const express = require('express');
const db = require('../db/models');
const { check, validationResult } = require('express-validator');
const { requireAuth, loginUser, logoutUser, restoreUser } = require('../auth');
const router = express.Router();


router.get('/create-post', csrfProtection, asyncHandler(async (req, res) => {

    const post = await db.Post.build();
    res.render('post', {
        title: 'Create New Post',
        post,
        csrfToken: req.csrfToken(),
    })
}))

router.post('/create-post', csrfProtection, asyncHandler(async (req, res) => {
    const { username, header, content, createdAt } = req.body;
    const post = await db.Post.build({ username, header, content, createdAt });
    res.render('post', {
        title: 'Create New Post',
        post,
        csrfToken: req.csrfToken(),
    })

    // const validatorErrors = validationResult(req);
    // if (validatorErrors.isEmpty()) {
    //     await post.save();
    //     res.redirect('/create-post');
    // } else {
    //     const errors = validatorErrors.array().map((error) => error.msg);
    //     res.render('post', {
    //         title: 'Add Post',
    //         post,
    //         errors,
    //         csrfToken: req.csrfToken(),
    //     });
    // }
}));



module.exports = router

// router.post('/', csrfProtection, asyncHandler(async (req, res, next) => {


// }))
