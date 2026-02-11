/** Model */
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const Country = require('../models/CountryList');
const Products = require('../models/Products');
const Categories = require('../models/Categories');
const ProductTypesMP = require('../models/ProductTypesMP');
const ProductTypes = require('../models/ProductTypes');





const State = require('../models/StateList');
const City = require('../models/CityList');
const TimeTable = require('../models/TimeTable');
/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/OutletValidator');
const commonConstants = require('../constants/commonConstants');
const JOI = require('joi');
const Sequelize = require('sequelize');


const OutletController = () => {

    const allOutletList = async (req, res) => {
        try {
            const {
                user
            } = req;
            const validationResponse = validate.outletList(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let brand = await Brand.findOne({
                where: {
                    user_id: user.data.user_id
                }
            });


            if (brand !== null) {
                let Outlets = await Outlet.findAll({
                    where: {
                        brand_id: brand.id
                    },
                    include: [{
                            model: Country
                        },
                        // { model: State },
                        {
                            model: City
                        }, {
                            model: Brand
                        }
                    ],
                    limit: parseInt(req.body.limit),
                    offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
                });
                let recordsTotal = 0;
                let recordsFiltered = 0;
                if (Outlets.length != 0) {
                    recordsTotal = Outlets.length;
                    recordsFiltered = Outlets.length;
                    Outlets = Outlets.map(Element => {
                        return {
                            id: Element.id,
                            name: Element.outlet_name,
                            address: Element.address,
                            phoneNumber: Element.phone_number,
                            createdAt: Element.createdAt,
                            status: Element.status ? 'Active' : 'Blocked',
                            country: {
                                name: Element.CountryList ? Element.CountryList.country_name : '',
                                sortName: Element.CountryList ? Element.CountryList.sort_name : '',
                            },
                            // state: {
                            //     name: Element.StateList ? Element.StateList.state_name : '',
                            // },
                            city: {
                                name: Element.CityList ? Element.CityList.city_name : '',
                            },
                            brand: {
                                id: Element.Brand.id,
                                name: Element.Brand.brand_name,
                                image: Element.Brand.image
                            }
                        };
                    });

                    console.log(Outlets);
                    return response.successDT(res, constant.SUCCESS, Outlets, recordsTotal, recordsFiltered);
                } else {
                    return response.error(res, constant.OUTLET_NOTFOUND);
                }

            } else {

                return response.error(res, constant.BRAND_NOTFOUND);

            }
        } catch (error) {
            console.log('Error:::', error);
            return response.error(res, error.message);
        }

    };
    const createOutlet = async (req, res) => {

        console.log(req.body);
        try {
            const {
                user
            } = req;
            const validationResponse = validate.createOutlet(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            /**inserting outlet record */
            let newOutlet = await Outlet.create({
                outlet_name: req.body.outlet_name,
                postal_code: req.body.postal_code,
                address: req.body.address,
                phone_number: req.body.phone_number,
                brand_id: req.body.brand_id,
                country_id: req.body.country_id,
                // state_id: req.body.stateId,
                city_id: req.body.city_id,
                //  area: req.body.area,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                status: true,
                is_deleted: false,
                user_id: user.data.user_id

            });
            if (!newOutlet) {
                return response.error(res, constant.SERVER_ERROR);
            }
            /**inserting outlet opening and closing timetabe multiple record with newly created outlet record id */
            // req.body.timeTable.forEach(async (element) => {
            //     await TimeTable.create({
            //         opening: element.open,
            //         closing: element.close,
            //         day: element.value,
            //         outlet_id: newOutlet.id
            //     });
            // });
            return response.successMsg(res, constant.OUTLET_CREATED);

        } catch (error) {
            console.log('Error:::', error);
            return response.error(res, error.message);
        }

    };

    const getOutletItems = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            //verify post data via joi.workaround since post data not awailable without processing via multer first.TAK
            const JoiResponse = JOI.validate(body, {
                outletId: JOI.number().min(1).required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var result = {};


            let outletObj = await Outlet.findOne({
                where: {
                    id: body.outletId,
                    status: true,
                    is_deleted: false,
                },
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include: {
                    attributes: ["id", "city_name"],
                    model: City,
                }
            });

            let catArray = await Categories.findAll({
                where: Sequelize.where(
                    Sequelize.literal('Products.outlet_id'),
                    '=',
                    Sequelize.literal(body.outletId),
                ),
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include: [{
                    model: Products,
                    required: false,
                    where: {
                        outlet_id: body.outletId,
                        is_deleted: false,
                        status: true,
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    },
                    include: [{
                        attributes: [],
                        model: Outlet,
                        where: {
                            status: true,
                            is_deleted: false,
                            id: body.outletId
                        }
                    }, {
                        required: false,
                        model: ProductTypesMP,
                        attributes: ["id"],
                        include: {
                            required: false,
                            model: ProductTypes,
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "id"]
                            },
                        }
                    }]
                }],
                order: [
                    ['title', 'ASC'],
                    [{
                        model: Products
                    }, 'product_name', 'asc']
                ],

            });

            result.outletData = outletObj || null;
            result.categories = catArray || null;
            return response.success(res, constant.SUCCESS, result);
        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getNearByOutlets = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            //verify post data via joi.workaround since post data not awailable without processing via multer first.TAK
            const JoiResponse = JOI.validate(body, {
                latitude: JOI.number().precision(7).required(),
                longitude: JOI.number().precision(7).required(),
                countryIso: JOI.string().max(5).required(),
                city: JOI.string().max(45).allow('').optional(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            var lat = body.latitude; //"25.1841827";
            var lng = body.longitude; //"55.2600601";
            var unitDistance = 6371000; //6371000 = meter, 6371 km , 3959 = miles
            var nearByRangeLimitInMeters = 500000; //6000;

            let outletObj = await Outlet.findAll({
                attributes: {
                    include: [
                        [`(${unitDistance} * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`, 'distance']
                    ]
                },
                where: Sequelize.where(
                    Sequelize.literal(`(${unitDistance} * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`),
                    '<=',
                    Sequelize.literal(nearByRangeLimitInMeters + ' and Outlet.status = 1 and ' +
                        'Outlet.id = `Brand->Category->Children->Products`.`outlet_id` AND Outlet.brand_id= `Brand->Category->Children->Products`.`brand_id` AND Outlet.is_deleted=false '),
                ),

                include: {
                    required: true,
                    model: Brand,
                    where: {
                        // category_id: commonConstants.commonConstants.FOOD_CAT_ID,
                        is_deleted: false,
                    },
                    include: {
                        model: Categories,
                        include: {
                            model: Categories,
                            as: 'Children',
                            include: {
                                model: Products,
                                where: {
                                    is_deleted: false,
                                    status: true,
                                },
                                include: {
                                    required: false,
                                    model: ProductTypesMP,
                                    attributes: ["id"],
                                    include: {
                                        required: false,
                                        model: ProductTypes,
                                        attributes: {
                                            exclude: ["createdAt", "updatedAt", "id"]
                                        },
                                    }
                                }
                            }
                        }
                    },
                },
                order: [Sequelize.literal('distance asc')]
            });

            return response.success(res, constant.SUCCESS, outletObj);
        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    const getNearByOutletsTyped = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            //verify post data via joi.workaround since post data not awailable without processing via multer first.TAK
            const JoiResponse = JOI.validate(body, {
                latitude: JOI.number().precision(7).required(),
                longitude: JOI.number().precision(7).required(),
                countryIso: JOI.string().max(5).allow('').allow(null).required(),
                city: JOI.string().max(45).allow('').optional(),
                categoryId: JOI.number().min(0).integer().required(),
                productTypes: JOI.array().items(JOI.string().max(40).allow('')).required(),
                productTypeRequired: JOI.boolean().default(true).required(),
                nearbyRange: JOI.number().integer().min(1).max(1000000).allow(null).optional(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            if (!body.countryIso) {
                console.log("applying temp patch nd setting country to KR bcoz google map not working properly there. TAK")
                body.countryIso = 'KR';
            }

            var lat = body.latitude; //"25.1841827";
            var lng = body.longitude; //"55.2600601";
            var unitDistance = 6371000; //6371000 = meter, 6371 km , 3959 = miles
            var nearByRangeLimitInMeters = body.nearbyRange || 500000; //6000;

            var catArray = [];
            if (body.categoryId == 0) {
                const categoriesObj = await Categories.findAll({
                    where: {
                        parent_id: null,
                    },
                    attributes: ["id"],
                });
                if (categoriesObj)
                    categoriesObj.forEach(cat => {
                        catArray.push(cat.id)
                    });
            }

            let outletObj = await Outlet.findAll({
                attributes: {
                    include: [
                        [`(${unitDistance} * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`, 'distance']
                    ]
                },
                where: Sequelize.where(
                    Sequelize.literal(`(${unitDistance} * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`),
                    '<=',
                    Sequelize.literal(nearByRangeLimitInMeters + ' and Outlet.status = 1 and Outlet.country_code = \'' + body.countryIso + '\' and ' +
                        'Outlet.id = `Brand->Category->Children->Products`.`outlet_id` AND Outlet.brand_id= `Brand->Category->Children->Products`.`brand_id` AND Outlet.is_deleted=false '),
                ),

                include: {
                    required: true,
                    model: Brand,
                    where: {
                        // category_id: commonConstants.commonConstants.FOOD_CAT_ID,
                        is_deleted: false,
                        category_id: (body.categoryId != 0) ? body.categoryId : catArray
                    },
                    include: {
                        model: Categories,
                        include: {
                            model: Categories,
                            as: 'Children',
                            include: {
                                model: Products,
                                where: {
                                    is_deleted: false,
                                    status: true,
                                },
                                include: {
                                    required: body.productTypeRequired,
                                    model: ProductTypesMP,
                                    attributes: ["id"],
                                    include: {
                                        required: true,
                                        model: ProductTypes,
                                        where: {
                                            title: body.productTypes
                                        },
                                        attributes: {
                                            exclude: ["createdAt", "updatedAt", "id"]
                                        },
                                    }
                                }
                            }
                        }
                    },
                },
                order: [Sequelize.literal('distance asc')]
            });

            return response.success(res, constant.SUCCESS, outletObj);
        } catch (error) {
            console.log('Error::', error);
            return response.error(res, error.message);
        }

    };

    return {
        allOutletList,
        createOutlet,
        getOutletItems,
        getNearByOutlets,
        getNearByOutletsTyped
    };
};

module.exports = OutletController;