/** Model */
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const Categories = require('../models/Categories');
const Product = require('../models/Products');
const MpTypeProducts = require('../models/MpTypeProducts');
const TypeProducts = require('../models/TypeProducts');

const Country = require('../models/CountryList');
const State = require('../models/StateList');
const City = require('../models/CityList');
const TimeTable = require('../models/TimeTable');
/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/ProductsValidator');
const fs = require('fs')



const path = require('path');


const ProductsController = () => {




    /**create outlet with logged-in merchant id */
    const createProduct = async(req, res) => {
        if (!req.fileexist) {
            return response.error(res, "Please provide Product Image");

        }
        // const body = req.body;
        const body = JSON.parse(req.body.createProduct);

        try {
            const { user } = req;
            const validationResponse = validate.createProduct(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }





            /**inserting outlet record */
            let newProduct = await Product.create({
                product_name: body.product_name,
                product_desc: body.product_desc,
                category_id: body.categories_id,
                user_id: user.data.user_id,
                brand_id: body.brand_id,
                outlet_id: body.outlet_id,
                price: body.price,

                // state_id: req.body.stateId,

                image: req.filepath,



                status: true,
                is_deleted: false,


            });
            if (!newProduct) {
                return response.error(res, constant.SERVER_ERROR);
            }


            if (typeof body.type_product != "undefined") {

                var type_products = body.type_product;

                arrtypeproduct = [];

                if (type_products.indexOf(',') > -1) {
                    arrtypeproduct = type_products.split(',')

                } else {
                    arrtypeproduct = [body.type_product];
                }



                type_product_arr = [];
                for (var i = 0; i < arrtypeproduct.length; i++) {

                    typeproductdata = {
                        product_id: newProduct.id,
                        type_product_id: parseInt(arrtypeproduct[i], 10),

                    }
                    type_product_arr.push(typeproductdata)
                }



                MpTypeProducts.bulkCreate(type_product_arr);
            }
            return response.successMsg(res, constant.PRODUCT_CREATED);

        } catch (error) {

            return response.error(res, error.message);
        }

    };



    /**get all registered outlets of specific brand(merchant's id)  */
    const merchantProductList = async(req, res) => {
        try {


            const { user } = req;
            const validationResponse = validate.merchantProductList(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            var ProductsData = await Product.findAll({

                where: [{ user_id: user.data.user_id }, { is_deleted: false }],
                include: [{
                        model: Brand,
                        required: true,
                        where: {
                            user_id: user.data.user_id
                        }
                    },
                    {

                        model: Outlet,
                    },
                    {

                        model: Categories,

                    },
                    {

                        model: MpTypeProducts,
                        required: false,
                        include: {

                            model: TypeProducts,
                        }
                    },
                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
            });
            if (ProductsData.length != 0) {
                testData = ProductsData.map(Element => {



                    typeproductsArr = [];
                    Element.MpTypeProducts.map(ele => {
                        typeproductsArr.push({

                            id: ele.TypeProduct.id,
                            type_title: ele.TypeProduct.type_title,

                        })
                    });



                    return {
                        id: Element.id,
                        name: Element.product_name,
                        product_desc: Element.product_desc,
                        product_price: Element.price,
                        category_id: Element.category_id,
                        product_image: Element.image,
                        phoneNumber: Element.phone_number,
                        createdAt: Element.createdAt,
                        status: Element.status ? 'Active' : 'Blocked',

                        productTypes: typeproductsArr,

                        brand: {
                            id: Element.Brand.id,
                            name: Element.Brand.brand_name,
                            image: Element.Brand.image
                        },
                        outlet: {
                            id: Element.Outlet.id,
                            name: Element.Outlet.outlet_name,
                            phone_number: Element.Outlet.phone_number
                        },

                    };
                });
            } else {
                return response.error(res, constant.PRODUCT_NOTFOUND);
            }

            return response.successDT(res, constant.SUCCESS, testData, ProductsData.length);




        } catch (error) {

            return response.error(res, error.message);
        }
    };







    /**get all registered outlets products of specific brand(merchant's id)  */
    const outletProductList = async(req, res) => {
        try {




            const { user } = req;
            const validationResponse = validate.outletProductList(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            var OutletData = await Outlet.findAll({

                where: { id: req.body.outlet_id },

            });




            var ProductsData = await Product.findAll({

                where: [{ user_id: user.data.user_id }, { outlet_id: req.body.outlet_id }, { is_deleted: false }],
                include: [{

                        model: MpTypeProducts,
                        required: false,
                        include: {

                            model: TypeProducts,
                        }
                    },
                    //  include: [{
                    //   model: Outlet,
                    //  required: true,
                    //  where: [{id:req.body.outlet_id},
                    //     {
                    //     user_id: user.data.user_id
                    // }

                    //]
                    //   }
                    // ,
                    // {

                    //     model:Brand,
                    // },
                    // {

                    //     model: Categories,merchantProductList

                    // },

                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
                    // offset:0
            });
            if (ProductsData.length != 0) {
                productsData = ProductsData.map(Element => {

                    typeproductsArr = [];
                    Element.MpTypeProducts.map(ele => {
                        typeproductsArr.push({

                            id: ele.TypeProduct.id,
                            type_title: ele.TypeProduct.type_title,

                        })
                    });
                    return {
                        id: Element.id,
                        name: Element.product_name,
                        product_desc: Element.product_desc,
                        product_price: Element.price,
                        category_id: Element.category_id,
                        product_image: Element.image,
                        phoneNumber: Element.phone_number,
                        createdAt: Element.createdAt,
                        status: Element.status ? 'Active' : 'Deactivated',
                        productTypes: typeproductsArr,


                        // brand: {
                        //     id: Element.Brand.id,
                        //     name: Element.Brand.brand_name,
                        //     image: Element.Brand.image
                        // },
                        // outlet: {
                        //     id: Element.Outlet.id,
                        //     name: Element.Outlet.outlet_name,
                        //     phone_number: Element.Outlet.phone_number
                        // }
                    };
                });
            } else {
                return response.error(res, constant.PRODUCT_NOTFOUND);
            }
            var finaldata = {};
            finaldata.outletData = OutletData[0];
            finaldata.productData = productsData;

            return response.successDT(res, constant.SUCCESS, finaldata, ProductsData.length);





        } catch (error) {

            return response.error(res, error.message);
        }
    };


    /**get all & available, expired, pending Product list    */
    const allProductList = async(req, res) => {
        try {
            const { user } = req;
            const { type, status } = req.body;
            const bodyResposnse = validate.couponsList(req.body);
            if (bodyResposnse.status === false) {
                return response.error(res, bodyResposnse.msg);
            }
            let coupons;
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });
            /**all coupons list */
            if (type === 'all') {
                coupons = await Coupon.findAll({
                    where: { brand_id: brand.id },
                    order: [
                        ['createdAt', 'desc']
                    ],
                    limit: parseInt(req.body.limit),
                    offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
                });
            }
            /**all available, expired or Pending Coupon list  */
            else if (type === 'other') {
                coupons = await Coupon.findAll({
                    where: { status: status, brand_id: brand.id },
                    order: [
                        ['createdAt', 'desc']
                    ],
                    limit: parseInt(req.body.limit),
                    offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
                });
            }
            let recordsTotal = 0;
            let recordsFiltered = 0;
            recordsTotal = coupons.length;
            recordsFiltered = coupons.length;
            coupons = coupons.map(Element => {
                return {
                    id: Element.id,
                    name: Element.coupon_name,
                    totalCoupons: Element.total_coupons,
                    type: Element.coupon_type,
                    validFrom: Element.valid_from,
                    validTill: Element.valid_till
                };
            });


            return response.successDT(res, constant.SUCCESS, coupons, recordsTotal, recordsFiltered);
        } catch (error) {

            return response.error(res, error.message);
        }
    };




    /**Update outlet record */
    const updateproduct = async(req, res) => {
        try {

            //const body = req.body;
            const body = JSON.parse(req.body.updateProduct);
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.updateproduct(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            //  let { oldPassword, newPassword } = req.body;

            let getproduct = await Product.findOne({ where: { id: body.product_id, user_id: user.data.user_id } });

            if (getproduct) {
                let updateproductdata = await Product.update({
                        product_name: body.product_name,
                        product_desc: body.product_desc,
                        category_id: body.category_id,
                        outlet_id: body.outlet_id,
                        price: body.price,
                    },

                    {
                        where: { id: body.product_id, user_id: user.data.user_id }
                    });

                if (req.fileexist) {
                    await Product.update({
                            image: req.filepath,
                        },

                        {
                            where: { id: body.product_id, user_id: user.data.user_id }
                        });
                }

                // product types update
                if (typeof body.type_product != "undefined") {

                    let getproductmapp = await MpTypeProducts.findOne({
                        where: { product_id: body.product_id }
                    })
                    if (getproductmapp) {

                        await MpTypeProducts.destroy({
                            where: { product_id: body.product_id }
                        })
                    }
                    var type_products = body.type_product;


                    arrtypeproduct = [];
                    if (type_products.indexOf(',') > -1) {
                        arrtypeproduct = type_products.split(',')

                    } else {
                        arrtypeproduct = [body.type_product];
                    }

                    type_product_arr = [];
                    for (var i = 0; i < arrtypeproduct.length; i++) {
                        typeproductdata = {
                            product_id: body.product_id,
                            type_product_id: parseInt(arrtypeproduct[i], 10),

                        }
                        type_product_arr.push(typeproductdata)
                    }

                    MpTypeProducts.bulkCreate(type_product_arr);
                }

                if (updateproductdata[0] === 1) {
                    response.successMsg(res, constant.PRODUCT_UPDATED);
                } else {
                    return response.error(res, "Product Not Updated");
                }

            } else {
                return response.error(res, constant.PRODUCT_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    };


    /**delete outlet record */
    const deleteproduct = async(req, res) => {
        try {
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.deleteproduct(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            //  let { oldPassword, newPassword } = req.body;

            let getProduct = await Product.findOne({ where: { id: req.body.product_id, user_id: user.data.user_id } });



            if (getProduct) {


                let updateproductdata = await Product.update({
                        is_deleted: true,

                    },

                    {
                        where: { id: req.body.product_id, user_id: user.data.user_id }
                    });





                if (updateproductdata[0] === 1) {
                    response.successMsg(res, constant.PRODUCT_DELETED);
                } else {
                    return response.error(res, constant.PRODUCT_CANTDELETED);
                }

            } else {
                return response.error(res, constant.PRODUCT_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    }











    return {
        //  allOutletList,
        createProduct,
        merchantProductList,
        allProductList,
        outletProductList,
        updateproduct,
        deleteproduct,

    };
};

module.exports = ProductsController;