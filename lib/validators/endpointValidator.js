const log = require('debug-level')('jaxom:epvalidator');
const util = require('util');
const ovalid = require('object-validator-js');

module.exports =  function(ep){
    log.debug('testing %o',ep);
    var errors = [];
    var ret = ovalid(ep,{
        seq: 'isInt',
        env: 'isString',
        domain: 'isString',
        name: 'isString',
        uri: 'isURL',
        method: 'isString',
        active: 'isBoolean'
    });
    // additional
    return ret;
}