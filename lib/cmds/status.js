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

    var dat = allep.map(elem => {
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
            var m1 = moment.unix(elem.state.start);
            var m2 = moment()
            var dur = moment.duration(m2.diff(m1))
            ret.dur = dur.humanize()
        }
        return ret
    })
    var tbl = require('../clitable');
    log.warn('** filter downonly here **')
    console.log(tbl([
        {name: 'seq',title: 'Seq',width: 6},
        {name: 'active',title: 'Active',width: 7,chalker: val => {
            return val ? chalk.green : chalk.red
        }},
        {name: 'env',title: 'Env',width: 7},
        {name: 'domain',title: 'Domain',width: 7},
        {name: 'name',title: 'Name',width: 40},
        {name: 'state',title: 'State',width: 10,chalker: val => {
            return (val == 'up') ? chalk.green : chalk.red
        }},
        {name: 'dur',title: 'Duration',width: 20},
    ],dat))


    log.debug('ok');
}