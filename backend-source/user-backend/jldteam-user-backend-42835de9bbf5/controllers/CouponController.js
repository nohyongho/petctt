/** Model */
const User = require("../models/User");
const Brand = require("../models/Brand");
const Outlet = require("../models/Outlet");
const Categories = require("../models/Categories");
const Coupon = require("../models/Coupon");
const CountryList = require("../models/CountryList");
const Currency = require('../models/Currency');
const MpCouponOutlet = require("../models/MpCouponOutlet");
const CouponCode = require("../models/CouponCode");
const CollectedCoupon = require("../models/CollectedCoupon");
const TimeTable = require("../models/TimeTable");
const City = require('../models/CityList');
const ProductTypes = require('../models/ProductTypes');

/** Helpers */
const response = require("../helper/response");
const responseMessages = require("../helper/responseMessages");
// const responseMessages = require('../helper/koreanMessages');
const validate = require("../helper/validators/CouponController/validate");

/** Library */
const randomLocation = require("random-location");
const randomString = require("randomstring");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
var QRCode = require("qrcode");
const sequelize = require('../config/database');


const JOI = require('joi');

const CouponController = () => {
  const getCoupons = async (req, res) => {
    try {
      const {
        user
      } = req;
      const body = req.body;
      delete body.altitude;
      delete body.accuracy;
      const validationResponse = validate.get_coupons_body(body);
      if (!validationResponse.status) {
        return response.bodyNotFound(res, validationResponse.msg);
      }
      const {
        current_lat,
        current_long,
        type,
        outletId
      } = req.body;

      const range = 500;

      /** Fetching Brands */
      const foundBrands = await Brand.findAll({
        attributes: ["id", "brand_name"],
        where: {
          is_deleted: false
        }
      });
      const brandJSON = foundBrands.map(data => {
        return data.toJSON();
      });

      /** Fetching Categories */
      const categoriesJSON = await Categories.findAll();
      let foundCoupons;

      if (type === 'all') {
        /** Fetching Coupons */
        foundCoupons = await Coupon.findAll({
          where: {
            status: 'available',
            is_deleted: false,
            remaining_coupons: {
              [Op.gt]: 0,
            },
          },
          include: [{
              required: true,
              model: Outlet,
              where: {
                is_deleted: false,
              },
              attributes: ["id", "outlet_name"],
              include: [{
                model: CountryList
              }, {
                required: true,
                model: Brand,
                where: {
                  is_deleted: false,
                },
                attributes: ["id", "brand_name", "category_id"],
              }]
            },
            {
              required: true,
              model: CouponCode,
              where: {
                [Op.or]: [{
                  is_used: false
                }, {
                  is_used: null
                }]
              }
            }

          ]
        });
      }

      if (!foundCoupons) {
        return response.error(res, responseMessages.getter(req, "get_coupons", "coupon_not_found"));
      }

      const couponJSON = foundCoupons.map(data => {
        return data.toJSON();
      });

      let myLocation = {
        latitude: parseFloat(current_lat),
        longitude: parseFloat(current_long)
      };

      // /** Fetching already collected coupons */
      // const foundCollectedCoupons = await CollectedCoupon.findAll({
      //     attributes: [
      //         [Sequelize.fn('COUNT', '*'), 'count'],
      //         [Sequelize.col('CouponCode.coupon_id'), 'coupon_id']
      //     ],
      //     where: { user_id: user.data.user_id },
      //     include: {
      //         attributes: [],
      //         model: CouponCode,
      //         required: true
      //     },
      //     group: [Sequelize.col('CouponCode.coupon_id')]
      // });

      // const collectedCouponsJSON = foundCollectedCoupons.map(data => {
      //     return data.toJSON();
      // });

      const data = [];

      for (const coupon of couponJSON) {
        if (coupon.Outlet) {

          // if (coupon.valid_till >= new Date()) {
          const {
            total_coupons,
            remaining_coupons,
            coupon_type,
            per_user
          } = coupon;
          // const userCollectedCoupon = collectedCouponsJSON.find(e => e.coupon_id === coupon.id);
          // let collectedCouponCount = 0;
          // if (userCollectedCoupon) {
          //     collectedCouponCount = userCollectedCoupon.count
          // }
          // let couponPerUser = 0;

          // if (remaining_coupons > 0) {
          //     if (parseInt(collectedCouponCount) >= per_user) {
          //         couponPerUser = 0;
          //     } else {
          //         couponPerUser = per_user - parseInt(collectedCouponCount);
          //     }
          // }
          const couponPerUser = per_user - 7;
          switch (coupon_type) {
            case "common":
              const foundCommonCouponCodes = coupon.CouponCodes[0];
              if (foundCommonCouponCodes) {
                for (let i = 0; i < 7; i++) {

                  const template = {
                    coupon_id: coupon.id,
                    coupon_name: coupon.coupon_name,
                    coupon_type: coupon.coupon_type,
                    coupon_image: coupon.coupon_image,
                    brand_id: coupon.brand_id,
                    brand_name: coupon.Outlet.Brand.brand_name,
                    category_id: coupon.Outlet.Brand.category_id,
                    outlet_id: coupon.Outlet.id,
                    outlet_name: coupon.Outlet.outlet_name,
                    country_id: coupon.Outlet.CountryList ? coupon.Outlet.CountryList.id : 0,
                    /**0 means country_id not exist */
                    max_discount: coupon.max_discount
                  };

                  const randomLoc = randomLocation.randomCirclePoint(
                    myLocation,
                    20
                  );

                  template.coupon_code_id = foundCommonCouponCodes.id;
                  template.coupon_code = foundCommonCouponCodes.coupon_code;
                  template.hash = randomString.generate(64);
                  template.longitude = parseFloat(randomLoc.longitude).toFixed(6);
                  template.latitude = parseFloat(randomLoc.latitude).toFixed(6);
                  template.distance = randomLocation.distance(
                    myLocation,
                    randomLoc
                  );
                  data.push(template);
                }
                for (let i = 0; i < couponPerUser; i++) {

                  const template = {
                    coupon_id: coupon.id,
                    coupon_name: coupon.coupon_name,
                    coupon_type: coupon.coupon_type,
                    coupon_image: coupon.coupon_image,
                    brand_id: coupon.brand_id,
                    brand_name: coupon.Outlet.Brand.brand_name,
                    category_id: coupon.Outlet.Brand.category_id,
                    outlet_id: coupon.Outlet.id,
                    outlet_name: coupon.Outlet.outlet_name,
                    country_id: coupon.Outlet.CountryList ? coupon.Outlet.CountryList.id : 0,
                    /**0 means country_id not exist */
                    max_discount: coupon.max_discount
                  };

                  const randomLoc = randomLocation.randomCirclePoint(
                    myLocation,
                    range
                  );

                  template.coupon_code_id = foundCommonCouponCodes.id;
                  template.coupon_code = foundCommonCouponCodes.coupon_code;
                  template.hash = randomString.generate(64);
                  template.longitude = parseFloat(randomLoc.longitude).toFixed(6);
                  template.latitude = parseFloat(randomLoc.latitude).toFixed(6);
                  template.distance = randomLocation.distance(
                    myLocation,
                    randomLoc
                  );
                  data.push(template);
                }
              }
              break;
            case "random":
              const randomCouponCodesJSON = coupon.CouponCodes;
              if (randomCouponCodesJSON) {
                for (let i = 0; i < couponPerUser; i++) {
                  const template = {
                    coupon_id: coupon.id,
                    coupon_name: coupon.coupon_name,
                    coupon_type: coupon.coupon_type,
                    coupon_image: coupon.coupon_image,
                    brand_id: coupon.brand_id,
                    brand_name: coupon.Outlet.Brand.brand_name,
                    category_id: coupon.category_id,
                    outlet_id: coupon.Outlet.id,
                    outlet_name: coupon.Outlet.outlet_name,
                    country_id: coupon.Outlet.CountryList ? coupon.Outlet.CountryList.id : '',
                    max_discount: coupon.max_discount
                  };
                  const randomLoc = randomLocation.randomCirclePoint(
                    myLocation,
                    range
                  );

                  template.coupon_code_id = randomCouponCodesJSON[i].id;
                  template.coupon_code = randomCouponCodesJSON[i].coupon_code;
                  template.hash = randomString.generate(64);
                  template.longitude = parseFloat(randomLoc.longitude).toFixed(5);
                  template.latitude = parseFloat(randomLoc.latitude).toFixed(5);

                  data.push(template);
                }
              }
              break;
            default:
              break;
          }
          // } else {
          //     await CollectedCoupon.update({ is_coupon: 'expire' }, { where: { coupon_id: coupon.id, is_coupon: 'active' } })
          // }
        }

        if (data && data.length > 0)
          data.sort(function (a, b) {
            return a.distance - b.distance;
          });
      }

      return response.success(
        res,
        responseMessages.getter(req, "get_coupons", "success"), {
          brands: brandJSON,
          categories: categoriesJSON,
          coupons: data
        }
      );
    } catch (error) {
      console.log("Error:::", error);
    }
  };

  const collectCoupon = async (req, res) => {
    try {
      const {
        user
      } = req;
      const body = req.body;
      const validationResponse = validate.collect_coupon_body(body);
      if (!validationResponse.status) {
        return response.bodyNotFound(res, validationResponse.msg);
      }

      const {
        coupon_id,
        latitude,
        longitude,
        country_id,
        hash,
      } = req.body;
      if (!user) {
        return response.unauthorized(res, responseMessages.getter(req, "session", "expire"));
      }
      const foundCoupon = await Coupon.findOne({
        include: {
          model: Outlet,
          attributes: ["is_deleted", "status"],
          include: {
            attributes: ["is_deleted"],
            model: Brand
          }
        },
        where: {
          id: coupon_id
        }
      });
      if (!foundCoupon) {
        return response.recordNotFound(res, req);
      }

      if (foundCoupon.is_deleted || !foundCoupon.status) {
        return res.send({
          status: false,
          msg: "Coupon not active. Err CNA001"
        });
      } else if (foundCoupon.Outlet.is_deleted || !foundCoupon.Outlet.status) {
        return res.send({
          status: false,
          msg: "Coupon not active. Err CNA002"
        });
      } else if (foundCoupon.Outlet.Brand.is_deleted) {
        return res.send({
          status: false,
          msg: "Coupon not active. Err CNA003"
        });
      }

      if (Number(foundCoupon.remaining_coupons) <= 0) {
        return response.error(res, responseMessages.getter(req, "collect_coupon", "already_collected"));
      }

      /** Fetching already collected coupons */
      const foundCollectedCoupons = await CollectedCoupon.findAll({
        attributes: [
          [Sequelize.fn("COUNT", "*"), "count"], "coupon_id"
        ],
        where: {
          user_id: user.data.user_id,
          coupon_id: coupon_id
        },
        group: ["coupon_id"]
      });

      if (Number(foundCoupon.per_user) <= 0 || (foundCollectedCoupons.length > 0 && Number(foundCollectedCoupons[0].dataValues.count) >= Number(foundCoupon.per_user))) {
        return response.error(
          res,
          responseMessages.getter(req, "collect_coupon", "already_collected")
        );
      }

      const location = {
        type: "Point",
        coordinates: [latitude, longitude]
      };
      var txn = null;
      try {
        txn = await sequelize.transaction({
          lock: Sequelize.Transaction.LOCK.UPDATE,
          isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });

        //create coupon code.
        var randomCouponCode = randomString.generate({
          length: 6,
          charset: 'alphanumeric'
        });

        var couponCode = await CouponCode.create({
          coupon_code: randomCouponCode,
          is_used: true,
          coupon_id: coupon_id,
        }, {
          transaction: txn
        });

        //end

        //START old couponcode handling commented out. TAK
        // const unUsedCouponCode = await CouponCode.findOne({
        //   where: {
        //     is_used: false,
        //     coupon_id: coupon_id,
        //   },
        //   transaction: txn
        // });

        // if (!unUsedCouponCode) {
        //   if (txn) txn.rollback();
        //   return response.error(res, "All coupons hunted");
        // }

        // unUsedCouponCode.is_used = true;

        // await unUsedCouponCode.save({
        //   transaction: txn
        // });

        //END old couponcode handling commented out. TAK

        await CollectedCoupon.create({
          user_id: user.data.user_id,
          coupon_id: coupon_id,
          is_coupon: "COLLECTED",
          coupon_code_id: couponCode.id,
          country_id: country_id,
          MpCouponOutlet_id: null,
          location: location,
          hash: hash
        }, {
          transaction: txn
        });

        await foundCoupon.reload({
          transaction: txn
        });

        await foundCoupon.decrement('remaining_coupons', {
          transaction: txn
        });

        await foundCoupon.reload({
          transaction: txn
        });

        if (Number(foundCoupon.remaining_coupons) < 0) {
          if (txn) txn.rollback();
          return response.error(res, "All coupons hunted");
        }

        await txn.commit();

        return response.success(
          res,
          responseMessages.getter(req, "collect_coupon", "success"), {}
        );

      } catch (error) {
        console.error(error);
        if (txn) txn.rollback();
        return response.error(res, error.message);
      }

    } catch (error) {
      console.error(error);
      return response.error(res, error.message);
    }
  };

  const getCollectedCouponHistory = async (req, res) => {
    const {
      user
    } = req;

    if (!user) {
      return response.unauthorized(
        res,
        responseMessages.getter(req, "session", "expire")
      );
    }

    const foundUser = await User.findOne({
      where: {
        id: user.data.user_id
      }
    });

    if (!foundUser) {
      return response.unauthorized(
        res,
        responseMessages.getter(req, "session", "expire")
      );
    }

    const foundCollectedCoupons = await CollectedCoupon.findAll({
      where: {
        user_id: user.data.user_id,
        is_deleted: false,
      },
      include: [{
          model: CouponCode
        },
        {
          model: Coupon,
          include: [{
            model: Brand
          }, {
            model: Categories
          }],
        }
      ]
    });

    if (!foundCollectedCoupons) {
      return response.recordNotFound(res, req);
    }

    const collectedCouponsJSON = foundCollectedCoupons.map(data => {
      return data.toJSON();
    });

    return response.success(
      res,
      responseMessages.getter(req, "collected_coupon_history", "success"),
      collectedCouponsJSON
    );
  };
  /**get coupons on the basis of current user lat long and particular brand  */
  const getCouponsByOutlet = async (req, res) => {
    try {
      const {
        user
      } = req;
      const validationResponse = validate.getCouponsByOutlet(req.body);
      if (!validationResponse.status) {
        return response.bodyNotFound(res, validationResponse.msg);
      }
      let range = 500;
      let data = [];

      /** Fetching Coupons */
      let outletRecord = await Outlet.findOne({
        where: {
          id: req.body.outletId
        },
        include: [{
          model: MpCouponOutlet,
          include: {
            model: Coupon,
            include: [{
              model: CouponCode
            }, {
              model: Brand
            }]
          }
        }, {
          model: CountryList
        }]
      });
      if (outletRecord.MpCouponOutlets[0]) {
        // /** Fetching already collected coupons */
        // const foundCollectedCoupons = await CollectedCoupon.findAll({
        //     attributes: [
        //         [Sequelize.fn('COUNT', '*'), 'count'],
        //         [Sequelize.col('CouponCode.coupon_id'), 'coupon_id']
        //     ],
        //     where: { user_id: user.data.user_id },
        //     include: {
        //         attributes: [],
        //         model: CouponCode,
        //         required: true
        //     },
        //     group: [Sequelize.col('CouponCode.coupon_id')]
        // });

        // const collectedCouponsJSON = foundCollectedCoupons.map(data => {
        //     return data.toJSON();
        // });

        let myLocation = {
          latitude: parseFloat(outletRecord.latitude),
          longitude: parseFloat(outletRecord.longitude)
        };

        for (const mpOutlet of outletRecord.MpCouponOutlets) {
          // if (coupon.valid_till >= new Date()) {
          const {
            total_coupons,
            remaining_coupons,
            coupon_type,
            per_user
          } = mpOutlet.Coupon;
          // const userCollectedCoupon = collectedCouponsJSON.find(e => e.coupon_id === coupon.id);
          // let collectedCouponCount = 0;
          // if (userCollectedCoupon) {
          //     collectedCouponCount = userCollectedCoupon.count
          // }
          // let couponPerUser = 0;

          // if (remaining_coupons > 0) {
          //     if (parseInt(collectedCouponCount) >= per_user) {
          //         couponPerUser = 0;
          //     } else {
          //         couponPerUser = per_user - parseInt(collectedCouponCount);
          //     }
          // }
          const couponPerUser = per_user - 5;
          switch (coupon_type) {
            case "common":
              const foundCommonCouponCodes = mpOutlet.Coupon.CouponCodes[0];
              if (foundCommonCouponCodes) {
                for (let i = 0; i < 5; i++) {
                  const template = {
                    coupon_id: mpOutlet.Coupon.id,
                    coupon_name: mpOutlet.Coupon.coupon_name,
                    coupon_type: mpOutlet.Coupon.coupon_type,
                    coupon_image: mpOutlet.Coupon.coupon_image,
                    brand_id: mpOutlet.Coupon.brand_id,
                    brand_name: mpOutlet.Coupon.Brand.brand_name,
                    category_id: mpOutlet.Coupon.Brand.category_id,
                    outlet_id: outletRecord.id,
                    outlet_name: outletRecord.outlet_name,
                    country_id: outletRecord.CountryList ? outletRecord.CountryList.id : 0 /**0 means country_id not exist */
                  };

                  const randomLoc = randomLocation.randomCirclePoint(
                    myLocation,
                    10
                  );

                  template.coupon_code_id = foundCommonCouponCodes.id;
                  template.coupon_code = foundCommonCouponCodes.coupon_code;
                  template.hash = randomString.generate(64);
                  template.longitude = parseFloat(randomLoc.longitude).toFixed(6);
                  template.latitude = parseFloat(randomLoc.latitude).toFixed(6);
                  template.distance = randomLocation.distance(
                    myLocation,
                    randomLoc
                  );
                  data.push(template);
                }
                for (let i = 0; i < couponPerUser; i++) {
                  const template = {
                    coupon_id: mpOutlet.Coupon.id,
                    coupon_name: mpOutlet.Coupon.coupon_name,
                    coupon_type: mpOutlet.Coupon.coupon_type,
                    coupon_image: mpOutlet.Coupon.coupon_image,
                    brand_id: mpOutlet.Coupon.brand_id,
                    brand_name: mpOutlet.Coupon.Brand.brand_name,
                    category_id: mpOutlet.Coupon.Brand.category_id,
                    outlet_id: outletRecord.id,
                    outlet_name: outletRecord.outlet_name,
                    country_id: outletRecord.CountryList ? outletRecord.CountryList.id : 0 /**0 means country_id not exist */
                  };

                  const randomLoc = randomLocation.randomCirclePoint(
                    myLocation,
                    range
                  );

                  template.coupon_code_id = foundCommonCouponCodes.id;
                  template.coupon_code = foundCommonCouponCodes.coupon_code;
                  template.hash = randomString.generate(64);
                  template.longitude = parseFloat(randomLoc.longitude).toFixed(6);
                  template.latitude = parseFloat(randomLoc.latitude).toFixed(6);
                  template.distance = randomLocation.distance(
                    myLocation,
                    randomLoc
                  );
                  data.push(template);
                }
              }
              break;
            default:
              break;
          }
          // } else {
          //     await CollectedCoupon.update({ is_coupon: 'expire' }, { where: { coupon_id: coupon.id, is_coupon: 'active' } })
          // }
        }

        if (data && data.length > 0)
          data.sort(function (a, b) {
            return a.distance - b.distance;
          });
      }
      return response.success(
        res,
        responseMessages.getter(req, "get_coupons", "success"),
        data
      );
    } catch (error) {
      console.log("Error::::", error);
      return response.error(res, error.message);
    }
  };
  /**get coupons on the basis of current user lat long */
  const getCouponsTest = async (req, res) => {
    try {
      const {
        user
      } = req;
      const body = req.body;
      let outletDetail = [];
      const validationResponse = validate.get_coupons_test_body(body);
      if (!validationResponse.status) {
        return response.bodyNotFound(res, validationResponse.msg);
      }
      const {
        current_lat,
        current_long,
        altitude
      } = req.body;
      /** Fetching Brands */
      const foundBrands = await Brand.findAll({
        attributes: ["id", "brand_name"]
      });
      const brandJSON = foundBrands.map(data => {
        return data.toJSON();
      });

      /** Fetching Categories */
      const categoriesJSON = await Categories.findAll();
      console.log('Testing is here:::', parseFloat(current_lat).toFixed(2).slice(0, -1))
      console.log('Testing is here:::', parseFloat(current_long).toFixed(2).slice(0, -1))
      let outletsRecord = await Outlet.findAll({
        where: {
          /**Slice is used to skip the value from rounding(above or off)  */
          latitude: {
            [Op.like]: "%" + parseFloat(current_lat).toFixed(2).slice(0, -1) + "%"
          },
          longitude: {
            [Op.like]: "%" + parseFloat(current_long).toFixed(2).slice(0, -1) + "%"
          },
          altitude: altitude,
          status: true
        },
        include: {
          model: MpCouponOutlet,
          include: {
            model: Coupon,
            include: [{
              model: CouponCode
            }, {
              model: Brand
            }]
          }
        }
      });
      let currentLocation = {
        latitude: parseFloat(current_lat),
        longitude: parseFloat(current_long)
      };
      /**arranging the outlet record to generate coupons */
      outletsRecord = outletsRecord.map(Element => {
        let outletLocation = {
          latitude: parseFloat(Element.latitude),
          longitude: parseFloat(Element.longitude)
        }
        return {
          outletId: Element.id,
          outletName: Element.outlet_name,
          outletArea: Element.area,
          outletLat: Element.latitude,
          outletLong: Element.longitude,
          outletAltitude: Element.altitude,
          brandId: Element.brand_id,
          brandName: Element.MpCouponOutlets[0].Coupon.Brand.brand_name,
          categoryId: Element.MpCouponOutlets[0].Coupon.Brand.category_id,
          couponId: Element.MpCouponOutlets[0].Coupon.id,
          couponName: Element.MpCouponOutlets[0].Coupon.coupon_name,
          couponType: Element.MpCouponOutlets[0].Coupon.coupon_type,
          couponImage: Element.MpCouponOutlets[0].Coupon.coupon_image,
          couponPerUser: Element.MpCouponOutlets[0].Coupon.per_user,
          couponRemaining: Element.MpCouponOutlets[0].Coupon.remaining_coupons,
          couponCodeId: Element.MpCouponOutlets[0].Coupon.CouponCodes[0].id,
          couponCode: Element.MpCouponOutlets[0].Coupon.CouponCodes[0].coupon_code,
          distance: randomLocation.distance(currentLocation, outletLocation)
        };
      });
      if (outletsRecord && outletsRecord.length > 0)
        outletsRecord.sort(function (a, b) {
          return a.distance - b.distance;
        });
      let data = [];
      let test = [];
      for (let i = 0; i < outletsRecord.length; i++) {

        let outletLocation = {
          latitude: parseFloat(outletsRecord[i].outletLat),
          longitude: parseFloat(outletsRecord[i].outletLong)
        };
        test.push(randomLocation.distance(currentLocation, outletLocation))
        outletDetail.push({
          latitude: outletsRecord[i].outletLat,
          longitude: outletsRecord[i].outletLong,
          radius: outletsRecord[i].outletArea,
          altitude: outletsRecord[i].outletAltitude
        });
        /** Fetching collected coupons */
        // let collectedCoupons = await CollectedCoupon.findOne({
        //   attributes: [
        //     [Sequelize.fn("COUNT", "*"), "count"],
        //     [Sequelize.col("CouponCode.coupon_id"), "couponId"]
        //   ],
        //   where: {
        //     user_id: user.data.user_id,
        //     coupon_id: outletsRecord[i].couponId,
        //     coupon_code_id: outletsRecord[i].couponCodeId,
        //     is_coupon: { [Op.not]: "expire" }
        //   },
        //   include: {
        //     attributes: [],
        //     model: CouponCode,
        //     required: true
        //   },
        //   group: [Sequelize.col("CouponCode.coupon_id")]
        // });
        /**setting the value of aready collected coupons by user */
        // let collectedCouponCount = 0;
        // if (collectedCoupons) {
        //   collectedCoupons = collectedCoupons.toJSON();
        //   collectedCouponCount = collectedCoupons.count;
        // }
        /**setting the value of coupon distribution on the basis of remaining coupons and aready colleted by user */
        let couponPerUser = 0;
        // if (outletsRecord[i].couponRemaining > 0) {
        //   if (
        //     parseInt(collectedCouponCount) >= outletsRecord[i].couponPerUser
        //   ) {
        //     couponPerUser = 0;
        //   } else {
        //     couponPerUser =
        //       outletsRecord[i].couponPerUser - parseInt(collectedCouponCount);
        //   }
        // }
        let myLocation = {
          latitude: parseFloat(outletsRecord[i].outletLat),
          longitude: parseFloat(outletsRecord[i].outletLong)
        };
        couponPerUser = outletsRecord[i].couponPerUser - 5;
        switch (outletsRecord[i].couponType) {
          case "common":
            for (let j = 0; j < 5; j++) {
              const template = {
                coupon_id: outletsRecord[i].couponId,
                coupon_name: outletsRecord[i].couponName,
                coupon_type: outletsRecord[i].couponType,
                coupon_image: outletsRecord[i].couponImage,
                brand_id: outletsRecord[i].brandId,
                brand_name: outletsRecord[i].brandName,
                category_id: outletsRecord[i].categoryId,
                outlet_id: outletsRecord[i].outletId,
                outlet_name: outletsRecord[i].outletName,
                radius: outletsRecord[i].outletArea,
                altitude: outletsRecord[i].outletAltitude
              };

              const randomLoc = randomLocation.randomCirclePoint(
                myLocation,
                500
              );

              template.coupon_code_id = outletsRecord[i].couponCodeId;
              template.coupon_code = outletsRecord[i].couponCode;
              template.hash = randomString.generate(64);
              template.longitude = parseFloat(randomLoc.longitude).toFixed(6);
              template.latitude = parseFloat(randomLoc.latitude).toFixed(6);

              data.push(template);
            }
            /**this loop will generates coupons on random locations */
            for (let j = 0; j < couponPerUser; j++) {
              const template = {
                coupon_id: outletsRecord[i].couponId,
                coupon_name: outletsRecord[i].couponName,
                coupon_type: outletsRecord[i].couponType,
                coupon_image: outletsRecord[i].couponImage,
                brand_id: outletsRecord[i].brandId,
                brand_name: outletsRecord[i].brandName,
                category_id: outletsRecord[i].categoryId,
                outlet_id: outletsRecord[i].outletId,
                outlet_name: outletsRecord[i].outletName,
                radius: outletsRecord[i].outletArea,
                altitude: outletsRecord[i].outletAltitude
              };

              const randomLoc = randomLocation.randomCirclePoint(
                myLocation,
                10
              );

              template.coupon_code_id = outletsRecord[i].couponCodeId;
              template.coupon_code = outletsRecord[i].couponCode;
              template.hash = randomString.generate(64);
              template.longitude = parseFloat(randomLoc.longitude).toFixed(6);
              template.latitude = parseFloat(randomLoc.latitude).toFixed(6);

              data.push(template);
            }
            break;
          default:
            break;
        }
      }
      console.log("Test234567uikjhgf::::", test)
      return response.success(
        res,
        responseMessages.getter(req, "get_coupons", "success"), {
          brands: brandJSON,
          categories: categoriesJSON,
          outletDetail: outletDetail,
          coupons: data
        }
      );
    } catch (error) {
      console.log("Testing is here:::", error);
      return response.error(res, error.message);
    }
  };
  /**getting collected coupons list on the basis of active, redeem or expire */
  const getCollectedCouponsList = async (req, res) => {
    try {
      const {
        user
      } = req;

      let findAllCollectedCoupon = await CollectedCoupon.findAll({
        where: {
          user_id: user.data.user_id,
          is_deleted: false,
        },
        include: [{
            required: true,
            model: Coupon,
            include: [{
              required: true,
              model: Outlet,
              attributes: [
                ["id", "outletId"],
                ["outlet_name", "outletName"],
                ["phone_number", "outletPhone"],
                ["address", "outletAddress"],
                ["latitude", "latitude"],
                ["longitude", "longitude"]
              ],
              include: {
                required: true,
                model: Brand,
                include: {
                  model: Categories
                }
              }
            }, {
              model: Currency
            }]
          },
          {
            model: CouponCode
          }
        ]
      });
      let activeCoupons = [];
      let redeemCoupons = [];
      let expireCoupons = [];
      let deletedCoupons = [];

      if (findAllCollectedCoupon) {
        findAllCollectedCoupon.map(Element => {
          var tempData = {
            brandId: Element.Coupon.Outlet.Brand.id,
            brandName: Element.Coupon.Outlet.Brand.brand_name,
            brandImage: Element.Coupon.Outlet.Brand.image,
            collectCouponId: Element.id,
            collectedFrom: Element.location.coordinates,
            hash: Element.hash,
            couponCode: Element.CouponCode.coupon_code,
            isCoupon: Element.is_coupon,
            couponId: Element.Coupon.id,
            couponName: Element.Coupon.coupon_name,
            couponType: Element.Coupon.coupon_type,
            currency: Element.Coupon.Currency.symbol,
            currencySymbol: Element.Coupon.Currency.sign,
            couponPrice: (Element.Coupon.amount - (Element.Coupon.percent_off / 100) * Element.Coupon.amount),
            couponOrignalPrice: Element.Coupon.amount,
            percentOff: Element.Coupon.percent_off,
            couponValidTill: Element.Coupon.valid_till,
            couponDescription: Element.Coupon.description,
            coupanImage: Element.Coupon.coupon_image,
            couponCategory: Element.Coupon.Outlet.Brand.Category.title,
            couponCategoryId: Element.Coupon.Outlet.Brand.Category.id,
            outletDetail: Element.Coupon.Outlet,
            maxDiscount: Element.Coupon.max_discount || null,
            createdAt: Element.createdAt,
            updatedAt: Element.updatedAt,
          }
          if (Element.is_coupon.toUpperCase() === "COLLECTED" && Element.Coupon.status.toUpperCase() != "EXPIRED")
            activeCoupons.push(tempData);
          else if (Element.is_coupon.toUpperCase() === "REDEEMED")
            redeemCoupons.push(tempData);
          else if (Element.is_coupon.toUpperCase() === "EXPIRED" || (Element.Coupon.status === "EXPIRED" && Element.is_coupon.toUpperCase() !== "HIDDEN"))
            expireCoupons.push(tempData);
          else if (Element.is_coupon.toUpperCase() === "HIDDEN")
            deletedCoupons.push(tempData);
        });
        return response.success(
          res,
          responseMessages.getter(req, "get_coupons", "success"), {
            activeCoupons,
            redeemCoupons,
            expireCoupons,
            deletedCoupons
          }
        );
      } else {
        return response.success(
          res,
          responseMessages.getter(req, "get_coupons", "success"),
          []
        );
      }
    } catch (error) {
      console.log("Testing is here :::", error);
      return response.error(res, error.message);
    }
  };
  /** Coupon QR for Redeemption  */
  const redeemptionQR = async (req, res) => {
    try {
      const {
        user
      } = req;
      const respBody = validate.redeemptionQR_body(req.body);
      if (!respBody.status) return response.bodyNotFound(res, respBody.msg);
      let {
        couponId,
        couponCode,
      } = req.body;
      let fetchedRecord = await CollectedCoupon.findOne({
        where: {
          coupon_id: couponId,
          user_id: user.data.user_id,
          is_coupon: 'collected'
        },
        include: [{
          model: CouponCode,
          where: {
            coupon_code: couponCode,
          }
        }, {
          model: Coupon
        }]
      });
      if (fetchedRecord) {
        if (couponCode === fetchedRecord.CouponCode.coupon_code) {
          var brandId = fetchedRecord.Coupon.brand_id;
          var collectedCouponId = fetchedRecord.id;
          var percentOff = fetchedRecord.Coupon.percent_off;
          var couponName = fetchedRecord.Coupon.coupon_name;
          const qrCodeUrl = await QRCode.toDataURL(`${brandId}/${couponCode}/${collectedCouponId}/${percentOff}/${couponName}`);
          return response.success(res, responseMessages.getter(req, "redeem", "success"), qrCodeUrl);
        } else {
          return response.error(res, responseMessages.getter(req, "redeem", "wrongCode"));
        }
      } else {
        return response.error(res, responseMessages.getter(req, "redeem", "notFound"));
      }
    } catch (error) {
      console.log("Error:::", error);
      return response.error(res, error.message);
    }
  };
  /** User Wallet */
  const walletDetail = async (req, res) => {
    try {
      const {
        user
      } = req;
      /** Fetching collected coupons */
      let collectedCoupons = await CollectedCoupon.findAll({
        attributes: [
          [Sequelize.fn("COUNT", "*"), "count"],
          [Sequelize.col("is_coupon"), "isCoupon"],
          [Sequelize.col("CouponCode.coupon_id"), "couponId"]
        ],
        where: {
          user_id: user.data.user_id,
          is_coupon: "REDEEMED",
          is_deleted: false,
        },
        include: {
          attributes: [],
          model: CouponCode,
          required: true
        },
        group: [
          [Sequelize.col("CouponCode.coupon_id")],
          [Sequelize.col("is_coupon")]
        ]
      });
      var redeemHistroy = [];
      var totalSpent = 0;
      var totalSaved = 0;
      var redemptions = 0;
      var average = 0;
      var currency = 'USD';
      if (collectedCoupons) {
        collectedCoupons = collectedCoupons.map(data => {
          return data.toJSON();
        });
        var couponIdsArray = [];
        collectedCoupons.map(data => {
          couponIdsArray.push(data.couponId)
        });

        let allCoupons = await Coupon.findAll({
          where: {
            id: couponIdsArray,
          },
          attributes: ["id", "amount", "percent_off", "coupon_name", "coupon_image", "brand_id"],
          include: [{
            model: CollectedCoupon,
            include: {
              model: CouponCode,
              attributes: ["coupon_code"]
            }
          }, {
            model: Currency
          }, {
            model: Outlet,
            include: [{
              model: Brand,
              attributes: ["brand_name", "image"]
            }, {
              model: TimeTable,
            }]
          }]
        });

        allCoupons.map(coupon => {
          let timeTable = currentDay(coupon);
          let saved = (coupon.percent_off / 100) * coupon.amount;
          let collectedCoupon = collectedCoupons.filter(cc => cc.couponId == coupon.id)[0];
          var couponCode = null;
          if (coupon.CollectedCoupons && coupon.CollectedCoupons.length > 0) {
            if (coupon.CollectedCoupons[0].CouponCode)
              couponCode = coupon.CollectedCoupons[0].CouponCode.coupon_code;
          }


          let remainingAmount = (coupon.amount - saved) * collectedCoupon.count;
          totalSaved = totalSaved + saved * collectedCoupon.count;
          totalSpent = totalSpent + remainingAmount;
          redemptions = redemptions + collectedCoupon.count;
          currency = coupon.Currency.symbol;
          redeemHistroy.push({
            brandName: coupon.Outlet.Brand.brand_name,
            brandImage: coupon.Outlet.Brand.image,
            outletName: coupon.Outlet.outlet_name,
            phoneNumber: coupon.Outlet.phone_number,
            latitude: coupon.Outlet.latitude,
            longitude: coupon.Outlet.longitude,
            couponName: coupon.coupon_name,
            couponImage: coupon.coupon_image,
            currency: coupon.Currency.symbol,
            redeemedOn: coupon.CollectedCoupons[`${coupon.CollectedCoupons.length - 1}`].updatedAt,
            subTotal: coupon.amount * collectedCoupon.count,
            reward: coupon.percent_off,
            total: remainingAmount,
            savedAmount: saved * collectedCoupon.count,
            visit: collectedCoupon.count,
            time: `Opens ${timeTable[0] ? timeTable[0].opening : '12:00 PM'}-${timeTable[0] ? timeTable[0].closing : '12:00 AM'}`,
            couponCode: couponCode,
          });
        });

      }
      average = (totalSaved / redemptions);
      return response.success(res, "Ok", {
        redeemHistroy,
        totalSaved,
        totalSpent,
        redemptions,
        average: average ? average.toFixed(2) : 0,
        currency
      });
    } catch (error) {
      console.log("Error::", error);
      return response.error(res, error.message);
    }
  };
  /** Redeem coupons For Outlet User */
  const redeemCoupons = async (req, res) => {
    try {
      const {
        user
      } = req;
      if (user.data.role !== 'outletuser') return response.error(res, responseMessages.getter(req, "login", "unauthorized"));
      const respBody = validate.redeem_body(req.body);
      if (!respBody.status) return response.bodyNotFound(res, respBody.msg);
      let splitedArray = req.body.couponCode.split('/');
      let fetchedRecord = await CollectedCoupon.findOne({
        where: {
          coupon_id: splitedArray[3],
          user_id: splitedArray[2],
          hash: splitedArray[1],
          is_coupon: 'collected'
        },
        include: {
          model: CouponCode,
          where: {
            coupon_code: splitedArray[0]
          }
        }
      });
      if (!fetchedRecord) {
        return response.error(res, responseMessages.getter(req, "redeem", "notFound"));
      }
      // if (fetchedRecord.MpCouponOutlet.Outlet.user_id !== user.data.user_id) { return response.error(res, responseMessages.getter(req, "redeem", "wrongStore")); }
      /**upating the record of user collected coupon */
      let updateRecord = await CollectedCoupon.update({
        is_coupon: "redeemed"
      }, {
        where: {
          id: fetchedRecord.id
        }
      });
      /**check for coupon status updated or not  */
      if (updateRecord[0] !== 1) {
        return response.error(res, responseMessages.getter(req, "redeem", "error"));
      }

      return response.successMsg(res, responseMessages.getter(req, "redeem", "redeemed"))

    } catch (error) {
      console.log("Error:::", error);
      return response.error(res, error.message);
    }
  };
  /**Summary of Outlet on the basis of loggedin outlet User  */
  const outletSummary = async (req, res) => {
    try {
      const {
        user
      } = req;
      let summary = await Outlet.findOne({
        where: {
          user_id: user.data.user_id
        },
        include: {
          model: MpCouponOutlet,
          include: {
            model: CollectedCoupon,
            include: [{
              model: Coupon,
              include: {
                model: Currency
              }
            }, {
              model: User
            }]
          }
        }
      });

      let details = [];
      let history = summary.MpCouponOutlets
      history.map(Element => {
        let collectedCoupon;
        if (Element.CollectedCoupons[0]) {
          collectedCoupon = Element.CollectedCoupons;
          collectedCoupon = collectedCoupon.filter(data => {
            if (data.is_coupon === 'redeemed') {
              return data;
            }
          });
          collectedCoupon.map(ele => {
            details.push({
              id: ele.Coupon.id,
              name: ele.Coupon.coupon_name,
              currency: ele.Coupon.Currency.symbol,
              orignalPrice: ele.Coupon.amount,
              discount: ele.Coupon.percent_off,
              totalPaid: (ele.Coupon.amount - (ele.Coupon.percent_off / 100) * ele.Coupon.amount),
              usedOn: ele.updatedAt,
              redeemedBy: ele.User.full_name
            });
          })

        }

      });
      return response.success(res, responseMessages.getter(req, "get_coupons", "success"), details)

    } catch (error) {
      console.log('error', error);
      return response.error(res, error.message);
    }
  }

  const hideCollectedCoupon = async (req, res) => {
    try {
      const user = req.user;
      const body = req.body;

      const JoiResponse = JOI.validate(body, {
        collectedCouponId: JOI.number().integer().required(),
      });

      if (JoiResponse.error) {
        return response.error(res, JoiResponse.error.details[0].message);
      }

      body.userId = user.data.user_id;

      let collectedCoupon = await CollectedCoupon.findOne({
        where: {
          user_id: user.data.user_id,
          id: body.collectedCouponId,
        },
      });

      if (collectedCoupon && collectedCoupon.id) {
        if (collectedCoupon.is_coupon == 'HIDDEN')
          return response.error(res, "Coupon is already deleted. WCLD0032");
        else {
          collectedCoupon.is_coupon = "HIDDEN";
          collectedCoupon
            .save()
            .then(() => response.success(res, "Coupon deleted successfully"))
            .catch((err) => response.error(res, "Coupon deletion failed, try later!"))
        }
      } else
        return response.error(res, "Coupon not found");
      //end
    } catch (error) {
      console.log('Error::', error);
      return response.error(res, error.message);
    }

  };

  const getOutletsWithCoupons = async (req, res) => {
    try {
      const user = req.user;
      const body = req.body;

      const JoiResponse = JOI.validate(body, {
        // latitude: JOI.number().precision(7).required(),
        // longitude: JOI.number().precision(7).required(),
        countryIso: JOI.string().max(5).allow('').allow(null).required().error(errors => { // allowing empty or null is a temp patch bcos in skorea country code not coming, may be google map not working properly there. TAK
          errors.forEach(err => {
            switch (err.type) {
              case "any.empty":
                err.message = " country code not found, check if location is enabled";
                break;
              default:
                break;
            }
          });
          return errors;
        }),
      });


      if (JoiResponse.error) {
        return response.error(res, JoiResponse.error.details[0].message);
      }

      if (!body.countryIso) {
        console.log("applying temp patch nd setting country to KR bcoz google map not working properly there. TAK")
        body.countryIso = 'KR';
      }

      const categoriesObj = await Categories.findAll({
        where: {
          parent_id: null,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"]
        },
        include: {
          attributes: ["id", "title", "image", "parent_id"],
          model: Categories,
          as: 'Children',
          include: {
            attributes: ["id", "title", "image", "parent_id"],
            model: Categories,
            as: 'Children',
          }
        }
      });

      var allCat = {
        id: 0,
        title: "All",
        title_en: "All",
        parent_id: null,
      }

      categoriesObj.splice(0, 0, allCat);

      const outletObj = await Outlet.findAll({
        where: {
          country_code: body.countryIso,
          is_deleted: false,
          status: true,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "user_id", "city_id", "state_id", "country_id"]
        },
        include: [{
            required: true,
            model: Brand,
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id"]
            },
            include: {
              model: Categories,
              attributes: ["id", "title", "image", "parent_id"],
            }
          },
          {
            required: false,
            model: Coupon,
            attributes: {
              exclude: ["createdAt", "updatedAt", "currency_id"]
            },
            where: {
              status: 'available',
              is_deleted: false,
              coupon_type: 'common',
              remaining_coupons: {
                [Op.gt]: 0,
              },
            },
          }, {
            required: false,
            model: Coupon,
            as: 'CouponCountryWide',
            attributes: {
              exclude: ["createdAt", "updatedAt", "currency_id"]
            },
            where: {
              status: 'available',
              is_deleted: false,
              coupon_type: 'common',
              is_countrywide: true,
              remaining_coupons: {
                [Op.gt]: 0,
              },
            },
          }, {
            attributes: ["city_name"],
            model: City,
          },
        ]
      });

      var productTypes = await ProductTypes.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"]
        },
      });

      return response.success(
        res,
        responseMessages.getter(req, "get_coupons", "success"), {
          categoriesObj,
          outletObj,
          productTypes
        }
      );

      //end
    } catch (error) {
      console.log('Error::', error);
      return response.error(res, error.message);
    }
  }

  const deleteCollectedCoupon = async (req, res) => {
    try {
      const user = req.user;
      const body = req.body;

      const JoiResponse = JOI.validate(body, {
        collectedCouponId: JOI.number().integer().required(),
      });

      if (JoiResponse.error) {
        return response.error(res, JoiResponse.error.details[0].message);
      }

      body.userId = user.data.user_id;

      let collectedCoupon = await CollectedCoupon.findOne({
        where: {
          user_id: user.data.user_id,
          id: body.collectedCouponId,
        },
      });

      if (collectedCoupon && collectedCoupon.id) {
        if (collectedCoupon.is_deleted)
          return response.error(res, "Coupon is already deleted. WCLD0033");
        else {
          collectedCoupon.is_coupon = "HIDDEN";
          collectedCoupon.is_deleted = true;
          collectedCoupon
            .save()
            .then(() => response.success(res, "Coupon deleted successfully"))
            .catch((err) => response.error(res, "Coupon deletion failed, try later!"))
        }
      } else
        return response.error(res, "Coupon not found");
      //end
    } catch (error) {
      console.log('Error::', error);
      return response.error(res, error.message);
    }

  };

  return {
    getCoupons,
    collectCoupon,
    getCollectedCouponHistory,
    getCouponsByOutlet,
    getCouponsTest,
    getCollectedCouponsList,
    redeemptionQR,
    redeemCoupons,
    walletDetail,
    outletSummary,
    hideCollectedCoupon,
    getOutletsWithCoupons,
    deleteCollectedCoupon
  };
};

module.exports = CouponController;

function currentDay(coupon) {
  const date = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let currentDay = days[date.getDay()];
  let timeTable = coupon.Outlet.TimeTables;
  timeTable = timeTable.filter(Element => {
    if (Element && Element.day === currentDay) {
      return Element;
    }
  });
  return timeTable;
}