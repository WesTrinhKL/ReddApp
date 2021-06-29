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

// router.post('/create-post', requireAuth, csrfProtection, asyncHandler(async (req, res) => {

//     console.log('inside create POST')
//     if (req.session.auth) {
//         const { userId } = req.session.auth
//         const { header, content } = req.body;
//         const post = await db.Post.build({ header, content, userId });
//         await post.save();
//         // res.render('post', {
//         //     title: 'Create New Post',
//         //     post,
//         //     csrfToken: req.csrfToken(),
//         // })
//         res.redirect('/');

//     } else {
//         res.redirect('/');
//     }
// }))


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




module.exports = router

// router.post('/', csrfProtection, asyncHandler(async (req, res, next) => {
