const log = require('debug-level')('jaxmonitor');
const ipc = require('node-ipc');
const jutil = require('./jutil');
const moment = require('moment');
const rc = require('rc');
const sch = require('node-schedule');

const fmt = "YYYY-MM-DD HH:mm:ss"

const helpers = {
    getUptime: function(){
        var now = moment()
        var diff = now.diff(startup);
        return jutil.durationExact(moment.duration(diff))
    }
}


const startup = moment()
log.info('*****************************************')
log.info('starting %s ',startup.format(fmt));
log.info('*****************************************')

const cfg = require('../jaxom.defaults.json');
rc('jaxom',cfg);
log.debug(cfg);
log.debug('initializing config module');
require('./config').init(cfg);

const endpoints = require('./endpoints');

log.info('configuring ipc server');
ipc.config.id = cfg.monitor.ipcID;
ipc.config.retry = 1500;
ipc.config.silent = true;

log.debug('ipc: %o',ipc);
ipc.serve(function(){
    ipc.server.on('ping',(data,socket)=>{
        log.debug('received ping message');
        ipc.server.emit(socket,'ack','I am here');
    })
    ipc.server.on('status',(data,socket)=>{
        log.debug('received status message');
        ipc.server.emit(socket,'status',{
            status: 'running',
            uptime: helpers.getUptime()
        })
    })
    ipc.server.on('shutdown',(data,socket)=>{
        log.debug('received shutdown message');
        log.debug('cancelling test job');
        sch.cancelJob(job)
        log.debug('stopping ipc server')
        ipc.server.stop();
        log.debug('terminating');
        var now = moment()
        var diff = now.diff(startup);

        log.info('*****************************************')
        log.info('stopping %s, uptime %s ',now.format(fmt),helpers.getUptime());
        log.info('*****************************************')
        
        process.exit(0);
    })
})
log.info('starting ipc server');
ipc.server.start();
log.info('configuring scheduler, cron %s',cfg.cron)
var job = sch.scheduleJob(cfg.cron,async firedate => {
    log.debug('test job, firing at %s',moment(firedate).format(fmt));
    var monall = require('./monitor/runall');
    var res = await monall.run()
    log.debug('result=%o',res);
})