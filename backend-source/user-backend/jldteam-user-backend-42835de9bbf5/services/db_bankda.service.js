const database_bankda = require('../config/database_bankda');

const dbBankdaService = (environment, migrate) => {
    const authenticateDB = () => (
        database_bankda
        .authenticate()
    );

    const dropDB = () => (
        database_bankda
        .drop()
    );

    const syncDB = () => (
        database_bankda
        .sync()
    );

    const successfulDBStart = () => (
        console.info('connection to the database_bankda has been established successfully')
    );

    const errorDBStart = (err) => (
        console.info('unable to connect to the database_bankda:', err)
    );

    const wrongEnvironment = () => {
        console.warn(`only development, staging, test and production are valid NODE_ENV variables but ${environment} is specified`);
        return process.exit(1);
    };

    const startMigrateTrue = () => (
        dropDB()
        .then(() => (
                syncDB()
                .then(() => successfulDBStart())
                .catch((err) => errorDBStart(err))
            )
            .catch((err) => errorDBStart(err))
        )
    );

    const startMigrateWithoutDbDrop = () => (
        syncDB()
        .then(() => successfulDBStart())
        .catch((err) => errorDBStart(err))
    );

    const start = () => {
        if (environment) {
            authenticateDB()
                .then(() => {
                    // if (true) {
                    //     return startMigrateWithoutDbDrop();
                    // }
                    console.info("db bank da ready. TAK");

                })
                .catch((err) => {
                    console.warn("error bank da, retrying. TAK")
                    start()
                })

        } else {
            return wrongEnvironment();
        }
    };

    return {
        start,
    };
};

module.exports = dbBankdaService;