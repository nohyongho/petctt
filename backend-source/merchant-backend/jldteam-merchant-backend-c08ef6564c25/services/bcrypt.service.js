const bcrypt = require('bcrypt-nodejs');

module.exports = {
  password: (password) => {

    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  },

  comparePassword: (password, hash) => {
    const resp = bcrypt.compareSync(password, hash)
    return resp;
  },
};
