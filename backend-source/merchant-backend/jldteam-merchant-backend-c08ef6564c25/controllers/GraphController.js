/** Models */
const User = require('../models/User');
const Role = require('../models/Role');
const CollectedCoupon = require('../models/CollectedCoupon');
const Coupon = require('../models/Coupon');
const Brand = require('../models/Brand');
const Categories = require('../models/Categories');


/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/OutletValidator');

/** Database */
const sequelize = require('../config/database');

/** Library */
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const GraphController = () => {
    /** Total registered user Super-Admin(admin) */
    const registeredUser = (req, res) => {
        const { user } = req;

        if (!user) {
            return response.unauthorized(res, 'Unauthorized');
        }
        /**Aggregate of all user */
        return User.findAll({
            attributes: [
                [sequelize.fn('COUNT', 'User.*'), 'value'],
                [sequelize.fn('date', sequelize.col('createdAt')), 'date']
            ],
            group: [sequelize.fn('date', sequelize.col('createdAt'))]
        }).then(data => {

            if (!data) {
                return response.recordNotFound(res);
            }

            const parsedData = data.map(ele => {
                return ele.toJSON();
            });

            return response.success(res, 'ok', parsedData);

        }).catch(error => {
            return response.error(res, error.message);
        });

    };
    /** User Role BAse summary For Super-Admin(admin) */
    const roleBasedUserSummary = (req, res) => {
        const { user } = req;

        if (!user) {
            return response.unauthorized(res, 'Unauthorized');
        }

        User.findAll({
            attributes: [
                [sequelize.fn('COUNT', 'User.*'), 'value'],
                [sequelize.col('Role.name'), 'title']
            ],
            include: [
                {
                    model: Role,
                    attributes: []
                }
            ],
            group: [sequelize.col('User.role_id')]
        }).then(data => {
            if (!data) {
                return response.recordNotFound(res);
            }

            const parsedData = data.map(ele => {
                return ele.toJSON();
            });

            return response.success(res, 'ok', parsedData);

        }).catch(error => {
            return response.error(res, error.message);
        });
    };
    /** Collected Coupons Summary for Super-Admin(admin) */
    const collectedCouponSummary = async (req, res) => {
        const { user } = req;

        if (!user) {
            return response.unauthorized(res, 'Unauthorized');
        }

        const foundBrands = await Brand.findAll({
            attributes: ['id', 'brand_name']
        });

        CollectedCoupon.findAll({
            attributes: [
                [sequelize.fn('COUNT', 'CollectedCoupon.*'), 'value'],
                ['is_coupon', 'status'],
                [sequelize.col('Coupon.brand_id'), 'brandId']

            ],
            include: [
                {
                    model: Coupon,
                    attributes: [],
                }
            ],
            group: ['is_coupon', sequelize.col('Coupon.brand_id')]
        }).then(data => {

            if (!data) {
                return response.recordNotFound(res);
            }

            const parsedData = data.map(ele => {
                return ele.toJSON();
            });

            function findData(brandId, status) {
                return parsedData.find(e => {
                    return e.brandId == brandId && e.status == status;
                });
            }

            const newData = [];

            for (let ele of foundBrands) {

                const temp = {};
                temp.brand = String(ele.brand_name).toLowerCase();

                const pendingCoupon = findData(ele.id, 'pending');
                const redeemedCoupon = findData(ele.id, 'redeemed');
                const expiredCoupon = findData(ele.id, 'expired');

                temp.pending = pendingCoupon ? pendingCoupon.value : 0;
                temp.redeemed = redeemedCoupon ? redeemedCoupon.value : 0;
                temp.expired = expiredCoupon ? expiredCoupon.value : 0;

                newData.push(temp);

            }

            return response.success(res, 'ok', newData);

        }).catch(error => {
            return response.error(res, error.message);
        });
    };
    /** coupons categories summary Super-Admin(admin) */
    const couponCategorySummary = async (req, res) => {
        const { user } = req;

        if (!user) {
            return res.send({
                status: false,
                msg: 'Unauthorized'
            });
        }

        const foundCategories = await Categories.findAll({
            attributes: ['id', 'title'],
            where: {
                parent_id: null
            }

        });

        if (!foundCategories) {
            return res.send({
                status: false,
                msg: 'Data not found.'
            });
        }


        Coupon.findAll({
            attributes: [
                [sequelize.fn('COUNT', 'Coupon.*'), 'value'],

                [sequelize.col('Brand.category_id'), 'categoryId']

            ],
            include: [
                {
                    model: Brand,
                    attributes: []
                }
            ],
            group: [
                sequelize.col('Brand.category_id')
            ]
        }).then(data => {

            function findById(categoryId) {
                return foundCategories.find(e => {
                    return e.id === categoryId;
                });
            }
            const parsedData = data.map(ele => {
                const temp = ele.toJSON();

                const catInfo = findById(temp.categoryId);

                if (catInfo) {
                    temp.catTitle = catInfo.title;
                }
                return temp;
            });
            return response.success(res, 'ok', parsedData);

        }).catch(error => {
            return response.error(res, error.message);
        });


    };

    return {
        registeredUser,
        roleBasedUserSummary,
        collectedCouponSummary,
        couponCategorySummary
    };
};

module.exports = GraphController;