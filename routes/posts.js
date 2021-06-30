const express = require('express');
const { csrfProtection, asyncHandler } = require('./utils');
const { check, validationResult } = require('express-validator');
const { requireAuth, loginUser, logoutUser, restoreUser } = require('../auth');
const db = require('../db/models');

const router = express.Router();
const { Comment } = db;

router.get('/', csrfProtection, asyncHandler(async (req, res) => {
    res.redirect('/posts/feed')

}))

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

router.get('/feed', asyncHandler(async (req, res) => {

    const allPosts = await db.Post.findAll({
        attributes: ['header', 'content'],
        include: { model: db.User, as: 'user' }
    })
    // allPosts.forEach(post => {
    //     console.log(post.id)
    // })
    const user = res.locals.user

    if (req.session.auth) {
        res.render('feed', {
            Title: `${user.username} Feed`,
            allPosts,
        })
    } else {
        res.render('feed', {
            Title: 'Global Feed',
            allPosts,
        })
    }
}
));

router.get("/feed/:id(\\d+)", asyncHandler(async (req, res) => {

    const postId = parseInt(req.params.id, 10);
    console.log(postId)
    const post = await db.Post.findByPk(postId);
    console.log(post)
    res.render("one-post", {
        post
    });
}));

// router.post("/feed//:id(\\d+)", csrfProtection, asyncHandler(async (req, res) => {
//     console.log('white space')
//     // const postId = parseInt(req.params.id, 10);
//     // console.log(postId);
//     // const post = await db.Post.findByPk(postId);
//     // res.render("one-post"
//     // post,
//     // csrfToken: req.csrfToken(),

// }));

const commentValidator = [
    check('content')
        .exists({ checkFalsy: true })
        .withMessage('Please provide value for the Comment field.')
        .isLength({ max: 255 })
        .withMessage('Comment cannot be more than 255 characters long')
];

router.get('/comments', requireAuth, asyncHandler(async (req, res, next) => {
    if (req.session.auth) {
        const comment = db.Comment.build() //CREATE EMPTY USER INSTANCE, VIEW BELOW WILL INITIALLY RENDER EMPTY USER FIELDS
        res.render('comment', {
            title: 'user-comment',
            comment,
        })
    } else {
        res.redirect('/')
    }

}));

router.post('/comments', commentValidator, asyncHandler(async (req, res) => {
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

    const validationErrors = validationResult(req);
    if (validationErrors.isEmpty()) {
        await comment.save();
        res.redirect('/');
    } else {
        const errors = validationErrors.array().map((error) => error.msg);
        res.render('comment', {
            title: 'user-comment',
            comment,
            errors,
        })
    }
}))



module.exports = router
