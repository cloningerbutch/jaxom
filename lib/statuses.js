const log = require('debug-level')('jaxom:statuses');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const util = require('util');

const helpers = {
    createlog: function(res,curr){
        return {
            state: curr.state,
            start: curr.start,
            end: res.last,
            dur: res.last - curr.start,
            code: curr.errcode || curr.statusCode
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
    },
    downtoup: function(res,curr,newlogs){
        log.debug('handling down to up');
        newlogs.push(helpers.createlog(res,curr))
        curr.state = 'up';
        curr.start = res.last;
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
        var allstat = await helpers.load();
        const newlogs = [];
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
            curr.last = res.last;       // always
            curr.errcode = res.code;
            curr.statusCode = res.statusCode;
            const transitionName = util.format('%sto%s',curr.state,res.state);
            const trHandler = transitions[transitionName];
            if (trHandler){
                trHandler(res,curr,newlogs);
            }
            else {
                log.error('Error: transition handler not defined %s',transitionName)
            }
        })
        log.warn('WARNING handle new logs here');
        log.debug(newlogs);
        return helpers.save(allstat);
    }
}