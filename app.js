var auth = require('./routes/auth');
var load = require('./routes/load');
var uninstall = require('./routes/uninstall');
var test = require('./routes/test');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const cors = require('cors');

var app = express();
app.use(cors({
  origin: 'https://mondo-contract.mybigcommerce.com'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/download', (req, res) => {
  var queries = req.query;
  const filePath = path.join(__dirname, 'public', 'uploads', queries['filename']);

  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/auth', auth);
app.use('/load', load);
app.use('/uninstall', uninstall);
app.use('/test', test);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
