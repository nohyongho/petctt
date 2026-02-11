const JOI = require('joi');
const constant = require('../constants/ConstantMessages');

const validator = (body, schema) => {
    const response = JOI.validate(body, schema);
    if (response.error) {
        return {
            status: false,
            msg: response.error.details[0].message
        };
    }

    return {
        status: true,
        msg: constant.SUCCESS,
        body: response.value
    };

};



module.exports = validator;