const log = require('debug-level')('jaxom:statuses');
const fs = require('fs');
const path = require('path');
const util = require('util');

const helpers = {
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

module.exports = {
    loadall: async function(){
        return await helpers.load()
    },
    // status
    // seq, state, first, last, statusCode, statusMessage
    updateAll: async function(res){
        var allstat = await helpers.load();
        log.debug('before');
        log.debug(allstat);
        res.forEach(r => {
            // newstate
            log.debug(r.newstate);
            var curr = allstat.find(elem => {return elem.seq == r.seq})
            if (curr){
                Object.assign(curr,{
                    state: r.state,
                    last: r.last,
                    statusCode : r.errorCode || r.statusCode,
                    statusMessage: r.statusMessage
                })
            }
            else {
                curr = {
                    seq: r.seq,
                    state: r.state,
                    first: r.last,
                    last: r.last,
                    statusCode : r.errorCode || r.statusCode,
                    statusMessage: r.statusMessage
                }
                log.debug(util.inspect(curr));
                allstat.push(curr);
            }
        })
        log.debug('after');
        log.debug(allstat)
        return helpers.save(allstat);
    }
}