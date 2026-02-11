const https = require('https');
const querystring = require('querystring');


module.exports = {
    postRequest: (baseUrl, port, path, data) => {
        return new Promise((resolve, reject) => {
            const postData = querystring.stringify(data);

            const option = {
                hostname: baseUrl,
                port: port,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }
            const request = https.request(option, function(response) {
                let body = '';

                response.on('data', function(chunk) {
                    body += `${chunk}`;
                });

                response.on('end', function() {
                    const parsed = JSON.parse(body);

                    if (response.statusCode === 200) {
                        resolve({
                            status: true,
                            msg: 'ok',
                            data: parsed
                        });
                    } else {
                        resolve({
                            status: false,
                            msg: 'Server is not responding.'
                        });
                    }
                });
            });

            request.on('error', (e) => {
                resolve({
                    status: false,
                    msg: e.message
                });
            });

            request.write(postData);
            request.end();
        });
    },

    getRequest: (baseUrl, port, path) => {
        return new Promise((resolve, reject) => {

            const option = {
                hostname: baseUrl,
                port: port,
                path: path,
                method: 'GET',
            }
            const request = https.request(option, function(response) {
                let body = '';

                response.on('data', function(chunk) {
                    body += `${chunk}`;
                });

                response.on('end', function() {
                    const parsed = JSON.parse(body);

                    if (response.statusCode === 200) {
                        resolve({
                            status: true,
                            msg: 'ok',
                            data: parsed
                        });
                    } else {
                        resolve({
                            status: false,
                            msg: 'Server is not responding.'
                        });
                    }
                });
            });

            request.on('error', (e) => {
                resolve({
                    status: false,
                    msg: e.message
                });
            });

            request.end();
        });
    }
}