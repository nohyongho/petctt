const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {


    updateordertransactionid: (body)=>{

        const response = validator(body, {
           
            transaction_id:JOI.number().required(),

            merchant_order_id:JOI.number().required(),
            transaction_mode:JOI.string().required(),
            
            
        });
        return response;
      

    }

    
    


};