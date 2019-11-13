const log = require('debug-level')('jaxom:monrunall');
const endpoints = require('../endpoints');
const runner = require('./runone');

module.exports = {
    run: async function(){
        var allep = await endpoints.loadEndpoints()
        var actives = allep.filter(elem => elem.active == true)
        log.debug('testing %d active endpoints',actives.length);
        const promises = [];
        actives.forEach(ep => {
            promises.push(runner.run(ep)
            .then(resp => {
                log.debug(resp);
            }))
        })
        await Promise.all(promises);
        return 'ok'
    }
}