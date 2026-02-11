const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {
    allUsersList: (body) => {
        const response = validator(body, {
            type: JOI.string().required(),
            length: JOI.number().required(),
            draw: JOI.number().optional().allow(''),
            search: JOI.object().optional().allow(''),
            columns: JOI.array().optional().allow(''),
            order: JOI.array().optional().allow(''),
            start: JOI.number().required(),
            userStatus: JOI.string().optional().allow(''),
            verified: JOI.string().optional().allow('')
        });
        return response;
    },
    searchUsers: (body) => {
        const response = validator(body, {
            type: JOI.string().required(),
            limit: JOI.number().required(),
            offSet: JOI.number().required(),
            orderBy: JOI.string().required(),
            order: JOI.string().required(),
            searchBy: JOI.string().required(),
            search: JOI.string().required(),
            userStatus: JOI.string().optional().allow(''),
            verified: JOI.string().optional().allow('')
        });
        return response;
    },
    filterUsers: (body) => {
        const response = validator(body, {
            type: JOI.string().required(),
            length: JOI.number().required(),
            start: JOI.number().required(),
            orderBy: JOI.string().required(),
            order: JOI.string().required(),
            startDate: JOI.string().required(),
            endDate: JOI.string().required(),
            userStatus: JOI.string().optional().allow(''),
            verified: JOI.string().optional().allow('')
        });
        return response;
    },
    userDetail:(body) => {
        const response = validator(body, {
            userId: JOI.number().required(),
        })
        return response;
    },
    updateUserStatus: (body) => {
        const response = validator(body, {
            userId: JOI.number().required(),
            status: JOI.string().required()
        })
        return response;
    },
    outletUsersList: (body) => {
        const response = validator(body, {
            limit: JOI.number().required(),
            page: JOI.number().required(),
        });
        return response;
    },
};