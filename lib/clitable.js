const chalk = require('chalk');
function truncPad(dat,len){
    var tmp = dat;
    if (!tmp) tmp = ''
    if (tmp.length > len) tmp = tmp.substr(0,len-2);
    return tmp.padEnd(len);
}

module.exports = function(opts,data){
    // opts is array of fields {name,title,width}
    //output header row
    var ret = '';
    var hdr = '';
    opts.forEach(opt => {
        var ttl = opt.title || opt.name;
        hdr += chalk.bold.yellow(truncPad(ttl,opt.width));
    })
    //console.log(hdr);
    ret += hdr
    data.forEach(d => {
        var line = '';
        opts.forEach(opt => {
            var s = d[opt.name]
            if (typeof s == 'undefined') s = '';
            var txt = truncPad(s.toString(),opt.width)
            var chalker = opt.chalker ? opt.chalker(s) : require('chalk').white
            line += chalker(txt)
        })
        //console.log(line);
        ret += '\n' + line
    })
    return ret;
}