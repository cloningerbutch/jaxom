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
            spinner.stop()
            var chalker = (dat.status == 'running') ? chalk.green : chalk.red
            var msg = util.format('status: %s pid %s uptime: %s',chalker(dat.status),dat.pid,dat.uptime)
            console.log(msg);
            const fmt = new Intl.NumberFormat({style: 'decimal'})
            const fmtpct = new Intl.NumberFormat({style: 'percent'})
            console.log(util.format('Transactions: total: %d, success: %d (%d%%), fail: %d, bandwidth: %d mb',
                fmt.format(dat.stats.total),
                fmt.format(dat.stats.success),
                fmtpct.format(dat.stats.success / dat.stats.total * 100),
                fmt.format(dat.stats.fail),
                fmt.format(dat.stats.bytes/1024/1024)))
            console.log(util.format('Memory (mb): rss %d',fmt.format(dat.mem.rss/1024/1024)));
            if (argv.showversions){
                console.log(util.format('Node %s',dat.versions.node))
                var tmp = Object.keys(dat.versions).filter(elem => elem != 'node').sort();
                var last = tmp[tmp.length-1];
                tmp.forEach(key => {
                    var val = dat.versions[key];
                    var lead = (key != last) ? '╠═' : '╚═'
                    console.log(util.format('%s%s: %s',lead,key,val))
                })
            }
            ipc.disconnect(id);
        })
    })
}

/*
╔═════╦═════╦═══════╗
║ one ║ two ║ three ║
╠═════╬═════╬═══════╣
║     ║     ║       ║
╚═════╩═════╩═══════╝
*/