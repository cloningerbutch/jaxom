const log = require('debug-level')('jaxom:statuses');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const util = require('util');
const request = require('request-promise-native');

const helpers = {
    createlog: function(res,curr){
        return {
            state: curr.state,
            start: curr.start,
            end: res.last,
            dur: res.last - curr.start,
            code: curr.errcode || curr.statusCode,
            seq: res.seq
        }
    },
    load: async function(){
        var cfg = require('./config').get();
        var statPath = cfg.datapath;
        statPath = path.join(statPath,'status.json');
        log.debug(statPath);
        var readFile = util.promisify(fs.readFile);
        var dat = await readFile(statPath,'utf-8');
        return JSON.parse(dat);
    },
    save: async function(allstat){
        var cfg = require('./config').get();
        var statPath = cfg.datapath;
        statPath = path.join(statPath,'status.json');
        log.debug(statPath);
        var writeFile = util.promisify(fs.writeFile);
        await writeFile(statPath,JSON.stringify(allstat),'utf-8');
    }
}

const transitions = {
    downtodown: function(res,curr,newlogs){
        log.debug('handling down to down');
        curr.notify = {
            type: 'outage',
            duration: res.last - curr.start
        }
    },
    downtoup: function(res,curr,newlogs){
        log.debug('handling down to up');
        var eplog = helpers.createlog(res,curr);
        newlogs.push(eplog);
        curr.state = 'up';
        curr.start = res.last;
        curr.notify = {
            type: 'restore',
            log: eplog
        }
    },
    inittodown: function(res,curr){
        log.debug('handling init to down');
        curr.start = res.last;
        curr.state = 'down';
    },
    inittoup: function(res,curr){
        log.debug('handling init to up');
        curr.start = res.last;
        curr.state = 'up';
    },
    uptodown: function(res,curr,newlogs){
        log.debug('handling up to down');
        newlogs.push(helpers.createlog(res,curr))
        curr.state = 'down';
        curr.start = res.last;
    },
    uptoup: function(res,curr,newlogs){
        log.debug('handling up to up');
    }
}

module.exports = {
    loadall: async function(){
        return await helpers.load()
    },
    // status
    // seq, state, first, last, statusCode, statusMessage
    updateAll: async function(results){
        const cfg = require('./config').get()
        var allstat = await helpers.load();
        const newlogs = [];
        const notifications = [];
        results.forEach(res => {
            var curr = allstat.find(elem => {return elem.seq == res.seq})
            if (!curr){
                var now = moment().unix()
                curr = {
                    seq: res.seq,
                    state: 'init',
                    start: now,
                    errcode: '',
                    statusCode: '',
                    last: now
                }
                allstat.push(curr);
            }
            const transitionName = util.format('%sto%s',curr.state,res.state);
            const trHandler = transitions[transitionName];
            if (trHandler){
                trHandler(res,curr,newlogs);
            }
            else {
                log.error('Error: transition handler not defined %s',transitionName)
            }
            // these need to be after the transition handler...
            curr.last = res.last;
            curr.errcode = res.code;
            curr.statusCode = res.statusCode;
            if (curr.notify) {
                var dat = curr.notify;
                dat.seq = res.seq;
                delete curr.notify;
                notifications.push(dat);
            }
        })
        if (notifications.length > 0){
            log.debug('handling notifications');
            await require('./notifier')(notifications);
        }
        if (newlogs.length > 0){
            log.warn('WARNING handle new logs here');
            log.debug(newlogs);
            newlogs.forEach(newlog => {
                var curr = allstat.find(elem => {return elem.seq == newlog.seq})
                if (!curr){
                    log.error('invalid state looking for eplogs');
                }
                else {
                    if (!curr.logs) curr.logs = [];
                    curr.logs.push(newlog);
                    if (curr.logs.length >= cfg.monitor.maxlogs) curr.logs.length = cfg.monitor.maxlogs;
                }
                log.debug(util.format('seq %d now has %d logs',curr.seq,curr.logs.length))
            })
            log.warn('TODO: invoke hooks here');
        }
        // process hooks here
        log.debug('processing hooks');
        var allep = await require('./endpoints').loadEndpoints()
        var promises = [];
        cfg.hooks.forEach(hook => {
            var url = hook.baseuri + 'data';
            var body = {
                stats: JSON.parse(JSON.stringify(allstat)),
                eps: allep
            }
            body.stats.forEach(stat => {
                delete stat.logs
            })
            var opts = {
                uri: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': hook.apikey
                },
                body: JSON.stringify(body),
                timeout: 5000
            }
            promises.push(request({
                uri: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': hook.apikey
                },
                body: JSON.stringify(body)
            })
            .then(resp => {
                console.log(resp);
            })
            .catch(err => {
                console.log(err);
            }))
        })
        await Promise.all(promises);
        log.debug('all done');
        return helpers.save(allstat);
    }
}