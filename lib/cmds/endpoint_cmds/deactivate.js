const log = require('debug-level')('jaxom:epdeactivate');
const chalk = require('chalk');
const util = require('util');

exports.command = 'deactivate';
exports.desc = 'deactivate endpoint(s)';
exports.handler = async argv => {
    const endpoints = require('../../endpoints');
    var num = await endpoints.deactivate()
    console.log('deactivated %d endpoints',num);
}