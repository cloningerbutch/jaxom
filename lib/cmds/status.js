const log = require('debug-level')('jaxom:status');
const chalk = require('chalk');
const moment = require('moment');
const jutil = require('../jutil');
const util = require('util');

exports.command = 'status';
exports.desc = 'current status, all endpoints';
exports.handler = async argv => {
    const endpoints = require('../endpoints');
    const statuses = require('../statuses');
    const allep = await endpoints.loadFilteredEndpoints();
    log.debug(allep);
    const allstat = await statuses.loadall();
    log.debug(allstat);
    allep.forEach(ep => {
        var st = allstat.find(elem => {return elem.seq == ep.seq});
        ep.state = st
        log.debug(util.format('seq=%d state=%o',ep.seq,ep.state))
    })

    console.log(allep.map(elem => {
        var ret =  {
            seq: elem.seq,
            state: 'unk',
            env: elem.env,
            domain: elem.domain,
            name: elem.name,
            active: elem.active,
            dur: 'unk'
        }
        if (elem.state){
            ret.state = elem.state.state
            var m1 = moment.unix(elem.state.first);
            var m2 = moment.unix(elem.state.last);
            var dur = moment.duration(m2.diff(m1))
            ret.dur = jutil.durationExact(dur);
        }
        return ret
    }))

    log.debug('ok');
}