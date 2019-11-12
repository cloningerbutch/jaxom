exports.command = 'endpoint <command>';
exports.desc = 'manage the app\'s endpoints';
exports.builder = yargs => {
    return yargs.commandDir('endpoint_cmds');
}
exports.handler = argv => {}