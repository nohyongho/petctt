/** Model */
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const Country = require('../models/CountryList');
const State = require('../models/StateList');
const City = require('../models/CityList');
const TimeTable = require('../models/TimeTable');
/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/OutletValidator');

const ProductsController = () => {

    /**Get outlet list on the basis of logged-in merchant id */
    const allOutletList = async (req, res) => {
        try {
            const { user } = req;
            const validationResponse = validate.outletList(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });

          
            if(brand !== null){
            let Outlets = await Outlet.findAll({
                where: { brand_id: brand.id },
                include: [
                    { model: Country },
                   // { model: State },
                    { model: City }, { model: Brand }],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
            });
            let recordsTotal = 0;
            let recordsFiltered = 0;
            if(Outlets.length!=0){
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
        }else{
            return response.error(res, constant.OUTLET_NOTFOUND);   
        }

        }else{
            
            return response.error(res, constant.BRAND_NOTFOUND);

        }
        } catch (error) {
            console.log('Error:::', error);
            return response.error(res, error.message);
        }

    }; 
    /**create outlet with logged-in merchant id */
    const createOutlet = async (req, res) => {

        console.log(req.body);
        try {
            const { user } = req;
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
    return {
        allOutletList,
        createOutlet,
    };
};

module.exports = OutletController;