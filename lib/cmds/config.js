exports.command = 'config <command>';
exports.desc = 'manage the app\'s configuration';
exports.builder = yargs => {
    return yargs.commandDir('config_cmds');
}
exports.handler = argv => {}