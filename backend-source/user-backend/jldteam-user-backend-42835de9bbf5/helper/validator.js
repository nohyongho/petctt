const JOI = require('joi');

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
        msg: 'ok',
        body: response.value
    };

};



module.exports = validator;