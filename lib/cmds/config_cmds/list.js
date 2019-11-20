exports.command = 'list';
exports.desc = 'list the app\'s configuration';
exports.handler = argv => {
    var tmp = JSON.parse(JSON.stringify(argv))
    if (!argv.showsecrets){
        tmp.secrets = '************';
    }
    console.log(tmp);
}