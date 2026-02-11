const jwt = require('jsonwebtoken');

const secret = process.env.NODE_ENV === 'production' ? 'toosecret' : 'secret';

const secret_refresh = 'refreshToken';

module.exports = {
  issue_token: (payload) => jwt.sign(payload, secret, { expiresIn: 2*24*60*60 }), // mm * ss 2*24*60*60
  issue_refresh_token: (payload) => jwt.sign(payload, secret_refresh, {}),
  verify_token: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function (err, decode) {
        if (err) {
          console.log(err);
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
  verify_refresh_token: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret_refresh, function (err, decode) {
        if (err) {
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
};
