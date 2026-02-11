const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {


   



    ordersList: (body)=>{

        const response = validator(body, {
            type: JOI.string().required(),
            brand_id:JOI.number().required(),
            limit: JOI.number().required(),
            page: JOI.number().required(),
        });
        return response;
      

    },
       
    updateorderstatus: (body)=>{

        const response = validator(body, {
            status: JOI.string().required(),
            order_id:JOI.number().required(),
            
        });
        return response;
      

    }

    
    


};