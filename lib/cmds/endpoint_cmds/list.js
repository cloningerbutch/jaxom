const log = require('debug-level')('jaxom:eplist');
const chalk = require('chalk');
const inquirer = require('inquirer');

exports.command = 'list';
exports.desc = 'list endpoints';
exports.handler = argv => {
    const endpoints = require('../../endpoints');
    endpoints.loadFilteredEndpoints()
    .then(async eps => {
        if (argv.format == 'json'){
            console.log(eps);
        }
        else {
            if (eps.length > 0){
                var tbl = require('../../clitable');
                console.log(tbl([
                    {name: 'seq',title: 'Seq',width: 6},
                    {name: 'active',title: 'Active',width: 7,chalker: val => {
                        return val ? chalk.green : chalk.red
                    }},
                    {name: 'env',title: 'Env',width: 7},
                    {name: 'domain',title: 'Domain',width: 7},
                    {name: 'name',title: 'Name',width: 40},
                ],eps))
            }
        }
    })
    .catch(err => {
        log.error('error listing endpoints %s',err);
    })
}