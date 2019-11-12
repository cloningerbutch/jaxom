const log = require('debug-level')('jaxom:epdel');
const chalk = require('chalk');
const inquirer = require('inquirer');
const util = require('util');

exports.command = 'delete';
exports.desc = 'delete an endpoint, --seq required';
exports.handler = argv => {
    if (!argv.seq){
        console.log(util.format('%s: %s',chalk.red('ERROR'),'--seq option is required for endpoint delete'))
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
        await endpoints.deleteEndpoint(argv.seq);
        console.log('endpoint seq=%d deleted',argv.seq);
   })
}