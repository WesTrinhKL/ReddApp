const express = require('express');
const { csrfProtection, asyncHandler } = require('./utils');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../auth');

const db = require('../db/models');
const router = express.Router();

router.get('/create-post', csrfProtection, asyncHandler(async (req, res) => {

    const post = await db.Post.build();
    res.render('post', {
        title: 'Create New Post',
        post,
        csrfToken: req.csrfToken(),
    })
}))

router.post('/create-post', requireAuth, csrfProtection, asyncHandler(async (req, res) => {

    if (req.session.auth) {
        const { userId } = req.session.auth
        const { header, content } = req.body;
        const post = await db.Post.build({ header, content, userId });
        await post.save();
        res.render('post', {
            Title: 'Your Feed',
            post,
            csrfToken: req.csrfToken()
        });
    } else {
        res.redirect('/');
    }
}));

router.get('/feed', requireAuth, asyncHandler(async (req, res) => {

    const allPosts = await db.Post.findAll({
        attributes: ['header', 'content']
    })
    // console.log(allPosts)
    const user = res.locals.user
    console.log("my-user", user)
        res.render('feed', {
            Title: `${user.username} Feed`,
            allPosts,
        })
}
));



module.exports = router
