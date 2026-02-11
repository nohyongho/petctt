const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {

    registrationBody: (body) => {
        const response = validator(body, {
            email: JOI.string().email().required(),
            full_name: JOI.string().min(3).max(50).required(),
            // contact_no: JOI.string().trim().regex(/^\+(?:[0-9]●?){6,16}[0-9]$/).required(),
            // address: JOI.string().min(10).max(200),
            password: JOI.string().min(8).max(20).required(),
            //   country_id: JOI.number().min(1).required(),
            //  brand_name: JOI.string().min(3).max(20).required(),
            //   brand_category: JOI.number().required(),
            //  brand_logo: JOI.string().required(),
            //  brand_number: JOI.string().required()
        });
        return response;
    },
    brandCreation: (body) => {
        const response = validator(body, {
            user_id: JOI.number().required(),
            brand_name: JOI.string().min(2).max(20).required(),
            brand_category: JOI.number().required(),
            // brand_logo: JOI.string().required(),
            country_code: JOI.string().required(),
            phone_number: JOI.string().required(),
            postal_code: JOI.string().required(),
            address: JOI.string().required(),
            country_id: JOI.number().required(),

        });
        return response;
    },
    branduser: (body) => {
        const response = validator(body, {

            user_id: JOI.number().required(),
        });
        return response;
    },



    brandupdate: (body) => {
        const response = validator(body, {

            brand_name: JOI.string().min(2).max(20).required(),
            brand_id: JOI.number().required(),
            // brand_logo: JOI.string().required(),
            phone_number: JOI.string().required(),
            country_code: JOI.string().required(),

            postal_code: JOI.string().required(),
            address: JOI.string().required(),

        });
        return response;
    },


    createOutletUserBody: (body) => {
        const response = validator(body, {
            email: JOI.string().email().required(),
            full_name: JOI.string().min(3).max(50).required(),
            contact_no: JOI.string().trim().regex(/^\+(?:[0-9]●?){6,16}[0-9]$/).required(),
            address: JOI.string().min(10).max(200),
            password: JOI.string().min(8).max(20).required(),
            country_id: JOI.number().min(1).required(),
            outletId: JOI.number().min(1).required()
        });
        return response;
    },
    loginBody: (body) => {
        const response = validator(body, {
            email: JOI.string().email().required(),
            password: JOI.string().required(),
        });
        return response;
    },
    email: (body) => {
        const response = validator(body, {
            email: JOI.string().email({ minDomainAtoms: 2 }).required(),
        });
        return response;
    },
    verifyAndResetPassword: (body) => {
        const response = validator(body, {
            code: JOI.string().required(),
            email: JOI.string().email({ minDomainAtoms: 2 }).required(),
            password: JOI.string().min(8).max(20).required(),
            confirmPassword: JOI.string().min(8).max(20).required()
        })
        return response;
    },


    verifyAndResetchangePassword: (body) => {
        const response = validator(body, {
            code: JOI.string().required(),
            password: JOI.string().min(8).max(20).required(),
            confirmPassword: JOI.string().min(8).max(20).required()
        })
        return response;
    },


    verifyEmailBody: (body) => {
        const response = validator(body, {
            code: JOI.string().required(),
        });
        return response;
    },

    verify_email_body: (body) => {
        const response = validator(body, {
            code: JOI.string().required(),
        });
        return response;
    },
    updateProfileBody: (body) => {
        const response = validator(body, {
            first_name: JOI.string().min(3).max(50).required(),
            last_name: JOI.string().min(3).max(50).required(),
            middle_name: JOI.string().optional().allow(''),
            age: JOI.number().optional().min(1).max(120),
            gender: JOI.string().optional().allow('').max(12),
            postal_code: JOI.string().optional().allow('').max(6),
            address: JOI.string().optional().allow('').max(100),
            phone_number: JOI.string().optional().allow('').max(14),
            image_data: JOI.string().optional().allow('').regex(/^(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+\.(jpg|jpeg)$/),
            country_id: JOI.number().required(),
            state_id: JOI.number().optional().allow(''),
            city_id: JOI.number().optional().allow('')
        });
        return response;
    }
};