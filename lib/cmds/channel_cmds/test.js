const log = require('debug-level')('jaxom:channels');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');

exports.command = 'test';
exports.desc = 'test the notification channel, --seq is required';

const chanImpls = {
    slack: chan => {
        return require('../../channel/slack')(chan)
    }
}

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
        var impl = chanImpls[chan.type](chan);
        if (!impl){
            helpers.errorexit(util.format('no implementation for channel type \'%s\'',chan.type))
        }
        else {
            var spinner = ora('notifying slack...').start();
            var resp = await impl.test()
            spinner.stop();
            console.log('done');
        }
    }
}