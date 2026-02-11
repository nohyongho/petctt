/** Config */
const keys = require('../config/keys');

/** Library */
const sendGrid = require('sendgrid');
const pug = require('pug');
const path = require('path');

/** Initializing sendgrid */
const sg = sendGrid('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');
const helper = sendGrid.mail;

const fromEmail = new helper.Email('noreply@coupontalktalk.com');


const sendEmail = (body, email, subject) => new Promise((resolve, reject) => {
    const toEmail = new helper.Email(email);
    const content = new helper.Content('text/html', body);
    const mail = new helper.Mail(fromEmail, subject, toEmail, content);
    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });
    sg.API(request, function(error, errorResponse) {
        if (error) {
            reject({ errorResponse });
        } else {
            resolve({ success: true });
        }
    });
});

const sendVerificationEmail = async(email, code, name) => {
    const link = `${keys.verificationLink.host}/auth/verifyEmail/${code}`;
    const templatePath = path.join(__dirname, '../views/userVerification.pug');
    const body = pug.renderFile(templatePath, { name, link });
    const mail = await sendEmail(body, email, keys.verificationLink.mailSubject);
    //console.log(email);
    //console.log("------------");
};

const sendForgotEmail = async(email, code) => {
    // const link = `${host_address}:${host_port}/user/verify/forgotPassword/${email}/${code}`;
    // const body = ejs.render(emailVerificationTemplate, { link });
    const body = `Your one time password to change credential is:\n ${code}`;
    await sendEmail(body, email, 'Coupon TalkTalk Forgot Password');
};


const sendSupportEmail = async(emailto, mailbody) => {
    // const link = `${host_address}:${host_port}/user/verify/forgotPassword/${email}/${code}`;
    // const body = ejs.render(emailVerificationTemplate, { link });

    await sendEmail(mailbody, emailto, 'Merchant Query');
};


const sendResetEmail = async(email, code) => {

    const body = `Your one time password to change credential is:\n ${code}`;
    await sendEmail(body, email, 'Coupon TalkTalk Reset Password');
};

const sendWalletRechargeRequestEmail = async() => {
    const body = pug.render('walletRechargeRequest', { title: 'Coin Hunter', description: 'Welcome to coinhunter api' });
    await sendEmail(body, email, 'Wallet Recharge Request');
};

module.exports = {
    sendVerificationEmail,
    sendResetEmail,
    sendForgotEmail,
    sendEmail,
    sendSupportEmail,
};