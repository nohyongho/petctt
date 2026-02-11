/** Model */
const User = require('../models/User');
const Role = require('../models/Role');
const UserDetail = require('../models/UserDetail');
const Country = require('../models/CountryList');
const State = require('../models/StateList');
const City = require('../models/CityList');
const Brand = require("../models/Brand");
const Outlet = require("../models/Outlet");
const CouponCategory = require("../models/CouponCategory");
const Coupon = require("../models/Coupon");
const CouponCode = require("../models/CouponCode");
const CollectedCoupon = require("../models/CollectedCoupon");
const MpUserOutlet = require('../models/MpUserOutlet');


/** Library */
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/UserValidator');


const UserController = () => {

    /**All Users list on the basis of different types like ( all, active , blocked, verified or notVerified  ) */
    const allUsersList = async(req, res) => {
        try {
            let { type, userStatus, verified, orderBy, order, length, start } = req.body;
            const bodyResp = validate.allUsersList(req.body);
            if (bodyResp.status === false) {
                return response.error(res, bodyResp.msg);
            }
            let queryClause;
            /**all users list */
            if (type === 'all') {
                queryClause = { 'isDeleted': false };
            }
            /**all notVerified, blocked or active users list  */
            else if (type === 'userStatus') {
                queryClause = { 'user_status': `${userStatus}`, 'isDeleted': false };
            }
            /**all verified or not verified users list  */
            else if (type === 'verified') {
                if (verified === 'true') { verified = true; } else { verified = false; }
                queryClause = { 'is_email_verified': verified, 'isDeleted': false };
            }
            let users = await User.findAndCountAll({
                attributes: ['id', 'email', 'full_name', 'age', 'gender', 'user_status', 'login_time', 'is_email_verified', 'createdAt', 'role_id'],
                include: { model: Role },
                where: queryClause,
                order: [
                    ['createdAt', 'asc']
                ],
                limit: parseInt(length),
                offset: parseInt(start),
            });
            let totalUser = users.count;
            users = users.rows;
            users = users.map(Element => {
                return {
                    id: Element.id,
                    fullName: Element.full_name,
                    email: Element.email,
                    age: Element.age,
                    gender: Element.gender,
                    userStatus: Element.user_status,
                    loginTime: Element.login_time,
                    isEmailVerified: Element.is_email_verified,
                    createdAt: Element.createdAt,
                    roleId: Element.role_id,
                    roleName: Element.Role.name,
                };
            });
            return response.success(res, constant.SUCCESS, { totalUser, users });

        } catch (error) {

            return response.error(res, error.message);
        }

    };
    /**All Searched Users list on the basis of different types like ( all, active , blocked, verified or notVerified  ) and seachedBy fullName, contactNo, email */
    const searchUsers = async(req, res) => {
        try {
            let { type, userStatus, verified, orderBy, order, limit, offSet, searchBy, search } = req.body;
            const bodyResp = validate.searchUsers(req.body);
            if (bodyResp.status === false) {
                return response.error(res, bodyResp.msg);
            }
            let queryClause;

            /**all users list on the basis on searchBy element (fullname, contactno, eamil)  .replace is used for removing all white spaces fromsearch parameter*/
            if (type === 'all') {
                queryClause = allSearchQuery(searchBy, queryClause, search);
            }
            /**all notVerified, blocked or active users list  on the basis on searchBy element (fullname, contactno, eamil)  .replace is used for removing all white spaces fromsearch parameter */
            else if (type === 'userStatus') {
                queryClause = userStatusSearchQuery(searchBy, queryClause, search, userStatus);
            }
            /**all verified or not verified users list on the basis on searchBy element (fullname, contactno, eamil)  .replace is used for removing all white spaces fromsearch parameter */
            else if (type === 'verified') {
                if (verified === 'true') { verified = true; } else { verified = false; }
                queryClause = verifiedSearchQuery(searchBy, queryClause, search, verified);
            }
            let users = await User.findAndCountAll({
                attributes: ['id', 'email', 'full_name', 'age', 'gender', 'user_status', 'login_time', 'is_email_verified', 'createdAt', 'role_id'],
                include: { model: Role },
                where: queryClause,
                order: [
                    [orderBy, order]
                ],
                limit: parseInt(limit),
                offset: parseInt(offSet),
            });
            let totalUser = users.count;
            users = users.rows;
            users = users.map(Element => {
                return {
                    id: Element.id,
                    fullName: Element.full_name,
                    email: Element.email,
                    age: Element.age,
                    gender: Element.gender,
                    userStatus: Element.user_status,
                    loginTime: Element.login_time,
                    isEmailVerified: Element.is_email_verified,
                    createdAt: Element.createdAt,
                    roleId: Element.role_id,
                    roleName: Element.Role.name,
                };
            });
            return response.success(res, constant.SUCCESS, { totalUser, users });

        } catch (error) {

            return response.error(res, error.message);
        }

    };
    /**All Filter Users list on the basis of different types like ( all, active , blocked, verified or notVerified  ) */
    const filterUsers = async(req, res) => {
        try {
            let { type, userStatus, verified, orderBy, order, limit, offSet, startDate, endDate } = req.body;
            const bodyResp = validate.filterUsers(req.body);
            if (bodyResp.status === false) {
                return response.error(res, bodyResp.msg);
            }
            let queryClause;
            /**filter all users list */
            if (type === 'all') {
                queryClause = { 'createdAt': {
                        [Op.between]: [startDate, endDate] }, 'isDeleted': false };
            }
            /**filter all blocked or active users list */
            else if (type === 'userStatus') {
                queryClause = { 'createdAt': {
                        [Op.between]: [startDate, endDate] }, 'user_status': `${userStatus}`, 'isDeleted': false };
            }
            /**filter all verified or not verified users list */
            else if (type === 'verified') {
                if (verified === 'true') { verified = true; } else { verified = false; }
                queryClause = { 'createdAt': {
                        [Op.between]: [startDate, endDate] }, 'is_email_verified': verified, 'isDeleted': false };
            }
            let users = await User.findAndCountAll({
                attributes: ['id', 'email', 'full_name', 'age', 'gender', 'user_status', 'login_time', 'is_email_verified', 'createdAt', 'role_id'],
                include: { model: Role },
                where: queryClause,
                order: [
                    [orderBy, order]
                ],
                limit: parseInt(limit),
                offset: parseInt(offSet),
            });
            let totalUser = users.count;
            users = users.rows;
            users = users.map(Element => {
                return {
                    id: Element.id,
                    fullName: Element.full_name,
                    email: Element.email,
                    age: Element.age,
                    gender: Element.gender,
                    userStatus: Element.user_status,
                    loginTime: Element.login_time,
                    isEmailVerified: Element.is_email_verified,
                    createdAt: Element.createdAt,
                    roleId: Element.role_id,
                    roleName: Element.Role.name,
                };
            });
            return response.success(res, constant.SUCCESS, { totalUser, users });

        } catch (error) {

            return response.error(res, error.message);
        }

    };
    /**geting individual user detail with their coupons active redem and expired on the basis of userId */
    const userDetail = async(req, res) => {
        try {
            //let { userId } = req.body;

            let userId = req.params.id
            body = {
                userId: req.params.id
            }
            const bodyResponse = validate.userDetail(body);
            if (bodyResponse.status === false) {
                return response.error(res, bodyResponse.msg);
            }
            /**Find User Detail */
            let user = await User.findOne({
                where: { id: userId },
                include: [{ model: Role, attributes: ['name'] },
                    {
                        model: UserDetail,
                        attributes: ['postal_code', 'address', 'image', 'country_id'],
                        include: [{ model: Country, attributes: ['country_name'] }, { model: State, attributes: ['state_name'] }, { model: City, attributes: ['city_name'] }]
                    }
                ]
            });

            /**assigning state name and city name */
            let state = '';
            let city = '';
            if (user.UserDetails[0].StateList) { state = user.UserDetails[0].StateList.state_name; }
            if (user.UserDetails[0].CityList) { state = user.UserDetails[0].CityList.city_name; }


            let userDetail = {
                id: user.id,
                fullName: user.full_name,
                email: user.merchant_email,
                contactNo: user.contact_no,
                age: user.age,
                gender: user.gender,
                loginTime: user.login_time,
                createdAt: user.createdAt,
                postalCode: user.UserDetails[0].postal_code,
                image: user.UserDetails[0].image,
                address: user.UserDetails[0].address,
                country: user.UserDetails[0].country_id ? user.UserDetails[0].CountryList.country_name : null,
                state: state,
                city: city
            };
            /**Getting coupons detail on the basis on userId */
            let findAllCollectedCoupon = await getCouponDetail(userId);
            let activeCoupons = [];
            let redeemCoupons = [];
            let expireCoupons = [];
            if (findAllCollectedCoupon) {
                settingCouponsResponse(findAllCollectedCoupon, activeCoupons, redeemCoupons, expireCoupons);
                return response.success(res, constant.SUCCESS, [{ userDetail: userDetail }, { activeCoupons, redeemCoupons, expireCoupons }]);
            } else {
                return response.success(res, constant.SUCCESS, { userDetail: userDetail, couponDetail: [] });
            }
        } catch (error) {

            return response.error(res, error.msg);
        }
    };
    /**update user status from active to blocked and vice versa */
    const updateUserStatus = async(req, res) => {
        try {
            let { userId, status } = req.body;
            let bodyResponse = validate.updateUserStatus(req.body);
            if (bodyResponse.status === false) {
                return response.error(res, bodyResponse.msg);
            }
            let updateUser = await User.update({ user_status: status }, { where: { id: userId } });
            if (updateUser[0] === 1) { return response.successMsg(res, constant.USER_UPDATED); } else { return response.error(res, constant.SERVER_ERROR); }
        } catch (error) {
            return response.error(res, error.message);
        }
    };
    /**All Users list on the basis of different types like ( all, active , blocked, verified or notVerified  ) */
    const outletUsersList = async(req, res) => {
        try {
            const { user } = req;
            let outletIds = [];
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });
            let outlets = await Outlet.findAll({
                where: { brand_id: brand.id },
                include: { model: MpUserOutlet }
            });
            outlets.forEach(Element => {
                if (Element.MpUserOutlets[0]) {
                    Element = Element.toJSON();
                    let newArray = Element.MpUserOutlets
                    newArray.forEach(ele => {
                        outletIds.push(ele.user_id);

                    })
                }
            });
            const bodyResp = validate.outletUsersList(req.body);
            if (bodyResp.status === false) {
                return response.error(res, bodyResp.msg);
            }
            let users = await User.findAll({
                attributes: ['id', 'merchant_email', 'full_name', 'age', 'gender', 'user_status', 'login_time', 'is_email_verified', 'createdAt', 'role_id'],
                where: { id: {
                        [Op.in]: outletIds }, role_id: 4 },
                include: { model: Role },
                order: [
                    ['createdAt', 'desc']
                ],
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1)),
                limit: parseInt(req.body.limit),
            });
            let recordsTotal = users.length;
            let recordsFiltered = users.length;
            users = users.map(Element => {
                return {
                    id: Element.id,
                    fullName: Element.full_name,
                    email: Element.merchant_email,
                    age: Element.age,
                    gender: Element.gender,
                    userStatus: Element.user_status,
                    loginTime: Element.login_time,
                    isEmailVerified: Element.is_email_verified,
                    createdAt: Element.createdAt,
                    roleId: Element.role_id,
                    roleName: Element.Role.name,
                };
            });
            return response.successDT(res, constant.SUCCESS, users, recordsTotal, recordsFiltered);

        } catch (error) {

            return response.error(res, error.message);
        }

    };
    return {
        allUsersList,
        searchUsers,
        filterUsers,
        userDetail,
        updateUserStatus,
        outletUsersList
    };

};

module.exports = UserController;

function settingCouponsResponse(findAllCollectedCoupon, activeCoupons, redeemCoupons, expireCoupons) {
    findAllCollectedCoupon.map(Element => {
        if (Element.is_coupon === "active") {
            activeCoupons.push({
                brandId: Element.Coupon.Brand.id,
                brandName: Element.Coupon.Brand.brand_name,
                brandImage: Element.Coupon.Brand.image,
                collectCouponId: Element.id,
                collectedFrom: Element.location.coordinates,
                hash: Element.hash,
                couponCode: Element.CouponCode.coupon_code,
                isCoupon: Element.is_coupon,
                couponId: Element.Coupon.id,
                couponName: Element.Coupon.coupon_name,
                couponType: Element.Coupon.coupon_type,
                percentOff: Element.Coupon.percent_off,
                couponValidTill: Element.Coupon.valid_till,
                couponDescription: Element.Coupon.description,
                coupanImage: Element.Coupon.coupon_image,
                couponCategory: Element.Coupon.Brand.CouponCategory.category_name,
                outletDetail: Element.Coupon.Brand.Outlets
            });
        } else if (Element.is_coupon === "redeem") {
            redeemCoupons.push({
                brandId: Element.Coupon.Brand.id,
                brandName: Element.Coupon.Brand.brand_name,
                brandImage: Element.Coupon.Brand.image,
                collectCouponId: Element.id,
                collectedFrom: Element.location.coordinates,
                hash: Element.hash,
                couponCode: Element.CouponCode.coupon_code,
                isCoupon: Element.is_coupon,
                couponId: Element.Coupon.id,
                couponName: Element.Coupon.coupon_name,
                couponType: Element.Coupon.coupon_type,
                percentOff: Element.Coupon.percent_off,
                couponValidTill: Element.Coupon.valid_till,
                couponDescription: Element.Coupon.description,
                coupanImage: Element.Coupon.coupon_image,
                couponCategory: Element.Coupon.Brand.CouponCategory.category_name,
                outletDetail: Element.Coupon.Brand.Outlets
            });
        } else if (Element.is_coupon === "expire") {
            expireCoupons.push({
                brandId: Element.Coupon.Brand.id,
                brandName: Element.Coupon.Brand.brand_name,
                brandImage: Element.Coupon.Brand.image,
                collectCouponId: Element.id,
                collectedFrom: Element.location.coordinates,
                hash: Element.hash,
                couponCode: Element.CouponCode.coupon_code,
                isCoupon: Element.is_coupon,
                couponId: Element.Coupon.id,
                couponName: Element.Coupon.coupon_name,
                couponType: Element.Coupon.coupon_type,
                percentOff: Element.Coupon.percent_off,
                couponValidTill: Element.Coupon.valid_till,
                couponDescription: Element.Coupon.description,
                coupanImage: Element.Coupon.coupon_image,
                couponCategory: Element.Coupon.Brand.CouponCategory.category_name,
                outletDetail: Element.Coupon.Brand.Outlets
            });
        }
    });
}

async function getCouponDetail(userId) {
    return await CollectedCoupon.findAll({
        where: { user_id: userId },
        include: [{
            model: Coupon,
            include: [{
                model: Brand,
                include: [{
                        model: Outlet,
                        attributes: [
                            ["id", "outletId"],
                            ["outlet_name", "outletName"],
                            ["phone_number", "outletPhone"],
                            ["address", "outletAddress"]
                        ]
                    },
                    { model: CouponCategory }
                ]
            }]
        }, { model: CouponCode }]
    });
}

function verifiedSearchQuery(searchBy, queryClause, search, verified) {
    if (searchBy === 'fullName') {
        queryClause = { 'is_email_verified': verified, 'full_name': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'isDeleted': false };
    } else if (searchBy === 'email') {
        queryClause = { 'is_email_verified': verified, 'email': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'isDeleted': false };
    } else if (searchBy === 'contactNo') {
        queryClause = { 'is_email_verified': verified, 'contact_no': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'isDeleted': false };
    }
    return queryClause;
}

function userStatusSearchQuery(searchBy, queryClause, search, userStatus) {
    if (searchBy === 'fullName') {
        queryClause = { 'full_name': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'user_status': `${userStatus}`, 'isDeleted': false };
    } else if (searchBy === 'email') {
        queryClause = { 'email': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'user_status': `${userStatus}`, 'isDeleted': false };
    } else if (searchBy === 'contactNo') {
        queryClause = { 'contact_no': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'user_status': `${userStatus}`, 'isDeleted': false };
    }
    return queryClause;
}

function allSearchQuery(searchBy, queryClause, search) {
    if (searchBy === 'fullName') {
        queryClause = { 'full_name': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'isDeleted': false };
    } else if (searchBy === 'email') {
        queryClause = { 'email': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'isDeleted': false };
    } else if (searchBy === 'contactNo') {
        queryClause = { 'contact_no': {
                [Op.like]: `%${search.replace(/\s/g, '')}%` }, 'isDeleted': false };
    }
    return queryClause;
}