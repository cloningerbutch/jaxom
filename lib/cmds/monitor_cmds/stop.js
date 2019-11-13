const log = require('debug-level')('jaxom:monstart');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');

exports.command = 'stop';
exports.desc = 'stop monitor process';
exports.handler = argv => {
    console.log('monitor stop');
    const spinner = ora('lookng for  monitor process').start();
    const ipc = require('node-ipc');
    var id = argv.monitor.ipcID;
    ipc.config.id = id;
    ipc.config.retry = 1500;
    ipc.config.maxRetries = 0;
    ipc.config.silent = true;
    log.debug('ipc %o',ipc);

    var found = false;
    ipc.connectTo(id,function(){
        var ref = ipc.of[id];
        ref.on('connect',function(){
            log.debug('connected, sending ping...');
            ref.emit('ping')
        })
        ref.on('disconnect',function(){
            log.debug('disconnect');
            if (!found){
                spinner.succeed('monitor process already stopped (not running)');
            }
            else {
                spinner.succeed('monitor process stopped');
            }
        })
        ref.on('ack',function(){
            found = true;
            log.debug('ack, disconnecting');
            spinner.succeed('found running monitor');
            spinner.start('stopping monitor')
            setTimeout(function(){
                ref.emit('shutdown')
            },500)
        })
    })
}
