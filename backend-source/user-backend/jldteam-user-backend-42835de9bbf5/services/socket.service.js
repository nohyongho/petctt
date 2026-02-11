const Sequelize = require('sequelize');
const sequelize = require('../../config/database');
const jwtDecode = require('jwt-decode');
const User = require('../models/User');

let io = null;
const connected_clients = [];

module.exports = {
    initialize_socket: (server) => {
        console.log('-------------------- Initializing socket --------------------');
        io = require('socket.io')(server);
        io.on('connection', function (socket) {

            socket.on('clientCredentials', function (data) {
                const connected_client_response = add_client(data, io);
                console.log(connected_client_response);
            })
        });
    },

    coin_collected: (coin_coordinates) => {
        if (longitude in coin_coordinates && latitude in coin_coordinates && campaign_id in coin_coordinates) {
            for (let i = 0; i < connected_clients.length; i++) {
                io.to(`${connected_clients[i].socket_id}`).emit('coinCollected', {
                    status: true,
                    msg: 'ok',
                    data: {
                        longitude: coin_coordinates.longitude,
                        latitude: coin_coordinates.latitude,
                        campaign_id: coin_coordinates.campaign_id
                    }
                });
            }
        }
    }
}


async function add_client(data, io) {
    if (token in data && socket_id in data) {
        const token = data.token;
        const socket_id = data.socket_id;
        var decoded = jwtDecode(token);

        if (id in decoded) {
            const user_id = decoded.id;
            const user = await User.findOne({
                where: {
                    id: user_id
                }
            });

            if (user) {
                if (user.session_token == token) {
                    connected_clients.push({
                        socket_id: socket_id,
                        email: user.email
                    });
                    return {
                        status: true,
                        msg: 'User verified and allowed to connect with socket.'
                    }
                } else {
                    return {
                        status: false,
                        msg: 'invalid token'
                    }
                }

            } else {
                return {
                    status: false,
                    msg: 'user not found'
                }
            }
        } else {
            return {
                status: false,
                msg: 'invalid data in token'
            }
        }
    }
}
