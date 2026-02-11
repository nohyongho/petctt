/** Model */
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const Country = require('../models/CountryList');
const State = require('../models/StateList');
const City = require('../models/CityList');
const Category = require('../models/Categories');
const TimeTable = require('../models/TimeTable');
const Coupon = require('../models/Coupon');
const CollectedCoupons = require('../models/CollectedCoupon');

const CouponCode = require('../models/CouponCode');
const Role = require('../models/Role');
const User = require('../models/User');
const Fcm = require('../models/Fcm');



/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/OutletValidator');
const FirebaseMessaging = require('../helper/FirebaseMessaging');


const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const OutletController = () => {

    /**Get outlet list on the basis of logged-in merchant id */
    const allOutletList = async(req, res) => {
        try {


            const {
                user
            } = req;
            const validationResponse = validate.outletList(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }



            var OutletData = await Outlet.findAll({

                where: [{
                    user_id: user.data.user_id
                }, {
                    is_deleted: false
                }],

                include: [{
                        model: Brand,
                        required: true,
                        where: {
                            user_id: user.data.user_id
                        },
                        include: {
                            model: Category
                        }
                    },
                    {

                        model: Coupon,
                        required: false,
                        where: {
                            is_deleted: false
                        },

                        attributes: [
                            "total_coupons",
                            "remaining_coupons",
                            //   [Sequelize.fn('sum', Sequelize.col('total_coupons')), 'totalcoupons'],
                            // [Sequelize.fn('sum', Sequelize.col('remaining_coupons')), 'remaining_coupons']


                        ],
                        include: {
                            model: CollectedCoupons,
                            required: false,
                        },

                    },
                    {

                        model: City,
                        include: {
                            model: Country
                        }


                    },


                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1)),
                //subQuery: false,
            });


            //  return response.successDT(res, constant.SUCCESS, OutletData, OutletData.length, OutletData.length);




            if (OutletData.length != 0) {
                testData = OutletData.map(Element => {

                    // let CouponData =  Coupon.findAll({

                    //     where: { outlet_id: Element.id},
                    // });
                    // var cc = [];
                    // Element.Coupons.forEach(ele =>{
                    //     if(ele.CollectedCoupons.length>0)
                    //          cc.push(ele.CollectedCoupons)
                    // });

                    var maincollectedcoupons = [];
                    Element.Coupons.forEach(ele => {

                        //maincc.push(ele.CollectedCoupons)
                        // maincc.push(ele.CollectedCoupons[1])

                        ele.CollectedCoupons.forEach(eleinside => {

                            maincollectedcoupons.push(eleinside)

                        });

                    });





                    var cc = [];
                    var rr = [];
                    var dd = [];
                    var st = [];
                    maincollectedcoupons.forEach(ele => {
                        if (ele.is_coupon == "COLLECTED")
                            cc.push(ele.is_coupon + "--" + ele.coupon_id)
                        if (ele.is_coupon == "REDEEMED")
                            rr.push(ele.is_coupon + "--" + ele.coupon_id)
                        if (ele.is_coupon == "HIDDEN" || ele.is_deleted == true)
                            dd.push(ele.is_deleted + "--" + ele.coupon_id)
                        if (ele.is_coupon == "EXPIRED")
                            st.push(ele.is_coupon + "--" + ele.is_coupon)



                    });

                    return {
                        id: Element.id,
                        name: Element.outlet_name,
                        address: Element.address,
                        postal_code: Element.postal_code,
                        phoneNumber: Element.phone_number,
                        image: Element.image,
                        city_id: Element.city_id,
                        longitude: Element.longitude,
                        latitude: Element.latitude,
                        street_name: Element.street_name,
                        city_name: Element.city_name,
                        state_name: Element.state_name,
                        country_code: Element.country_code,
                        nearby_couponrange: Element.nearby_couponrange,
                        is_countrywide: Element.is_countrywide,




                        createdAt: Element.createdAt,
                        status: Element.status ? 'Active' : 'Blocked',
                        country: {
                            name: Element.CountryList ? Element.CountryList.country_name : '',
                            sortName: Element.CountryList ? Element.CountryList.sort_name : '',
                        },
                        coupons: {
                            totalCoupons: aa = Element.Coupons.reduce((a, b) => {
                                return a + b.total_coupons;
                            }, 0),

                            remainingCoupons: bb = Element.Coupons.reduce((a, b) => {
                                return a + b.remaining_coupons;
                            }, 0),

                            usedCoupons: aa - bb,
                            collectedCoupons: cc.length,
                            redeemedCoupons: rr.length,
                            deltedCoupons: dd.length,
                            expiredCoupons: st.length,

                        },

                        brand: {
                            id: Element.Brand.id,
                            name: Element.Brand.brand_name,
                            image: Element.Brand.image,
                            brandcategory: Element.Brand.Category.title

                        }
                    };
                });
            } else {
                return response.error(res, constant.OUTLET_NOTFOUND);
            }


            return response.successDT(res, constant.SUCCESS, testData, OutletData.length, OutletData.length);






        } catch (error) {

            return response.error(res, error.message);
        }

    };


    /**Update outlet record */
    const updateoutlet = async(req, res) => {

        // const body = req.body;
        const body = JSON.parse(req.body.updateOutlet);
        try {
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.updateoutlet(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            //  let { oldPassword, newPassword } = req.body;

            let getOutlet = await Outlet.findOne({
                where: {
                    id: body.outlet_id,
                    user_id: user.data.user_id
                }
            });

            const location = {
                type: "Point",
                coordinates: [body.latitude, body.longitude]
            };



            if (getOutlet) {


                let updateOutletdata = await Outlet.update({

                        outlet_name: body.outlet_name,
                        postal_code: body.postal_code,
                        address: body.address,
                        phone_number: body.phone_number,
                        brand_id: body.brand_id,
                        city_id: body.city_id,
                        //  area: req.body.area,
                        latitude: body.latitude,
                        longitude: body.longitude,

                        street_name: body.street_name,
                        city_name: body.city_name,
                        state_name: body.state_name,
                        country_code: body.country_code,
                        nearby_couponrange: body.nearby_couponrange,
                        is_countrywide: body.is_countrywide,
                        location: location,
                    },

                    {
                        where: {
                            id: body.outlet_id,
                            user_id: user.data.user_id
                        }
                    });


                if (req.fileexist) {
                    await Outlet.update({
                            image: req.filepath,
                        },

                        {
                            where: { id: body.outlet_id, user_id: user.data.user_id }
                        });
                }

                if (typeof body.is_countrywide != "undefined") {

                    let updatecountrywide = await Coupon.update({
                        is_countrywide: body.is_countrywide,
                    }, {

                        where: {
                            outlet_id: body.outlet_id
                        }
                    });

                }


                if (updateOutletdata[0] === 1) {
                    response.successMsg(res, constant.OUTLET_UPDATED);
                } else {
                    return response.error(res, "Outlet Not Updated");
                }

            } else {
                return response.error(res, constant.OUTLET_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    }










    /**delete outlet record */
    const deleteoutlet = async(req, res) => {
        try {
            const user = req.user;
            const validationResponse = validate.deleteoutlet(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            var getOutlet = await Outlet.findOne({
                where: {
                    id: req.body.outlet_id,
                    user_id: user.data.user_id
                }
            });

            if (getOutlet.is_deleted)
                return response.error(res, constant.OUTLET_DELETED_ALREADY);

            if (getOutlet) {
                getOutlet.is_deleted = true;
                getOutlet.save();
                sendDeleteCouponNotification(getOutlet.id);
                response.successMsg(res, constant.OUTLET_DELETED);
            } else {
                return response.error(res, constant.OUTLET_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    }







    /**create outlet with logged-in merchant id */
    const createOutlet = async(req, res) => {

        //const body = req.body;
        const body = JSON.parse(req.body.createOutlet);

        try {
            const {
                user
            } = req;
            const validationResponse = validate.createOutletvalidate(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            const location = {
                type: "Point",
                coordinates: [body.latitude, body.longitude]
            };


            if (!req.fileexist) {
                return response.error(res, "Please provide Outlet Image.");
            }

            /**inserting outlet record */
            let newOutlet = await Outlet.create({
                outlet_name: body.outlet_name,
                postal_code: body.postal_code,
                address: body.address,
                phone_number: body.phone_number,
                brand_id: body.brand_id,
                //country_id: req.body.country_id,
                // state_id: req.body.stateId,
                city_id: body.city_id,
                //  area: req.body.area,
                latitude: body.latitude,
                longitude: body.longitude,
                status: true,
                is_deleted: false,
                user_id: user.data.user_id,
                street_name: body.street_name,
                city_name: body.city_name,
                state_name: body.state_name,
                country_code: body.country_code,
                location: location,
                nearby_couponrange: body.nearby_couponrange,
                is_countrywide: body.is_countrywide,
                image: req.filepath,




            });
            if (!newOutlet) {
                return response.error(res, constant.SERVER_ERROR);
            }

            // console.log(body.opendays)

            // console.log(body.timings)


            if (typeof body.opendays != "undefined" && typeof body.timings != "undefined") {

                var opendays_outlet = body.opendays;
                var timing_outlet = body.timings;

                arropendays_outlet = [];
                arrtiming_outlet = [];

                if (opendays_outlet.indexOf(',') > -1) {
                    arropendays_outlet = opendays_outlet.split(',')

                } else {
                    arropendays_outlet = [body.opendays];
                }

                if (timing_outlet.indexOf(',') > -1) {
                    arrtiming_outlet = timing_outlet.split(',')

                } else {
                    arrtiming_outlet = [body.timings];
                }




                timetable_arr = [];
                ampm_arr = [];
                for (var i = 0; i < arropendays_outlet.length; i++) {

                    ampm_arr = arrtiming_outlet[i].split('-')

                    timingdata = {
                        outlet_id: newOutlet.id,
                        day: arropendays_outlet[i],
                        opening: ampm_arr[0],
                        closing: ampm_arr[1],

                    }
                    timetable_arr.push(timingdata)
                }



                TimeTable.bulkCreate(timetable_arr);
            }

            return response.successMsg(res, constant.OUTLET_CREATED);

        } catch (error) {

            return response.error(res, error.message);
        }

    };
    return {
        allOutletList,
        createOutlet,
        updateoutlet,
        deleteoutlet,
    };
};

module.exports = OutletController;

/* 
Method to send hidden in app notification to android devices. TAK
param = single outlet id
*/
function sendDeleteCouponNotification(outletId) {
    if (!outletId)
        return;

    Fcm.findAll({
        attributes: ["fcm_token"],
        include: {
            required: true,
            model: User,
            attributes: [],
            include: {
                attributes: [],
                required: true,
                model: Role,
                where: {
                    name: {
                        [Op.like]: 'user'
                    },
                }
            }
        }
    }).then(fcmArr => {
        if (fcmArr && fcmArr.length > 0) {
            var userFcmsArray = [];
            fcmArr.forEach(fcmObj => {
                userFcmsArray.push(fcmObj.fcm_token);
            });
            var title = "Outlet";
            var msg = "Outlet";
            var jsonData = {};
            jsonData.title = title;
            jsonData.message = msg;
            jsonData.method = "removeOutlet"; //this has to be "removeCoupon".
            jsonData.ids = outletId;
            if (userFcmsArray.length > 0) {
                var firebaseMsg = new FirebaseMessaging(userFcmsArray, title, msg, jsonData);
                firebaseMsg.send();
            }

        }
    });
}