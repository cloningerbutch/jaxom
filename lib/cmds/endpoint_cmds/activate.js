const log = require('debug-level')('jaxom:epactivate');
const chalk = require('chalk');
const util = require('util');

exports.command = 'activate';
exports.desc = 'activate endpoint(s)';
exports.handler = async argv => {
    const endpoints = require('../../endpoints');
    var num = await endpoints.activate()
    console.log('activated %d endpoints',num);
}