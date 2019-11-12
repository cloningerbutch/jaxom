var cfg = null;
module.exports = {
    init: function(_cfg){
        cfg = _cfg;
    },
    get: function(){
        return cfg;
    }
}