const log = require('debug-level')('jaxom:eplist');
const chalk = require('chalk');
const inquirer = require('inquirer');
const jutil = require('../../jutil')
var tbl = require('../../clitable');

exports.command = 'count';
exports.desc = 'count unique values for env and domain';
exports.handler = async argv => {
    var allep = await require('../../endpoints').loadEndpoints()
    var envs = [];
    var domains = [];
    allep.forEach(ep => {
        var tmp = envs.find(elem => {return elem.env == ep.env});
        if (tmp){
            tmp.count++
        }
        else {
            envs.push({
                env: ep.env,
                count: 1
            })
        }
        var tmp = domains.find(elem => {return elem.domain == ep.domain});
        if (tmp){
            tmp.count++
        }
        else {
            domains.push({
                domain: ep.domain,
                count:1
            })
        }
    })
    envs.sort((a,b) => {return jutil.strcmp(a.env,b.env)})
    domains.sort((a,b) => {return jutil.strcmp(a.domain,b.domain)})
    if (argv.format == 'json'){
        console.log({
            envs: envs,
            domains: domains
        })
    }
    else {
        var tbl = require('../../clitable');
        console.log(tbl([
            {name: 'env',title: 'Env',width: 7},
            {name: 'count',title: 'Count',width: 7},
        ],envs))
        console.log('');
        console.log(tbl([
            {name: 'domain',title: 'Domain',width: 7},
            {name: 'count',title: 'Count',width: 7},
        ],domains))
    }
}