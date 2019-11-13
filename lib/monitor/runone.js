const log = require('debug-level')('jaxom:monrunone');
const request = require('request');
const util = require('util');

module.exports = {
    run: async function(ep){
        log.debug('running seq=%d',ep.seq);
        var ret = {};
        return new Promise(function(resolve,reject){
            var opts = {
                uri: ep.uri,
                method: ep.method,
                time: true,
                headers: {
                    "User-Agent": "jaxom"
                },
                timeout: 10000
            }
            if (ep.headers){
                opts.headers = Object.assign(opts.headers,ep.headers);
            }
            if (ep.body){
                opts.body = (typeof ep.body == 'object') ? JSON.stringify(ep.body) : ep.body
            }
            
            log.debug(opts);
            request(opts,function(err,response,body){
                if (err){
                    //log.debug(err);
                    //log.debug(Object.keys(err).sort())
                    ret = {
                        seq: ep.seq,
                        type: 'error',
                        keys: [],
                        code: err.code
                    }
                    Object.keys(err).sort().forEach(key => {
                        ret.keys.push(key)
                    })
                }
                else {
                    //log.debug(Object.keys(response).sort())
                    ret = {
                        seq: ep.seq,
                        type: 'success',
                        headers: response.headers,
                        httpVersion: response.httpVersion,
                        method: response.method,
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage,
                        timings: response.timings,
                        timingPhases: response.timingPhases,
                        body: response.body
                    }
                }
                resolve(ret)
            })
        })
    }
}
