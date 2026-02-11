const usersRouter = require('../routes/users');
const authRouter = require('../routes/auth');
const couponRouter = require('../routes/coupon');
const commonRouter = require('../routes/common');
const campaignRouter = require('../routes/campaign');
const outletRouter = require('../routes/outlet');
const graphRouter = require('../routes/graph');
const productsRouter = require('../routes/products');
const ordersRouter = require('../routes/orders');
const walletRouter = require('../routes/wallet');
const transactionRouter = require('../routes/transaction');
const merchantordersRouter = require('../routes/merchantorders');
const coinRouter = require('../routes/coin');


module.exports = {
    usersRouter,
    authRouter,
    couponRouter,
    commonRouter,
    campaignRouter,
    outletRouter,
    graphRouter,
    productsRouter,
    ordersRouter,
    walletRouter,
    transactionRouter,
    merchantordersRouter,
    coinRouter,

    host: 'http://127.0.0.1',
    port: '3002',
    migrate: false
};