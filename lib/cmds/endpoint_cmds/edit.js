const log = require('debug-level')('jaxom:epedit');
const chalk = require('chalk');
const inquirer = require('inquirer');
const util = require('util');

exports.command = 'edit';
exports.desc = 'edit an endpoint, --seq required';
exports.handler = argv => {
    if (!argv.seq){
        console.log(util.format('%s: %s',chalk.red('ERROR'),'--seq option is required for endpoint edit'))
        process.exit(1);
    }
    const endpoints = require('../../endpoints');
    endpoints.loadEndpoints()
    .then(async eps => {
        var ep = eps.find(elem => elem.seq == argv.seq)
        if (!ep){
            console.log(util.format('%s: %s %d',chalk.red('ERROR'),'no endpoint found with seq ',argv.seq))
            process.exit(1);
        }
        var orig = JSON.stringify(ep,null,2);
        inquirer.prompt([
            {type: 'editor',name: 'epjson',message: 'Endpoint data',default: JSON.stringify(ep,null,2)}
        ])
        .then(async resp => {
            var o = JSON.parse(resp.epjson);
            var sNew = JSON.stringify(o,null,2);
            if (sNew != orig){
                var errors = endpoints.validate(o);
                if (errors){
                    errors.forEach(err => {
                        log.error(err.message);
                    })
                }
                else {
                        await endpoints.updateEndpoint(o)
                }
            }
            else {
                log.warn('No change from template, not saving');
            }
        })
   })
}