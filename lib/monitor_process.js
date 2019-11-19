const log = require('debug-level')('jaxom:monitor');
const fs = require('fs');
const ipc = require('node-ipc');
const jutil = require('./jutil');
const moment = require('moment');
const path = require('path');
const rc = require('rc');
const sch = require('node-schedule');
const statuses = require('./statuses');
const util = require('util');

const fmt = "YYYY-MM-DD HH:mm:ss"
var stats = {
    total: 0,
    success: 0,
    fail: 0,
    bytes: 0,
}
const monitor_stats_filename = 'monitor_stats.json';

const helpers = {
    getProcessStatPath: function(){
        return path.join(cfg.datapath,monitor_stats_filename);
    },
    getUptime: function(){
        var now = moment()
        var diff = now.diff(startup);
        return jutil.durationExact(moment.duration(diff))
    },
    readProcessStats: function(){
        try {
            log.info('loading process stats');
            var dat = fs.readFileSync(helpers.getProcessStatPath(),'utf-8');
            stats = JSON.parse(dat);
            log.debug('starting with %o',stats)
        }
        catch(e){
            log.warn('error loading process stats file, starting from zeros');
            log.warn(e);
        }

    },
    writeProcessStats: async function(){
        util.promisify(fs.writeFile)(helpers.getProcessStatPath(),JSON.stringify(stats,null,2),'utf-8')
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

helpers.readProcessStats();     // this is sync!

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
            uptime: helpers.getUptime(),
            stats: stats,
            mem: process.memoryUsage(),
            pid: process.pid,
            versions: process.versions
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
log.info('configuring scheduler, cron %s',cfg.monitor.cron)
var elfmt = new Intl.NumberFormat()
var job = sch.scheduleJob(cfg.monitor.cron,async firedate => {
    log.debug('test job, firing at %s',moment(firedate).format(fmt));
    var h1 = new Date();
    var monall = require('./monitor/runall');
    var res = await monall.run()
    res.forEach(result => {
        stats.total++;
        if (result.type == 'success'){
            stats.success++;
            stats.bytes += result.body.length;
            delete result.body;
            result.state = 'up'
            if (result.statusCode >= 400){
                result.state = 'down';
            }
        }
        else {
            stats.fail++;
            result.state = 'down'
        }
    })
    log.warn('TODO check overrides');
    res.forEach(result => {
        if (result.state == 'up'){
            result.newstate = {
                state: result.state,
                last: result.last,
                statusCode: result.statusCode,
                statusMessage: result.statusMessage
            }
        }
        else {
            result.newstate = {
                state: result.state,
                last: result.last,
                errorCode: result.code || result.statusCode
            }
        }
        log.debug(result.newstate);
    })

    await statuses.updateAll(res);


    await helpers.writeProcessStats()
    var h2 = new Date()
    var el = (h2-h1)/1000
    console.log('elapsed %s sec',elfmt.format(el));
    /*
    var timings = res.map(elem => {
        return {
            seq: elem.seq,
            elapse: (elem.timings != null) ? elem.timings.end : -1
        }
    }).sort((a,b) => b.elapse - a.elapse)
    console.log(timings);
    var tmpstates = res.map(elem => {
        return {
            seq: elem.seq,
            state: elem.state
        }
    }).sort((a,b) => b.seq - a.seq)
    console.log(tmpstates);
    */
})

