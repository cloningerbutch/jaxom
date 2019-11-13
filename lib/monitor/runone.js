const log = require('debug-level')('jaxom:monrunone');
const request = require('request');

module.exports = {
    run: async function(ep){
        log.debug('running seq=%d',ep.seq);
        var ret = null;
        return new Promise(function(resolve,reject){
            var opts = {
                uri: ep.uri,
                method: ep.method,
                time: true
            }
            log.debug(opts);
            request(opts,function(err,response,body){
                if (err){
                    log.debug(err);
                    log.debug(Object.keys(err).sort())
                    ret = {
                        type: 'error',
                    }
                    Object.keys(err).sort().forEach(key => {
                        ret[key] = err[key]
                    })
                }
                else {
                    log.debug(Object.keys(response).sort())
                    ret = {
                        type: 'success',
                        headers: response.headers,
                        httpVersion: response.httpVersion,
                        method: response.method,
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage,
                        timings: response.timings,
                        timingPhases: response.timingPhases,
                        url: response.url,
                        body: response.body
                    }
                }
                resolve(ret)
            })
        })
    }
}
