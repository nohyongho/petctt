const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const config = require('./config');
const cors = require('cors');
const request = require('request');

const http = require('http');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '2048kb' }));
app.use(express.urlencoded({ extended: false, limit: '2028kb' }));
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/health', function (req, res) {
  res.send('Api ok');
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/pImage', express.static(path.join(__dirname, 'public/models/images/products/')));
app.use('/bImage', express.static(path.join(__dirname, 'public/models/images/brands/')));
app.use('/cImage', express.static(path.join(__dirname, 'public/models/images/coupons/')));
app.use('/catImage', express.static(path.join(__dirname, 'public/models/images/categories/')));

app.use('/auth', config.authRouter);
app.use('/user', config.couponRouter);
app.use('/coupon', config.couponRouter);
app.use('/common', config.commonRouter);
app.use('/campaign', config.campaignRouter);
app.use('/outlet', config.outletRouter);
app.use('/graph', config.graphRouter);
app.use('/products', config.productsRouter);
app.use('/orders', config.ordersRouter);
app.use('/wallet', config.walletRouter);
app.use('/transactions', config.transactionRouter);
app.use('/merchantorders', config.merchantordersRouter);
app.use('/coin', config.coinRouter);



app.get('/bucket/*', function (req, res) {
  try {
    const bucketUrl = 'https://coupontalktalk.s3-ap-southeast-1.amazonaws.com';
    const url = bucketUrl + req.url.replace('/bucket', '');
    request.get(url).pipe(res);
  } catch (error) {
    res.send({
      status: false,
      msg: error.message
    });
  }

});



app.route('/kouponlee/*').get((req, res, next) => {
  const options = {

    hostname: '127.0.0.1',

    port: 3004,

    path: req.url,

    method: 'GET',

  };

  const proxy = http.request(options, function (response) {

    res.writeHead(response.statusCode, response.headers);

    response.pipe(res, {

      end: true

    });

  });

  req.pipe(proxy, {

    end: true

  });

});


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