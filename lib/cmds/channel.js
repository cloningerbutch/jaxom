exports.command = 'channel <command>';
exports.desc = 'manage the app\'s notification channel(s)';
exports.builder = yargs => {
    return yargs.commandDir('channel_cmds');
}

const helpers = {
    loadall: async function(){
        return await Promise.resolve([]);
    }
}

exports.handler = argv => {}