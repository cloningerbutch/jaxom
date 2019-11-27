const log = require('debug-level')('jaxom:channels');
const chalk = require('chalk');
const ora = require('ora');
const util = require('util');

const Endpoints = require('../../endpoints');
const Channels = require('../../channels');

exports.command = 'deassign <channel_list> [endpoint_list]';
exports.desc = 'deassign channel to endpoint(s)';

const helpers = {
    errorexit: function(s){
        console.log(util.format('%s: %s',chalk.bold.red('ERROR'),s))
        process.exit(1);
    }
}

exports.handler = async argv => {
    console.log('channel deassign');
    var allep = await Endpoints.loadFilteredEndpoints();
    var allchan = await Channels.loadall();

    var chanlist = argv.channel_list.toString().split(',');
    var eplist;
    if (argv.endpoint_list){
        var eplist = argv.endpoint_list.toString().split(',');
    }
    else {
        var eplist = allep.map(elem => {return elem.seq.toString()})
    }
    //console.log(eplist);

    eplist.forEach(epseq => {
        var ep = allep.find(elem => {return elem.seq == parseInt(epseq)})
        if (!ep) helpers.errorexit(util.format('Invalid endpoint, seq %d',epseq))
    })

    chanlist.forEach(chanseq => {
        var chan = allchan.find(elem => {return elem.seq == parseInt(chanseq)})
        if (!chan) helpers.errorexit(util.format('Invalid channel, seq %d',chanseq))
    })
    console.log('deassigning %d channels to %d endpoints',chanlist.length,eplist.length)

    const changed = [];
    eplist.forEach(epseq => {
        var ep = allep.find(elem => {return elem.seq == parseInt(epseq)})
        ep.channels = ep.channels || []
        chanlist.forEach(chanseq => {
            chanseq = parseInt(chanseq);
            var newlist = [];
            ep.channels.forEach(cs => {
                if (cs != chanseq) newlist.push(cs)
            })
            ep.channels = newlist;
            changed.push(ep);
        })
    })
    console.log('saving %d endpoints',changed.length)
    await Endpoints.saveMultiple(changed);
}