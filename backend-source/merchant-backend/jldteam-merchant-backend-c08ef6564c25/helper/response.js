const constant = require('../constants/ConstantMessages');
module.exports = {
    success: (res, msg, data) => {
        return res.send({
            status: true,
            statusCode: 200,
            msg,
            data
        });
    },
    successDT: (res, msg, data, recordsTotal, recordsFiltered) => {
        return res.send({
            status: true,
            statusCode: 200,
            msg,
            data,
            recordsTotal,
            recordsFiltered
        });
    },
    successMsg: (res, msg) => {
        return res.send({ status: true, statusCode: 200, msg });
    },
    recordAlreadyExist: (res) => {
        return res.send({
            status: false,
            statusCode: 200,
            msg: 'Record already exist.'
        });
    },
    recordNotFound: (res) => {
        return res.send({
            status: false,
            statusCode: 200,
            msg: constant.NO_RECORD
        });
    },
    recordCreated: (res) => {
        return res.send({
            status: true,
            statusCode: 200,
            msg: 'New record has been created successfully.'
        });
    },
    recordUpdated: (res) => {
        return res.send({
            status: true,
            statusCode: 200,
            msg: 'Record has been updated successfully.'
        });
    },
    recordDeleted: (res) => {
        return res.send({
            status: true,
            statusCode: 200,
            msg: 'Record has been deleted successfully.'
        });
    },
    bodyNotFound: (res, msg) => {
        return res.send({
            status: false,
            statusCode: 406,
            msg
        });
    },
    unauthorized: (res, msg) => {
        return res.status(401).send({
            status: false,
            statusCode: 401,
            msg,
        });
    },
    error: (res, msg) => {
        return res.send({
            status: false,
            statusCode: 409,
            msg,
        });
    },
    htmlTemplate: (res, template) => {
        return res.send(template);
    }
};