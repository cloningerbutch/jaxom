const log = require('debug-level')('jaxom:monstart');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const util = require('util');

exports.command = 'start';
exports.desc = 'start monitor process';
exports.handler = argv => {
    console.log('monitor start');
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
            // stop spinner
            if (found){
                spinner.succeed('found already running monitor');
            }
            else {
                spinner.succeed('monitor is not already running');
                spinner.start('starting monitor');
                setTimeout(_ => {
                    var logpath = path.join(argv.datapath,'jaxmon.log');
                    var mpath = path.join(__dirname,'../..','monitor_process.js');
                    var cmd = util.format('nohup /usr/bin/env node %s 1>>%s 2>&1 &',mpath,logpath)
                    //console.log(cmd);
                    var env = Object.assign({},process.env,{
                        DEBUG: 'jax*',
                        DEBUG_LEVEL: argv.monitor.debugLevel
                    })
                    var execp = util.promisify(require('child_process').exec)
                    execp(cmd,{
                        env: env
                    })
                    .then(resp => {
                        spinner.succeed('monitor process started');
                        log.debug(cmd);
                        process.exit(0);    
                    })
                },500)
            }
        })
        ref.on('ack',function(){
            found = true;
            log.debug('ack, disconnecting');
            ipc.disconnect(id);
        })
    })
}
