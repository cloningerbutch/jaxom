const util = require('util');

module.exports = {
    durationExact: function(dur){
        var segs = [];
        if (dur.years() != 0) segs.push(util.format('%d years',dur.years()))
        if (dur.months() != 0) segs.push(util.format('%d months',dur.months()))
        if (dur.days() != 0) segs.push(util.format('%d days',dur.days()))
        if (dur.hours() != 0) segs.push(util.format('%d hours',dur.hours()))
        if (dur.minutes() != 0) segs.push(util.format('%d minutes',dur.minutes()))
        if (dur.seconds() != 0) segs.push(util.format('%d seconds',dur.seconds()))
        return segs.join(', ');
    },
    envout: function(){
        console.log('environment:');
        Object.keys(process.env).sort().forEach(key => {
            console.log('key %s, val %s',key,process.env[key])
        })
    },
    strcmp: function(str1,str2){
        return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
    }
}