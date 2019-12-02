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
            dur: 'unk',
            numlogs: 0,
            channels: elem.channels || []
        }
        if (elem.state){
            ret.state = elem.state.state
            var m1 = moment.unix(elem.state.start);
            var m2 = moment()
            var dur = moment.duration(m2.diff(m1))
            ret.dur = dur.humanize()
            ret.errcode = elem.state.errcode
            ret.statusCode = elem.state.statusCode
            if (elem.state.logs) ret.numlogs = elem.state.logs.length
        }
        return ret
    })
    if (argv.downonly){
        dat = dat.filter(elem => {
            return elem.state == 'down'
        })
    }
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
        {name: 'errcode',title: 'Err Code',width: 15},
        {name: 'statusCode',title: 'HTML Code',width: 15,chalker: val => {
            return (val<400) ? chalk.green : chalk.red
        }},
        {name: 'numlogs',title: '# Logs',width: 10},
        {name: 'channels',title: 'Channels',width: 10}
    ],dat))


    log.debug('ok');
}