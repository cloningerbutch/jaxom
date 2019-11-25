const log = require('debug-level')('jaxom:epdeactivate');
const chalk = require('chalk');
const util = require('util');
const request = require('request-promise-native');

var largv = null;

function error_exit(s){
    console.log(chalk.bold.red('ERROR: ') + s);
    process.exit(1);
}

function showkeys(o){
    console.log(Object.keys(o).sort());
}


function show_error(context){
    if (context.name == 'StatusCodeError'){
        // this is a non-technical error
        show_status_fail(context.response);
    }
    else {
        console.log(util.format('%s %s - %s',chalk.bold.red('ERROR'),context.name,context.message))
    }
}

function show_status_fail(context){
    console.log(util.format('%s - HTTP code: %d %s'),chalk.green.yellow('WARN'),context.statusCode,context.statusMessage)
    console.log(chalk.bold('Response Headers'));
    Object.keys(context.headers).sort().forEach(key => {
        console.log(util.format('  %s: %s',key,context.headers[key]))
    })
    console.log(chalk.bold('Timing phases (ms):'));
    //console.log(context.timingPhases);
    Object.keys(context.timingPhases).forEach(key => {
        console.log(util.format('  %s: %s',key,context.timingPhases[key].toFixed(2)))
    })
    console.log('body length: %d',context.body.length)
    if (largv.showbody){
        console.log(chalk.bold('Body:'));
        console.log(context.body)
    }
}

function show_success(context){
    console.log(util.format('%s - HTTP code: %d %s'),chalk.green.bold('SUCCESS'),context.statusCode,context.statusMessage)
    console.log(chalk.bold('Response Headers'));
    Object.keys(context.headers).sort().forEach(key => {
        console.log(util.format('  %s: %s',key,context.headers[key]))
    })
    console.log(chalk.bold('Timing phases (ms):'));
    //console.log(context.timingPhases);
    Object.keys(context.timingPhases).forEach(key => {
        console.log(util.format('  %s: %s',key,context.timingPhases[key].toFixed(2)))
    })
    console.log('body length: %d',context.body.length)
    if (largv.showbody){
        console.log(chalk.bold('Body:'));
        console.log(context.body)
    }
}

exports.command = 'test';
exports.desc = 'test the endpoint once, --seq required';
exports.handler = async argv => {
    largv = argv;
    if (!argv.seq){
        error_exit('--seq option must be provided');
    }
    const Endpoints = require('../../endpoints');
    var allep = await Endpoints.loadFilteredEndpoints();
    var ep = allep[0];
    var opts = {
        uri: ep.uri,
        method: ep.method,
        time: true,
        headers: {
            "User-Agent": "jaxom"
        },
        timeout: 10000,
        resolveWithFullResponse: true
    }
    if (ep.headers){
        opts.headers = Object.assign(opts.headers,ep.headers);
    }
    if (ep.body){
        opts.body = (typeof ep.body == 'object') ? JSON.stringify(ep.body) : ep.body
    }    
    var isErr = false;
    var context = null;
    try {
        var resp = await(request(opts));
        context = resp;
    }
    catch(e){
        isErr = true;
        context = e
    }
    (isErr) ? show_error(context) : show_success(context);
}
