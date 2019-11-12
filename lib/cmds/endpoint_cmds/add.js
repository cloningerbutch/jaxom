const log = require('debug-level')('jaxom:epadd');
const inquirer = require('inquirer');

exports.command = 'add';
exports.desc = 'add an endpoint to monitor';
exports.handler = argv => {
    const endpoints = require('../../endpoints');
    endpoints.loadEndpoints()
    .then(async eps => {
        log.debug(eps);
        var tmp = {};
        //Object.assign(tmp,argv.defaults.endpoint);
        var init = await endpoints.getTemplate()
        log.debug('init %o',init);
        Object.assign(tmp,init);
        var orig = JSON.stringify(tmp,null,2);
        inquirer.prompt([
            {type: 'editor',name: 'epjson',message: 'Endpoint data',default: JSON.stringify(tmp,null,2)}
        ])
        .then(async resp => {
            var o = JSON.parse(resp.epjson);
            var sNew = JSON.stringify(o,null,2);
            if (sNew != orig){
                log.debug('endpoint changed, decorating');
                o.seq = endpoints.nextSeq(eps);
                var errors = endpoints.validate(o);
                if (errors){
                    errors.forEach(err => {
                        log.error(err.message);
                    })
                }
                else {
                        await endpoints.addEndpoint(o)
                }
            }
            else {
                log.warn('No change from template, not saving');
            }
        })
        .catch(err => {
            log.error('Error adding endpoint: %s',err)
        })
    })
}