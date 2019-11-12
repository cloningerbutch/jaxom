exports.command = 'list';
exports.desc = 'list the app\'s configuration';
exports.handler = argv => {
    console.log(__dirname);
    console.log(argv);
}