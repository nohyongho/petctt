const commonConstants = {
    serverKey: "AAAAGUEcA74:APA91bEsHkTHOAdZns1P-aOH3KI3jgCpOQCrRyDaG2jCT8TQgP42yFSzN8JvE00W60RkDa81xEvUwkEZec-BDRULIjznvlyY7CNPCN_NpEskIj-63bcfJb3TT9qKlNU-Mq-eyJR0MYK8",
    SATOSHI_PER_COIN: 100000000,
    NEAREST_COIN_RANGE: 10, //nearest coins range to show in meter. This value will be used when this value is not found in general_config_table. TAK
    NUMBER_OF_COINS_TO_SHOW_NEARBY: 20, //number of coins to show in nearby range. This value will be used when this value is not found in general_config_table. TAK
    PER_PERSON_DAILY_LIMIT: 150, //limit of a day user can collect coin. This value will be used when this value is not found in general_config_table. TAK








}
module.exports = {
    commonConstants,
};