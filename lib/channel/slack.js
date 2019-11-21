const log = require('debug-level')('jaxom:chan:slack');

const helpers = {
}

module.exports =  function(chan){
    const Slack = require('slack');
    const token = require('../config').get().secrets.slacktoken;
    const slack = new Slack({token: token});

    if (!token){
        console.log('ERROR missing secrets.slacktoken')
    }
    return {
        id: 'slack channel impl',
        outage: async msg => {
            var resp = await slack.chat.postMessage({
                channel: chan.channel,
                text: ':bullet_red: ' + msg,
                icon_emoji: ':gear:',
                username: chan.name || 'jaxom'
            })
            log.debug(resp);
        },
        restore: async msg => {
            var resp = await slack.chat.postMessage({
                channel: chan.channel,
                text: ':bullet_green: ' + msg,
                icon_emoji: ':gear:',
                username: chan.name || 'jaxom'
            })
            log.debug(resp);
        },
        test: async _ => {
            var resp = await slack.chat.postMessage({
                channel: chan.channel,
                text: chan.testmessage || ':green_check: *** TEST ONLY ***\nTest message from endpoint monitoring',
                icon_emoji: ':gear:',
                username: chan.name || 'jaxom'
            })
            log.debug(resp);
        }
    }
}