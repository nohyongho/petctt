const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Coupon = require('./Coupon');
const Campaign = require('./Campaign');


const tableName = 'mp_campaign_coupon';

const MpCampaignCoupon = sequelize.define('MpCampaignCoupon', {
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    tableName
});

/** MpCouponCampaign Join */
MpCampaignCoupon.belongsTo(Coupon, {
    foreignKey: 'coupon_id'
});
Coupon.hasMany(MpCampaignCoupon, {
    foreignKey: 'coupon_id'
});

MpCampaignCoupon.belongsTo(Campaign, {
    foreignKey: 'campaign_id'
});
Campaign.hasMany(MpCampaignCoupon, {
    foreignKey: 'campaign_id'
});


module.exports = MpCampaignCoupon;