const jwt = require('jsonwebtoken');

const secret = process.env.NODE_ENV === 'production' ? 'takSecret@8429' : 'secret';

const secret_refresh = process.env.NODE_ENV === 'production' ? 'refreshTokenTAK@jld' : 'secret';;

module.exports = {
  issue_token: (payload) => jwt.sign(payload, secret, {
    expiresIn: '30d'
  }), // 10*1000 = 10 seconds// 10m= 10 minutes, 30d = 30 days. Tahir
  issue_refresh_token: (payload) => jwt.sign(payload, secret_refresh, {
    expiresIn: '60d'
  }),
  verify_token: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function (err, decode) {
        if (err) {
          // console.log(err);
          resolve({
            status: false,
            msg: err.message
          });
        } else {
          resolve({
            status: true,
            msg: 'ok',
            data: decode
          });
        }
      });
    });

  },
  verify_refresh_token: (token) => jwt.verify(token, secret_refresh)
};