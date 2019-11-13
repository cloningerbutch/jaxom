const log = require('debug-level')('jaxom:monrunall');
const endpoints = require('../endpoints');
const runner = require('./runone');

const stats = {
    total: 0,
    success: 0,
    fail: 0
}

module.exports = {
    run: async function(){
        var allep = await endpoints.loadEndpoints()
        var actives = allep.filter(elem => elem.active == true)
        log.debug('testing %d active endpoints',actives.length);
        const promises = [];
        actives.forEach(ep => {
            promises.push(runner.run(ep))
        })
        return Promise.all(promises);
    }
}