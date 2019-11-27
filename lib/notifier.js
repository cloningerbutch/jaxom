const log = require('debug-level')('jaxom:notifier');

const jutil = require('./jutil');
const moment = require('moment');
const util = require('util');

const cfg = require('./config').get()

async function testoutage(nd,ep,chan){
    var durmin = nd.duration / 60;
    var r_dur = Math.floor(durmin);
    var flag = (durmin-r_dur == 0)
    log.debug('testing outage, duration is %d min %s',r_dur,flag);
    if (r_dur >= chan.delay){
        var notify = false
        var msg = ''
        if (r_dur == chan.delay){
            log.debug('first...');
            notify = true;
            msg = util.format('[INITIAL] Endpoint %d - \"%s-%s-%s\" is down',ep.seq,ep.env,ep.domain,ep.name)
        }
        else {
            if (chan.freq > 0){
                var sincefirst = r_dur - chan.delay;
                var mod = (sincefirst % chan.freq);
                log.debug('since first: %d, mod: %d',sincefirst,mod);
                if (mod == 0) {
                    log.debug('setting')
                    notify = true
                    msg = util.format('[REPEAT] Endpoint %d - \"%s-%s-%s\" is still down\nDuration is now %s',
                        ep.seq,ep.env,ep.domain,ep.name,jutil.durationExact(moment.duration(nd.duration,'seconds')))
                }
            }
        }
        if (notify){
            log.debug('**** NOTIFY outage ****');
            return await require('./channels').outage(chan,msg);
        }
    }
}
async function testrestore(nd,ep,chan){
    log.debug('sending restore');
    log.debug('bnd %o',nd);
    // only notify restore if duration > channel delay
    if (nd.log.dur > chan.delay * 60){
        msg = util.format('[FINAL] Endpoint %d - \"%s-%s-%s\" service restored\nOriginally started: %s\nTotal outage duration was %s',
        ep.seq,ep.env,ep.domain,ep.name,
        moment.unix(nd.log.start).format(cfg.format.timestamp),
        jutil.durationExact(moment.duration(nd.log.dur,'seconds')))
        return await require('./channels').restore(chan,msg);
    }
}


module.exports = async function(notifydata){
    log.debug('notifier, working through %d',notifydata.length);
    const Endpoints = require('./endpoints');
    const Channels = require('./channels');

    const allep = await Endpoints.loadEndpoints();
    const allchan = await Channels.loadall()

    log.debug('loaded %d eps and %d chans',allep.length,allchan.length)
    notifydata.forEach(nd => {
        log.debug('notify %o',nd);
        var ep = allep.find(elem => {return elem.seq == nd.seq});
        if (ep){
            log.debug('ep %o',ep);
            if (ep.channels){
                ep.channels.forEach(async chanseq => {
                    var chan = allchan.find(elem => {return elem.seq == chanseq})
                    if (chan){
                        log.debug('chan %o',chan);
                        if (chan.enabled){
                            switch (nd.type){
                                case 'outage':
                                    await testoutage(nd,ep,chan);
                                    break;
                                case 'restore':
                                    await testrestore(nd,ep,chan);
                                    break;
                            }
                        }
                    }
                    else {
                        log.error('ERROR chan not found');
                    }
                })    
            }
        }
        else {
            log.error('ERROR ep not found')
        }
    })
}