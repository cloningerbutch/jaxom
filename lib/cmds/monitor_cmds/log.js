const log = require('debug-level')('jaxom:monlog');
const path = require('path');
const Tail = require('tail').Tail;
const util = require('util');

exports.command = 'log';
exports.desc = 'tail monitor log';
exports.handler = argv => {
    console.log('monitor log');
    console.warn('*** not working yet ***');
}
