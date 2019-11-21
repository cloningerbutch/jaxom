const log = require('debug-level')('jaxom:statuses');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const util = require('util');

// implementations
const impl_path_root = './channel/'

const impls = {
    slack: require(path.join(__dirname,impl_path_root,'slack'))
}
const helpers = {
    getimpl: function(chan){
        var impl = impls[chan.type](chan);
        console.log(util.inspect(impl));
        return impl
    },
    Qgetimpl: function(chan){
        var ret = null;
        log.debug(__dirname);
        try {
            ret = require(impl_path_root + chan.type)(chan)
        }
        catch(e){
            log.error('No implementation for channel type %s',chan.type)
        }
        return ret
    },
    loadall: async function(){
        var cfg = require('./config').get();
        var statPath = cfg.datapath;
        statPath = path.join(statPath,'channels.json');
        log.debug(statPath);
        var readFile = util.promisify(fs.readFile);
        var dat = await readFile(statPath,'utf-8');
        return JSON.parse(dat);
    }
}

module.exports = {
    loadall: async function(){
        return helpers.loadall()
    },
    outage: async function(chan,msg){
        log.debug('notifying outage for chan seq %d',chan.seq);
        var impl = helpers.getimpl(chan);
        return impl.outage(msg)
    },
    restore: async function(chan,msg){
        log.debug('notifying restore for chan seq %d',chan.seq);
        var impl = helpers.getimpl(chan);
        return impl.restore(msg)
    },
    test: async function(chan){
        log.debug('running test for chan seq %d',chan.seq);
        var impl = helpers.getimpl(chan);
        return impl.test()
    }
}