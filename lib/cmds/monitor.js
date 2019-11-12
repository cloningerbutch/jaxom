exports.command = 'monitor <command>';
exports.desc = 'manage the monitor process';
exports.builder = yargs => {
    return yargs.commandDir('monitor_cmds');
}
exports.handler = argv => {}