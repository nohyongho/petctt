const usersRouter = require('../routes/users');
const authRouter = require('../routes/auth');
const couponRouter = require('../routes/coupon');
const commonRouter = require('../routes/common');
const outletRouter = require('../routes/outlet');
const addresRouter = require('../routes/addressRoute');
const ordersRouter = require('../routes/ordersRoute');
const fcmRoutes = require('../routes/fcmRoute');
const walletRoutes = require('../routes/walletRoutes');
const transactionRoutes = require('../routes/transactionRoutes');
const rewardRoutes = require('../routes/rewardRoutes');
const markerRoutes = require('../routes/markerRoutes');



const dotenv = require('dotenv');
dotenv.config();


module.exports = {
    usersRouter,
    authRouter,
    couponRouter,
    commonRouter,
    outletRouter,
    addresRouter,
    ordersRouter,
    fcmRoutes,
    walletRoutes,
    transactionRoutes,
    rewardRoutes,
    markerRoutes,
    language: 'english',

    host: 'http://127.0.0.1',
    port: '3002',

    migrate: false
};