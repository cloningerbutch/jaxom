const log = require('debug-level')('jaxom:channels');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');

exports.command = 'list';
exports.desc = 'list the notification channel(s)';

exports.handler = async argv => {
    const channels = require('../../channels');
    var chans = await channels.loadall()
    if (argv.seq){
        chans = chans.filter(elem => {
            return elem.seq == argv.seq
        })
    }
    if (argv.format == 'json'){
        console.log(chans)
    }
    else {
        if (chans.length > 0){
            var tbl = require('../../clitable');
            console.log(tbl([
                {name: 'seq',title: 'Seq',width: 6},
                {name: 'type',title: 'Type',width: 15},
                {name: 'enabled',title: 'Enabled',width: 10,chalker: val => {
                    return (val == true) ? chalk.green : chalk.red
                }},
                {name: 'delay',title: 'Delay',width: 10},
                {name: 'freq',title: 'Freq',width: 10},
                {name: 'name',title: 'Name',width: 40},
            ],chans))        
        }
        else {
            console.log(chalk.yellow('WARN'),' No matching channels found')
        }
    }
}