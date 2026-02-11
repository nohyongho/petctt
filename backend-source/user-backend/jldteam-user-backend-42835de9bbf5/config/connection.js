const local = {
    database: 'couponTalkTalk_w',
    username: 'tak',
    password: 'jld123',
    host: '127.0.0.1',
    dialect: 'mysql',
};

const development = {
    database: 'couponTalkTalk_w',
    username: 'root',
    password: 'root',
    host: '192.168.0.126',
    dialect: 'mysql',
};

const testing = {
    database: 'couponTalkTalk_k',
    username: 'cttk',
    password: 'pJ9UXkW$S5HMF',
    host: '127.0.0.1',
    dialect: 'mysql',
};

const production = {
    database: 'couponTalkTalk_k',
    username: 'cttk_prod',
    password: '6TP4WG6(TAK{e[JA@1314',
    host: 'ctt-korea-version.cfbqx7bmlxde.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
};

const bank_da = {
    database: 'app_cttk',
    username: 'app_cttk',
    password: 'uhLcKhf2Z66XYqRB',
    host: '206.189.82.204',
    dialect: 'mysql',
};



module.exports = {
    development,
    testing,
    production,
    local,
    bank_da,
};