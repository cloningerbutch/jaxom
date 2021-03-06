const log = require('debug-level')('jaxom:monitor');
const fs = require('fs');
const ipc = require('node-ipc');
const jutil = require('./jutil');
const moment = require('moment');
const path = require('path');
const rc = require('rc');
const request = require('request-promise-native');
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
        log.debug(util.format('result=%o',result))
    })
    var allep = await require('./endpoints').loadEndpoints();
    log.debug('there are %d endpoints',allep.length);
    res.forEach(result => {
        var ep = allep.find(elem => {return elem.seq == result.seq})
        log.debug(ep);
        if (ep){
            if (result.state == 'down'){
                if (ep.successOverride){
                    log.debug('tesitng for success overrides');
                    ep.successOverride.forEach(ovr => {
                        if (ovr == result.statusCode) {
                            log.debug('overriding to up')
                            result.state = 'up'
                        }
                    })
                }
            }
            else {
                if (ep.failOverride){
                    ep.failOverride.forEach(ovr => {
                        if (ovr == result.statusCode) {
                            log.debug('overriding to down');
                            result.state = 'down'
                        }
                    })
                }
            }                
        }
    })
    await statuses.updateAll(res);
    await helpers.writeProcessStats()
    var res = await require('./monitor/sslreport').run();
    var promises = [];
    cfg.hooks.forEach(async hook => {
        var opts = {
            uri: util.format('%s%s',hook.baseuri,'sladata'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': hook.apikey
            },
            body: JSON.stringify(res)
        }
        log.debug(opts);
        promises.push(request(opts));
    })
    await Promise.all(promises);
    var h2 = new Date()
    var el = (h2-h1)/1000
    console.log('elapsed %s sec',elfmt.format(el));
})
/*
var ssljob = sch.scheduleJob(cfg.monitor.cron,async firedate => {
    var res = await require('./monitor/sslreport').run();
    //console.log(JSON.stringify(res,null,2));
    //console.log(cfg.hooks);
    cfg.hooks.forEach(async hook => {
        var opts = {
            uri: util.format('%s%s',hook.baseuri,'sladata'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': hook.apikey
            },
            body: JSON.stringify(res)
        }
        log.debug(opts);
        var resp = await request(opts);
        log.debug(resp);
    })
}) */
