const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const config = require('./config');
const cors = require('cors');

const http = require('http');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json({
  limit: '500kb'
}));
app.use(express.urlencoded({
  extended: false,
  limit: '500kb'
}));
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log((req.headers['x-real-ip'] || req.ip) + " .Log ip. TAK");
  return next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/health', function (req, res) {
  res.send('Api ok. TAK');
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/models', express.static(path.join(__dirname, 'public/models')));
app.use('/others', express.static(path.join(__dirname, 'public/others')));



app.use('/auth', config.authRouter);
app.use('/coupon', config.couponRouter);
app.use('/common', config.commonRouter);
app.use('/user', config.usersRouter);
app.use('/outlet', config.outletRouter);
app.use('/address', config.addresRouter);
app.use('/order', config.ordersRouter);
app.use('/fcm', config.fcmRoutes);
app.use('/wallet', config.walletRoutes);
app.use('/txn', config.transactionRoutes);
app.use('/reward', config.rewardRoutes);
app.use('/marker', config.markerRoutes);

// app.route('/kouponlee/*').get((req, res, next) => {
//   const options = {

//     hostname: '127.0.0.1',

//     port: 3001,

//     path: req.url,

//     method: 'GET',

//   };

//   const proxy = http.request(options, function (response) {

//     res.writeHead(response.statusCode, response.headers);

//     response.pipe(res, {

//       end: true

//     });

//   });

//   req.pipe(proxy, {

//     end: true

//   });

// });


app.use('/user', config.usersRouter);


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