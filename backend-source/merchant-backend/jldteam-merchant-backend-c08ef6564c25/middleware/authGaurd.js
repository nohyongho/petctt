/** Helper */
const authService = require('../services/auth.service');
const response = require('../helper/response');


module.exports = {
    authenticatePrivate: async (req, res, next) => {
        try {

            let token = req.headers.authorization;
            if (String(token).startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }
            if (token) {
                const decode = await authService.verify_token(token);

                if (decode.status) {
                    if (decode.data.role === 'admin' || decode.data.role === 'merchant') {
                        req.user = decode;
                        next();
                    } else {
                        return response.unauthorized(res, 'Unauthorized user.');
                    }
                } else {
                    return response.unauthorized(res, 'Authorization token expired.');
                }

            } else {
                return response.unauthorized(res, 'Invalid authorization token.');
            }

        } catch (error) {
            return response.unauthorized(res, error.message);
        }
    }
};