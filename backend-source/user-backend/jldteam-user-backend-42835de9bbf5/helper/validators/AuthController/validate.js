const JOI = require('joi');
const validator = require('../../validator');


module.exports = {
    registration_body: (body) => {
        const response = validator(body, {
            email: JOI.string().email().required(),
            full_name: JOI.string().min(3).max(50).required(),
            contact_no: JOI.string().trim().regex(/^\+(?:[0-9]●?){6,16}[0-9]$/).required(),
            password: JOI.string().min(8).max(20).required(),
            country_id: JOI.number().min(1).required(),
        });
        return response;
    },
    login_body: (body) => {
        const response = validator(body, {
            email: JOI.string().email().required(),
            password: JOI.string().required(),
        });
        return response;
    },

    verify_email_body: (body) => {
        const response = validator(body, {
            code: JOI.string().required(),
        });
        return response;
    },
    email: (body) => {
        const response = validator(body, {
            email: JOI.string().email({ minDomainAtoms: 2 }).required(),
        });
        return response;
    },
    contactsArray: (body) => {
        const response = validator(body, {
            contacts: JOI.array().required()
        });
        return response;
    },
    reset_password_body: (body) => {
        const response = validator(body, {
            old_password: JOI.string().required(),
            password: JOI.string().min(8).max(20).required(),
            confirm_password: JOI.any().valid(JOI.ref('password')).required().options({ language: { any: { allowOnly: 'Must match password.' } } }),
        });
        return response;
    },
    changePassword: (body) => {
        const response = validator(body, {
            oldPassword: JOI.string().required(),
            newPassword: JOI.string().min(8).max(20).required(),
            confirmPassword: JOI.string().min(8).max(20).required(),
        });
        return response;
    },
    verifyAndResetPassword: (body) => {
        const response = validator(body, {
            code: JOI.string().required(),
            email: JOI.string().email({ minDomainAtoms: 2 }).required(),
            password: JOI.string().required(),
            confirmPassword: JOI.string().min(8).max(20).required()
        })
        return response;
    },
    update_profile_body: (body) => {
        const response = validator(body, {
            full_name: JOI.string().min(3).max(50).required(),
            age: JOI.number().optional().min(1).max(120),
            gender: JOI.string().optional().allow('').max(12),
            postal_code: JOI.string().optional().allow('').max(6),
            address: JOI.string().optional().allow('').max(100),
            image: JOI.string().optional().allow(''),
            country_id: JOI.number().required(),
            state_id: JOI.number().optional().allow(''),
            city_id: JOI.number().optional().allow('')
        });
        return response;
    }
};