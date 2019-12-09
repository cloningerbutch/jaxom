const log = require('debug-level')('jaxom:monrunall');
const endpoints = require('../endpoints');
const moment = require('moment');
const stats = require('../statuses');
const runner = require('./runone');

var calcAvail = (up,down) => {
    if (down == 0){
        return 100.0
    }
    else {
        return (up/(up+down)*100.0).toFixed(4)
    }
}

module.exports = {
    run: async function(){
        var allep = await endpoints.loadEndpoints()
        var allstat = await stats.loadall()
        log.info('*** sla reports ***')
        log.debug('calculating sla for %d endpoints',allep.length);
        var envs = [], domains = [];
        allep.forEach(ep => {
            if (!envs.includes(ep.env)) envs.push(ep.env);
            if (!domains.includes(ep.domain)) domains.push(ep.domain);
        })
        var byenv = [],bydomain = [],bygrid = [];
        envs.forEach(env => {
            // env is row
            var row = bygrid.find(elem => {return elem.env == env});
            if (!row){
                row = {env: env};
                bygrid.push(row);
            }
            domains.forEach(domain => {
                var up = 0,down = 0
                allep.forEach(ep => {
                    if ((ep.env == env) && (ep.domain == domain) && (ep.active)){
                        var stat = allstat.find(elem => {return elem.seq == ep.seq});
                        var dur = moment().unix() - stat.start;
                        if (stat.state == 'up') {
                            up += dur;
                        }
                        else { 
                            down += dur;
                        }
                        if (stat.logs){
                            stat.logs.forEach(st => {
                                if (st.state == 'up'){
                                    up += st.dur
                                }
                                else {
                                    down += st.dur
                                }
                            })
                        }    
                    }
                })
                //row[domain] = (up/(up+down)*100.0).toFixed(4)
                row[domain] = calcAvail(up,down);
            })
        })
        domains.forEach(domain => {
            var up = 0, down = 0;
            allep.forEach(ep => {
                if (ep.domain == domain){
                    var stat = allstat.find(elem => {return elem.seq == ep.seq});
                    //var dur = stat.last - stat.start
                    var dur = moment().unix() - stat.start;
                    if (stat.state == 'up') {
                        up += dur;
                    }
                    else { 
                        down += dur;
                    }
                    if (stat.logs){
                        stat.logs.forEach(st => {
                            if (st.state == 'up'){
                                up += st.dur
                            }
                            else {
                                down += st.dur
                            }
                        })
                    }                    
                }
            })
            bydomain.push({
                domain: domain,
                //up: up,
                //down: down,
                //avail: (up/(up+down)*100.0).toFixed(4)
                avail: calcAvail(up,down)
            })
        })
        envs.forEach(env => {
            var up = 0,down = 0;
            allep.forEach(ep => {
                if (ep.env == env){
                    var stat = allstat.find(elem => {return elem.seq == ep.seq});
                    log.debug(Object.keys(stat));
                    if (stat.logs) log.debug(Object.keys(stat.logs[0]))
                    //var dur = stat.last - stat.start
                    var dur = moment().unix() - stat.start;
                    if (stat.state == 'up') {
                        up += dur;
                    }
                    else { 
                        down += dur;
                    }
                    if (stat.logs){
                        stat.logs.forEach(st => {
                            if (st.state == 'up'){
                                up += st.dur
                            }
                            else {
                                down += st.dur
                            }
                        })
                    }
                }
            })
            byenv.push({
                env: env,
                //up: up,
                //down: down,
                //avail: (up/(up+down)*100.0).toFixed(4)
                avail: calcAvail(up,down)
            })
        })
        return Promise.resolve({
            byenv: byenv,
            bydomain: bydomain,
            bygrid: bygrid
        });
    }
}