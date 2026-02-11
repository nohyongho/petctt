const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {


    getadminwallet: (body) => {
        const response = validator(body, {

        });
        return response;
    },


    sendfiat: (body) => {
        const response = validator(body, {
            referrence_txn_id: JOI.number().allow(null),
            amount_krw: JOI.number().required(),
            comments: JOI.string().optional().allow(''),
        });
        return response;
    },

    sendcrypto: (body) => {
        const response = validator(body, {
            referrence_txn_id: JOI.number().allow(null),
            amount_crypto: JOI.number().required(),
            fee_crypto: JOI.number().optional(),
            txn_type: JOI.string().required(),
            blockchain_address: JOI.string().required(),
            comments: JOI.string().required(),
            coin_id: JOI.number().required(),
        });
        return response;
    },

    Topupwalletcrypto: (body) => {
        const response = validator(body, {
            amount_crypto: JOI.number().required(),
            blockchain_address: JOI.string().required(),
            comments: JOI.string().optional().allow(''),
            coin_id: JOI.number().required(),
        });
        return response;
    },

    canceltransaction: (body) => {
        const response = validator(body, {
            txn_id: JOI.number().required(),
        });
        return response;
    },



};