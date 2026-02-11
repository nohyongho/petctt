const Campaign = require('../models/Campaign');
const schedule = require('node-schedule');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    startCampaigns: () => {

        Campaign.findAll()
            .then(campaign => {
                if (campaign.length > 0) {
                    for (let i = 0; i < campaign.length; i++) {
                        if (campaign[i].status == 'not started') {
                            const date = new Date(parseInt(campaign[i].end_date));
                            console.log(date);
                            if (date.toString() !== 'Invalid Date') {
                                var randf = require('randomstring');
                                const jobId = randf.generate();
                                const year = parseInt(date.getFullYear());
                                const month = parseInt(date.getMonth());
                                const day = parseInt(date.getDate());
                                const hour = parseInt(date.getHours());
                                const minute = parseInt(date.getMinutes());
                                const seconds = parseInt(date.getSeconds());

                                var newDate = new Date(year, month, day, hour, minute, 0);

                                const j = schedule.scheduleJob(jobId, newDate, async function () {
                                    const response = await Campaign.update({
                                        status: 'running'
                                    }, {
                                            where: {
                                                id: campaign[i].id
                                            }
                                        });
                                    if (response) {
                                        console.log('<------------------ Campaign started successfully ------------------>');

                                        j.cancel();
                                    } else {
                                        console.log('<------------------ Unable start campaign ------------------>');
                                        j.cancel();
                                    }

                                });
                            }

                        }
                    }


                }
            })
            .catch(error => {
                console.log(error.message);
            })


    },
    endCampaigns: () => {

        Campaign.findAll()
            .then(campaign => {
                if (campaign.length > 0) {
                    for (let i = 0; i < campaign.length; i++) {
                        const date = new Date(parseInt(campaign[i].end_date));

                        if (date.toString() !== 'Invalid Date') {
                            var randf = require('randomstring');
                            const jobId = randf.generate();
                            const year = parseInt(date.getFullYear());
                            const month = parseInt(date.getMonth());
                            const day = parseInt(date.getDate());
                            const hour = parseInt(date.getHours());
                            const minute = parseInt(date.getMinutes());
                            const seconds = parseInt(date.getSeconds());

                            var newDate = new Date(year, month, day, hour, minute, 0);

                            const j = schedule.scheduleJob(jobId, newDate, async function () {
                                const response = await Campaign.update({
                                    status: 'ended'
                                }, {
                                        where: {
                                            id: campaign[i].id
                                        }
                                    });
                                if (response) {
                                    console.log('<------------------ Campaign ended successfully ------------------>');
                                    j.cancel();
                                } else {
                                    console.log('<------------------ Unable end campaign ------------------>');
                                    j.cancel();
                                }

                            });
                        }

                    }


                }
            })
            .catch(error => {
                console.log(error.message);
            })
    },
    startSingleCampaign: async (campaign_id, time) => {
        if (campaign_id && time) {
            let date = new Date(parseInt(time));

            var options = {
                timeZone: "Asia/Dubai",
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric'
            };

            // var formatter = new Intl.DateTimeFormat([], options);
            // date = formatter.format(date);


            const campaign = await Campaign.findOne({
                where: {
                    id: campaign_id
                }
            });

            if (campaign.status == 'not started') {
                if (date.toString() !== 'Invalid Date') {
                    var randf = require('randomstring');
                    const jobId = randf.generate();
                    const year = parseInt(date.getFullYear());
                    const month = parseInt(date.getMonth());
                    const day = parseInt(date.getDate());
                    const hour = parseInt(date.getHours());
                    const minute = parseInt(date.getMinutes());
                    const seconds = parseInt(date.getSeconds());

                    var newDate = new Date(year, month, day, hour, minute, 0)

                    console.log(newDate.toString(), 'starting job');

                    const j = schedule.scheduleJob(jobId, newDate, async function () {

                        const response = await campaign.updateAttributes({
                            status: 'running'
                        });
                        if (response) {
                            console.log('<------------------ Campaign started successfully ------------------>');
                            j.cancel();
                        } else {
                            console.log('<------------------ Unable start campaign ------------------>');
                            j.cancel();
                        }

                    });
                }

            }


        }
    },
    endSingleCampaign: async (campaign_id, time) => {
        if (campaign_id && time) {
            const date = new Date(parseInt(time));

            if (date.toString() !== 'Invalid Date') {
                var randf = require('randomstring');
                const jobId = randf.generate();
                const year = parseInt(date.getFullYear());
                const month = parseInt(date.getMonth());
                const day = parseInt(date.getDate());
                const hour = parseInt(date.getHours());
                const minute = parseInt(date.getMinutes());
                const seconds = parseInt(date.getSeconds());

                var newDate = new Date(year, month, day, hour, minute, 0)


                const j = schedule.scheduleJob(jobId, newDate, async function () {

                    const response = await Campaign.update({
                        status: 'ended'
                    }, {
                            where: {
                                id: campaign_id
                            }
                        });
                    if (response) {
                        console.log('<------------------ Campaign ended successfully ------------------>');
                        j.cancel();
                    } else {
                        console.log('<------------------ Unable end campaign ------------------>');
                        j.cancel();
                    }

                });
            }

        }
    },
    refreshUsedFromDailyBundel: async () => {
        const foundCampaigns = await Campaign.findAll();
        if (foundCampaigns.length > 0) {
            for (let i = 0; i < foundCampaigns.length; i++) {
                if (foundCampaigns[i].status == 'running') {
                    const j = schedule.scheduleJob('0 0 * * *', async function () {
                        console.log('job started');
                        const updatedCampaign = await Campaign.update({
                            used_from_total_coins: 0
                        }, {
                            where: {
                                id: foundCampaigns[i].id
                            }
                        })

                        if (updatedCampaign[0] == 1) {
                            j.cancel();
                        }
                    })
                    
                }
            }
        }
    }
}