const responseMessages = require('../helper/responseMessages');
const HttpStatus = require('http-status-codes');


module.exports = {
    success: (res, msg, data) => {
        logResponse(res, msg);
        return res.send({
            status: true,
            statusCode: 200,
            msg,
            data
        });
    },
    successOther: (res, msg, extra_1) => {
        logResponse(res, msg);
        return res.send({
            status: true,
            statusCode: 200,
            msg,
            extra_1
        });
    },
    successMsg: (res, msg) => {
        logResponse(res, msg);
        return res.send({
            status: true,
            statusCode: 200,
            msg
        });
    },
    recordAlreadyExist: (res, req) => {
        logResponse(res, "recordAlreadyExist");
        return res.send({
            status: false,
            statusCode: 200,
            msg: responseMessages.getter(req, 'records', 'alreadyExt')
        });
    },
    recordNotFound: (res, req) => {
        logResponse(res, "recordNotFound");
        return res.send({
            status: false,
            statusCode: 200,
            msg: responseMessages.getter(req, 'records', 'notFound')
        });
    },
    recordCreated: (res, req) => {
        logResponse(res, "recordCreated");
        return res.send({
            status: true,
            statusCode: 200,
            msg: responseMessages.getter(req, 'records', 'newRecord')
        });
    },
    recordUpdated: (res, req) => {
        logResponse(res, "recordUpdated");
        return res.send({
            status: true,
            statusCode: 200,
            msg: responseMessages.getter(req, 'records', 'updateRecord')
        });
    },
    recordDeleted: (res, req) => {
        logResponse(res, "recordUpdated");
        return res.send({
            status: true,
            statusCode: 200,
            msg: responseMessages.getter(req, 'records', 'deleteRecord')
        });
    },
    bodyNotFound: (res, msg) => {
        logResponse(res, msg);
        return res.send({
            status: false,
            statusCode: 406,
            msg
        });
    },
    unauthorized: (res, msg) => {
        logResponse(res, msg);
        return res.status(HttpStatus.UNAUTHORIZED).send({
            status: false,
            statusCode: HttpStatus.UNAUTHORIZED,
            msg: msg
        });
    },
    error: (res, msg) => {
        logResponse(res, msg);
        return res.send({
            status: false,
            statusCode: 409,
            msg,
        });
    },
    errorWithCode: (res, msg, statusCode) => {
        logResponse(res, msg);
        return res.send({
            status: false,
            statusCode: statusCode,
            msg,
        });
    },
    htmlTemplate: (res, template) => {
        return res.send(template);
    }
};

function logResponse(res, msg) {
    try {
        console.log({
            msg: msg,
            path: res.req.path,
            alphaB: (res.req.user) ? ((res.req.user.data) ? res.req.user.data.user_id + "TAK" : "1noTAK") : "2noTAK",
            ip: res.req.headers['x-real-ip'] || res.req.ip
        });
    } catch (error) {
        console.log("error logging res logs. " + error.message + " TAK");
    }
}