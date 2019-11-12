exports.command = 'ping';
exports.desc = 'ping the application, ensure runtime consistency';
exports.builder = {
    dir: {
        default: ','
    }
}

exports.handler = argv => {
    console.log('all is well');
}