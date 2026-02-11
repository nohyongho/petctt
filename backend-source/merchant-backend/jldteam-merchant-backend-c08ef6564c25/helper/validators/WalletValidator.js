const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {


   


    getwallet: (body) => {
        const response = validator(body, {
        
        });
        return response;
    },


    
       

    
    


};