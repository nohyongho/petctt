/** Model */
const User = require('../models/User');
const Role = require('../models/Role');
const Country = require('../models/CountryList');
const State = require('../models/StateList');
const City = require('../models/CityList');
const UserAddress = require('../models/UserAddress');


/** Library */
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const JOI = require('joi');


/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');


const UserController = () => {

    const addAddress = async (req, res) => {
        var createAddress = null;
        try {

            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                countryId: JOI.number().integer().optional(),
                stateId: JOI.number().integer().optional(),
                cityId: JOI.number().integer().optional(),

                cityName: JOI.string().max(40).optional(),
                landLineNumber: JOI.string().max(15).optional(),
                mobileNumber: JOI.string().max(15).optional(),
                type: JOI.string().valid('Home', 'Work', 'Hotel', 'Other').optional(),
                fullAddress: JOI.string().max(300).optional(),
                flatNumber: JOI.string().max(10).optional(),
                floor: JOI.string().max(4).optional(),
                landmark: JOI.string().max(45).allow('').optional(),
                buildingName: JOI.string().max(50).optional(),
                postalCode: JOI.string().max(10).optional(),
                isDefault: JOI.boolean().optional(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            body.userId = user.data.user_id;
            createAddress = await UserAddress.create(
                body
            );

            if (createAddress && createAddress.addressId) {

                if (body.isDefault) {
                    UserAddress.update({
                        isDefault: false,
                    }, {
                        where: {
                            userId: body.userId,
                            addressId: {
                                [Op.not]: createAddress.addressId
                            }
                        }
                    });
                };

                return response.successOther(res, "Address added successfully", createAddress.addressId);
            } else
                return response.error(res, "Address could not be added");

        } catch (error) {
            console.log('Error::', error);
            if (createAddress)
                createAddress.destroy();
            return response.error(res, error.message);
        }
    };
    const getAddresses = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }
            body.userId = user.data.user_id;

            let addressList = await UserAddress.findAll({
                where: {
                    userId: body.userId, //user.data.user_id,
                    isAddressDeleted: false,
                },
                include: [{
                        required: false,
                        model: Country,
                        attributes: ["country_name"]
                    },
                    {
                        required: false,
                        model: City,
                        attributes: ["city_name"]
                    },
                    {
                        required: false,
                        model: State,
                        attributes: ["state_name"]
                    }
                ],
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            });

            return response.success(res, constant.SUCCESS, addressList);

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }
    };
    const getAddressById = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                addressId: JOI.number().integer().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            body.userId = user.data.user_id;

            let address = await UserAddress.findOne({
                where: {
                    userId: body.userId, //not necessary though, TAK
                    addressId: body.addressId,
                    isAddressDeleted: false,
                },
                include: [{
                        required: false,
                        model: Country,
                        attributes: ["country_name"]
                    },
                    {
                        required: false,
                        model: City,
                        attributes: ["city_name"]
                    },
                    {
                        required: false,
                        model: State,
                        attributes: ["state_name"]
                    }
                ],
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            });

            if (address)
                return response.success(res, constant.SUCCESS, address);
            else
                return response.error(res, "Address not found");

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };
    const updateAddress = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                countryId: JOI.number().integer().optional(),
                stateId: JOI.number().integer().optional(),
                cityId: JOI.number().integer().optional(),

                landLineNumber: JOI.string().max(15).optional(),
                mobileNumber: JOI.string().max(15).optional(),
                type: JOI.string().valid('Home', 'Work', 'Hotel', 'Other').optional(),
                fullAddress: JOI.string().max(300).optional(),
                flatNumber: JOI.string().max(10).optional(),
                floor: JOI.string().max(4).optional(),
                landmark: JOI.string().max(45).optional(),
                buildingName: JOI.string().max(50).optional(),
                postalCode: JOI.string().max(10).optional(),
                isDefault: JOI.boolean().optional(),
                addressId: JOI.number().integer().required(),

            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            body.userId = user.data.user_id;

            UserAddress.update(body, {
                where: {
                    id: body.addressId,
                    userId: body.userId,
                }
            }).then(() => {
                if (body.isDefault) {
                    UserAddress.update({
                        isDefault: false,
                    }, {
                        where: {
                            userId: body.userId,
                            addressId: {
                                [Op.not]: body.addressId
                            }
                        }
                    });
                };
                return response.success(res, "Address updated successfully");
            }).catch((err) => {
                console.log('Error::', err);
                return response.error(res, "Address could not be updated");
            });

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };
    const deleteAddress = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                addressId: JOI.number().integer().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }
            body.userId = user.data.user_id;

            let address = await UserAddress.findOne({
                where: {
                    userId: body.userId, //not necessary though, TAK
                    addressId: body.addressId,
                },
                attributes: ['addressId', 'isAddressDeleted']
            });

            if (address && address.addressId) {
                if (address.isAddressDeleted != undefined && !address.isAddressDeleted) {
                    address.isAddressDeleted = true;
                    address.save();
                }
                return response.success(res, "Address deleted successfully");
            } else
                return response.error(res, "Address could not be deleted or found");

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }
    };

    const setDefaultAddress = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                addressId: JOI.number().integer().required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }
            body.userId = user.data.user_id;

            let address = await UserAddress.findOne({
                where: {
                    userId: body.userId, //not necessary though, TAK
                    addressId: body.addressId,
                },
                attributes: ['addressId', 'isDefault']
            });

            if (address && address.addressId) {
                UserAddress.update({
                    isDefault: false,
                }, {
                    where: {
                        userId: body.userId,
                        addressId: {
                            [Op.not]: address.addressId
                        }
                    }
                }).then(() => {
                    address.isDefault = true;
                    address.save();
                })
                return response.success(res, "Address set to default successfully");
            } else
                return response.error(res, "Address could not be set to default or not found");

        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }
    };


    return {
        addAddress,
        getAddresses,
        getAddressById,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    };

};

module.exports = UserController;