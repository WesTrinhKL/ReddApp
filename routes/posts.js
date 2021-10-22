const express = require('express');
const { csrfProtection, asyncHandler } = require('./utils');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../auth');
const db = require('../db/models');
const { Op } = require("sequelize");

const router = express.Router();

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
        // res.render('post', {
        //     Title: 'Your Feed',
        //     post,
        //     csrfToken: req.csrfToken()
        // });
        res.redirect('/posts/feed')
    } else {
        res.redirect('/');
    }
}));

router.get('/feed', asyncHandler(async (req, res) => {

    const user = res.locals.user

    //@Notes: gets all the normal posts
    const allPosts = await db.Post.findAll({
        attributes: ['id','header', 'content'],
        include: { model: db.User, as: 'user' },
        limit: 20,
        order:  [['updatedAt', 'DESC']],
    })
    //@Notes: if logged in, grab posts where user is following those people
    let allPostsThatUserIsFollowing;
    if(req.session.auth){
        const getAllPeopleTheUserIsFollowing = await db.Follow.findAll({
            where:{
                followerUserID: req.session.auth.userId,
            },
            attributes: ['followBelongsToUserID'],

        })

        const arrayOfFollowingId = getAllPeopleTheUserIsFollowing.map((user)=>{
            return user['followBelongsToUserID'];
        })

        allPostsThatUserIsFollowing = await db.Post.findAll({
            where:{
                userId: arrayOfFollowingId
            },
            include: { model: db.User, as: 'user' },
            limit: 20,
            order:  [['updatedAt', 'DESC']],
        })
        console.log("all posts the user is following", allPostsThatUserIsFollowing);
    }

    if (req.session.auth) {
        res.render('feed', {
            Title: `${user.username} Feed`,
            allPosts,
            allPostsThatUserIsFollowing,
        })
    } else {
        res.render('feed', {
            Title: 'Global Feed',
            allPosts,
            allPostsThatUserIsFollowing,
        })
    }
}
));

router.get("/feed/:id(\\d+)", requireAuth, csrfProtection, asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const post = await db.Post.findByPk(postId);
    if (req.session.auth) {
        const { userId } = req.session.auth;
        const user = await db.User.findByPk(userId);
    }
    res.render("one-post", {
        Title: 'User\'s Post',
        post,
        csrfToken: req.csrfToken(),
    });

}));

// router.post("/feed//:id(\\d+)", csrfProtection, asyncHandler(async (req, res) => {
//     console.log('white space')
//     const postId = parseInt(req.params.id, 10);
//     console.log(postId);
//     const post = await db.Post.findByPk(postId);
//     res.render("one-post"
//     post,
//     csrfToken: req.csrfToken(),

// }));

const commentValidator = [
    check('content')
        .exists({ checkFalsy: true })
        .withMessage('Please provide value for the Comment field.')
        .isLength({ max: 255 })
        .withMessage('Comment cannot be more than 255 characters long')
];

router.get('/feed/:id(\\d+)/create-comment', requireAuth, asyncHandler(async (req, res, next) => {
    if (req.session.auth) {
        const postId = parseInt(req.params.id, 10);
        const post = await db.Post.findByPk(postId);
        const userId = req.session.auth.userId
        const originalPoster = post.userId;
        const originalUser = await db.User.findByPk(originalPoster);

        const allComments = await db.Comment.findAll({
            order: [
                ['id', 'DESC'],
            ],
            attributes: ['id', 'content', 'userId', 'postId'],
            include: { model: db.User, as: 'user' },


        })
        const comment = await db.Comment.build() //CREATE EMPTY COMMENT INSTANCE, VIEW BELOW WILL INITIALLY RENDER EMPTY USER FIELDS
        res.render('create-comment', {
            title: '',
            comment,
            postId,
            userId,
            post,
            originalUser,
            allComments,
        })
    } else {
        res.redirect('/')
    }

}));

router.post('/feed/:id(\\d+)/create-comment', commentValidator, asyncHandler(async (req, res) => {
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
        res.redirect(`/posts/feed/${postId}/comments`)
    } else {
        const errors = validationErrors.array().map((error) => error.msg);
        res.render('create-comment', {
            title: 'user-comment',
            comment,
            errors,
        })
    }
}))

router.get('/feed/:id(\\d+)/comments', requireAuth, asyncHandler(async (req,res) => {
    if (req.session.auth) {
        const postId = parseInt(req.params.id, 10);
        const post = await db.Post.findByPk(postId);
        const userId = req.session.auth.userId
        const originalPoster = post.userId;
        const originalUser = await db.User.findByPk(originalPoster);

        const allComments = await db.Comment.findAll({
            order: [
                ['id', 'DESC'],
            ],
            attributes: ['id', 'content', 'userId', 'postId'],
            include: { model: db.User, as: 'user' },
        })

        const comment = db.Comment.build()
        const user = res.locals.user
        res.render('comment', {
            title: '',
            comment,
            postId,
            userId,
            post,
            originalUser,
            allComments,
        })
    } else {
        res.redirect('/');
    }
}))


router.get('/feed/:id(\\d+)/edit', requireAuth, asyncHandler(async (req, res) => {
    console.log(req.session.auth)
    const postId = parseInt(req.params.id, 10)
    const post = await db.Post.findByPk(postId)
    const { userId } = req.session.auth;
    const user = await db.User.findByPk(userId);
    res.render('edit-posts', {
        title: "Edit Post",
        post,
        user,
    })
}))
router.post('/feed/:id(\\d+)/edit', csrfProtection, requireAuth, asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id, 10)
    const postToUpdate = await db.Post.findByPk(postId)
    const user = await db.User.findByPk(userId);
    const { header, content } = req.body
    const { userId } = req.session.auth
    const newPost = {
        header,
        content,
        userId,
    }

    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await postToUpdate.update(newPost);
        await postToUpdate.save();
        res.redirect(`/feed/${postId}`);
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        res.render('edit-posts', {
            title: 'Edit Post',
            post: { ...newPost, id: postId },
            errors,
            csrfToken: req.csrfToken(),
        });
    }
    // const user = await db.User.findByPk(userId);
    // if (postId == userId) {
    //     res.render('edit-posts', {
    //         title: "Edit Post",
    //         post,
    //         csrfToken: req.csrfToken(),
    //     })
    // }
}))

module.exports = router
