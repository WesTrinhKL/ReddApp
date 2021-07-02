const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize } = require('./db/models');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const { sessionSecret } = require('./config');
const { restoreUser } = require('./auth');

const app = express();

// view engine setup
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json()); //parses requests w/ json payload
app.use(express.urlencoded({ extended: false }));//parses requests w/ incoming urlencoded payload
const store = new SequelizeStore({ db: sequelize });
store.sync();

app.use(session({
  secret: sessionSecret,
  store,
  resave: false,
  saveUninitialized: false,
}));

app.use(cookieParser(sessionSecret)); //parses cookies attached to client request

app.use(restoreUser); //middleware to attach user obj to res
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
