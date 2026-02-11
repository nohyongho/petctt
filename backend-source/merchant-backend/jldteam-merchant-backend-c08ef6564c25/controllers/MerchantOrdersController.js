/** Model */
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const Categories = require('../models/Categories');

const Order = require('../models/Orders');
const Product = require('../models/Products');
const Country = require('../models/CountryList');
const State = require('../models/StateList');
const City = require('../models/CityList');
const TimeTable = require('../models/TimeTable');
const Orderedproducts = require('../models/Orderedproducts');
const UserAddress = require('../models/UserAddress');
const MerchantOrders = require('../models/MerchantOrders');



/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/MerchantOrdersValidator');
const fs = require('fs')



const path = require('path');


const MerchantOrdersController = () => {



    /**Update order with transaction ID */
    const updateordertransactionid = async(req, res) => {
        try {


            const body = req.body;


            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.updateordertransactionid(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            let getorder = await MerchantOrders.findOne({ where: { id: body.merchant_order_id } });

            if (getorder) {
                if (body.transaction_mode == "crypto") {
                    let updateorderdata = await MerchantOrders.update({
                        transaction_crypto_id: body.transaction_id,
                    }, {
                        where: { id: body.merchant_order_id }
                    });
                }

                if (body.transaction_mode == "fiat") {

                    let updateorderdata = await MerchantOrders.update({
                        transaction_fiat_id: body.transaction_id,

                    }, {
                        where: { id: body.merchant_order_id }
                    });

                }

                response.successMsg(res, constant.MERCHANT_ORDER_STATUS_UPDATED);


            } else {
                return response.error(res, constant.MERCHANT_ORDER_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    };




    /**merchant all coupon orders  */
    const merchantordersListcoupon = async(req, res) => {
        try {


            const { user } = req;
            const validationResponse = validate.merchantordersListcoupon(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            var OrderData = await MerchantOrders.findAll({

                where: { user_id: user.data.user_id },
                order: [
                    ['id', 'DESC'],

                ],

                attributes: ['id',
                    'user_id',
                    'outlet_id',
                    'total',
                    'sub_total',
                    'vat',
                    'coupon_discount',
                    'payment_status',
                    'payment_type',
                    'order_type',
                    'status',
                    'user_address_id',
                    'item_quantity',
                    'table_number',
                    'instructions',
                    'cancel_reason',
                    'waiting_time',
                    'createdAt',
                ],

                include: [{
                        model: UserAddress,
                        attributes: ['full_address', 'mobile_number'],
                        //required:false,

                    },

                    {
                        model: Orderedproducts,
                        attributes: ["id", 'quantity', 'unit_price'],

                        required: true,
                        include: {
                            model: Product,
                        }
                    },
                    {
                        model: Outlet,


                        attributes: ['id', 'outlet_name', 'brand_id'],

                        //  where:whereClauseoutlet,
                        include: {
                            model: Brand,

                            attributes: ['id', 'brand_name'],
                            where: {
                                id: req.body.brand_id,
                            }
                        }
                    },
                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
            });






            if (OrderData.length != 0) {
                testData = OrderData.map(Element => {
                    productsArr = [];
                    Element.Orderedproducts.map(ele => {
                        productsArr.push({
                            unit_price: ele.unit_price,
                            item_name: ele.product.product_name,
                            item_desc: ele.product.product_desc,
                            quantity: ele.quantity,
                        })
                    });
                    return {
                        id: Element.id,
                        total: Element.total,
                        sub_total: Element.sub_total,
                        vat: Element.vat,
                        coupon_discount: Element.coupon_discount,
                        payment_status: Element.payment_status,
                        payment_type: Element.payment_type,
                        order_type: Element.order_type,
                        cancel_charges: Element.cancel_charges,
                        instructions: Element.instructions,
                        status: Element.status,
                        createdAt: Element.createdAt,
                        //  table_number:Element.table_number,
                        // useraddress:Element.user_address_id,
                        user_mobile: (Element.order_type == "DINE_IN") ? '' : Element.UserAddress.mobile_number,
                        address: (Element.order_type == "DINE_IN") ? Element.table_number : Element.UserAddress.full_address,
                        // address:Element.UserAddress.full_address,


                        Brand: {
                            id: Element.Outlet.Brand.id,
                            name: Element.Outlet.Brand.brand_name,

                        },
                        Outlet: {
                            id: Element.Outlet.id,
                            name: Element.Outlet.outlet_name,
                        },
                        //  product:Element.Orderedproducts,
                        products: productsArr,
                        //    product: {

                        //        unit_price:Element.Orderedproducts[0].unit_price,
                        //        item_name:Element.Orderedproducts[0].product.product_name,
                        //        item_desc:Element.Orderedproducts[0].product.product_desc,
                        //    },


                    };
                });
            } else {
                return response.error(res, constant.ORDER_NOTFOUND);
            }


            return response.successDT(res, constant.SUCCESS, testData, testData.length);




        } catch (error) {

            return response.error(res, error.message);
        }
    };



    return {


        updateordertransactionid,


    };
};

module.exports = MerchantOrdersController;