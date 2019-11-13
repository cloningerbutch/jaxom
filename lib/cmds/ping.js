exports.command = 'ping';
exports.desc = 'ping the application, ensure runtime consistency';
exports.builder = {
    dir: {
        default: ','
    }
}

exports.handler = argv => {
    const util = require('util');
    const request = util.promisify(require('request'));
    const chalk = require('chalk');
    request('https://api.quotable.io/random')
    .then(resp => {
        var dat = JSON.parse(resp.body);
        console.log(util.format('\"%s\"     -- %s',chalk.yellow(dat.content),chalk.white(dat.author)))
        console.log('status: everything looks good');
    })
}