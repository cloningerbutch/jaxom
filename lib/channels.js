const log = require('debug-level')('jaxom:statuses');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const util = require('util');

const helpers = {
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
    }
}