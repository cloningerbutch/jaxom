const log = require('debug-level')('jaxom:eplogs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const moment = require('moment');
const tbl = require('../../clitable')
const jutil = require('../../jutil')

exports.command = 'logs';
exports.desc = 'list logs for endpoint, --seq option required';


function error_exit(s){
    console.log(chalk.bold.red('ERROR ') + s)
    process.exit(1);
}

exports.handler = async argv => {
    const endpoints = require('../../endpoints');
    if (!argv.seq) error_exit('--seq option is required for endpoint logs command')
    var allep = await require('../../endpoints').loadFilteredEndpoints();
    var ep = allep.find(elem => {return elem.seq == argv.seq});
    if (!ep) error_exit('invalid --seq number %d',argv.seq)
    var allstat = await require('../../statuses').loadall();
    var stat = allstat.find(elem => {return elem.seq = argv.seq})
    if (!stat) error_exit('cannot find status for --seq %d',argv.seq)
    console.log(stat.logs);
    stat.logs.forEach(l => {
        l.start_s = moment.unix(l.start).format(argv.format.timestamp),
        l.dur_s = moment.duration(l.dur,'seconds').humanize()
    })
    console.log(tbl([
        {name: 'state',title: 'State',width: 6,chalker: val => {return chalk.white}},
        {name: 'start_s',title: 'Start',width: 22},
        {name: 'dur_s',title: 'Start',width: 50},

    ],stat.logs))
}