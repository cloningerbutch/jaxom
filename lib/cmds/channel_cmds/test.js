const log = require('debug-level')('jaxom:channels');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');

exports.command = 'test';
exports.desc = 'test the notification channel, --seq is required';

const helpers = {
    errorexit: function(s){
        console.log(util.format('%s: %s',chalk.bold.red('ERROR'),s))
        process.exit(1);
    }
}

exports.handler = async argv => {
    console.log('channel test');
    if (!argv.seq){
        helpers.errorexit('--seq option is required for channel test');
    }
    const channels = require('../../channels');
    var chans = await channels.loadall()
    var chan  = chans.find(elem => {return elem.seq == argv.seq})
    if (!chan){
        helpers.errorexit('invalid --seq option ' + argv.seq);
    }
    else {
        var spinner = ora('running channel test...').start();
        await channels.test(chan)
        spinner.stop();
        console.log('done');
    }
}