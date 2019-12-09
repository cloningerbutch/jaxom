const log = require('debug-level')('jaxom:eplogs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const moment = require('moment');
const tbl = require('../../clitable')
const jutil = require('../../jutil')

exports.command = 'reconcile';
exports.desc = 'find orphaned status for endpoints';


function error_exit(s){
    console.log(chalk.bold.red('ERROR ') + s)
    process.exit(1);
}

exports.handler = async argv => {
    const endpoints = require('../../endpoints');
    var allep = await require('../../endpoints').loadFilteredEndpoints();
    var allstat = await require('../../statuses').loadall();
    const orphans = []
    allstat.forEach(stat => {
        var ep = allep.find(elem => {
            return elem.seq == stat.seq
        })
        if (!ep) orphans.push(stat)
    })
    if (orphans.length == 0){
        console.log('No orphaned status found');
    }
    else {
        console.log(`Orphaned endpoint seq: ${orphans.join(',')}`);
    }
}