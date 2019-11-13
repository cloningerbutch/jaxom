const log = require('debug-level')('jaxom:monstart');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');
const req = require('request');

exports.command = 'status';
exports.desc = 'monitor process status';
exports.handler = argv => {
    console.log('monitor status');
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
            if (!found){
                spinner.fail('monitor process not running');
            }
            process.exit(0);
        })
        ref.on('ack',function(){
            found = true;
            log.debug('ack, disconnecting');
            spinner.succeed('found running monitor');
            spinner.start('asking for status')
            ref.emit('status');
        })
        ref.on('status',function(dat){
            log.debug(dat);
            var chalker = (dat.status == 'running') ? chalk.green : chalk.red
            var msg = util.format('status: %s, uptime: %s',chalker(dat.status),dat.uptime)
            spinner.info(msg);
            spinner.info('next line')    
            ipc.disconnect(id);
        })
    })
}
