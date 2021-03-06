const log = require('debug-level')('jaxom:index');
const fs = require('fs');
const jutil = require('./jutil');

log.info('app starting');
log.debug('gathering config');
const yargs = require('yargs');
const cfg = require('../jaxom.defaults.json');
require('rc')('jaxom',cfg);
log.debug('config: %o',cfg)
log.debug('initializing config module');
require('./config').init(cfg);
log.info('dispatching to command handlers');

yargs.config(cfg)
    .option('active',{
        describe: 'filter by active only',
        type: 'boolean'
    })
    .option('domain',{
        describe: 'filter by domain attribute, not case sensitive',
        type: 'string'
    })
    .option('downonly',{
        describe: 'list only endpoints that are down',
        type: 'boolean',
        default: false
    })
    .option('env',{
        describe: 'filter by env attribute, not case sensitive',
        type: 'string'
    })
    .option('cron',{
        describe: 'cron string for scheduling tests',
        default: '0 * * * *',
        type: 'string'
    })
    .option('datapath',{
        describe: 'path to the jaxom data files',
        type: 'string'
    })
    .option('format',{
        describe: 'output format [text,json]',
        default: 'text',
        type: 'string'
    })
    .option('seq',{
        describe: 'filter by or specify seq number',
        type: 'number'
    })
    .option('seqorder',{
        describe: 'order by seq number',
        type: 'boolean'
    })
    .option('showbody',{
        describe: 'show response body when testing',
        type: 'boolean'
    })
    .option('showsecrets',{
        describe: 'show secrets when listing config',
        type: 'boolean',
        default: false
    })
    .option('showversions',{
        describe: 'show monitor process versions',
        type: 'boolean',
        default: false
    })
    .commandDir('cmds')
    .demandCommand()
    .wrap(null)
    .help()
    .argv
