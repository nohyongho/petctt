const constants = require('../constants/commonConstants');
var FirebaseMsg = require('fcm-node');


/*
Android In App notification utility.
TAK
*/

function FirebaseMessaging(userFcm, title, message, jsonData) {
    this.userFcm = userFcm;
    this.title = title;
    this.message = message;
    this.jsonData = jsonData;
    this.firebaseMsg = new FirebaseMsg(constants.commonConstants.serverKey);
};

FirebaseMessaging.prototype.send = function() {
    // console.log("preparing to send in app notification. TAK")
    var message = {};

    message.to = this.userFcm;
    message.collapse_key = 'your_collapse_key';
    message.notification = {
        title: this.title,
        body: this.message,
        data: this.jsonData
    };
    message.data = { //you can send only notification or only data(or include both). TAK
        title: this.title,
        body: this.body,
        message: this.message,
        data: this.jsonData
    };

    if (this.userFcm instanceof Array) { //for sending to multiple android devices. TAK
        delete message.to;
        var deviceIdsArray = [];
        while (this.userFcm.length > 0) {
            deviceIdsArray.push(this.userFcm.splice(0, 1000)); //1000 because firebase can send notification to 1000 device at once.TAK
        }
        deviceIdsArray.forEach(fcmIds => {
            message.registration_ids = fcmIds;
            this.firebaseMsg.send(message, function(err, response) {
                if (err) {
                    console.log("TAK. Something has gone wrong while sending notification to android devices.!", err);
                } else {
                    console.log("Successfully sent in app notification with response: ", response);
                }
            });
        });

    } else {
        this.firebaseMsg.send(message, function(err, response) {
            if (err) {
                console.log("TAK. Something has gone wrong while sending notification to android devices.!", err);
            } else {
                console.log("Successfully sent in app notification with response: ", response);
            }
        });
    }

};

module.exports = FirebaseMessaging;