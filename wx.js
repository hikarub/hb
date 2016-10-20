var crypto = require('crypto');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var log4js = require('log4js');
log4js.configure('conf.json', { cwd: ''});
var logger = log4js.getLogger('CC');

function sha1(str){
    var md5 = crypto.createHash('sha1');
    md5.update(str);
    str = md5.digest('hex');
    return str;
}

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential'
};


function Wechat(opt){
    var that = this;
    this.appID = opt.appID;
    this.appSecret = opt.appSecret;
    this.getAccessToken = opt.getAccessToken;
    this.saveAccessToken = opt.saveAccessToken;

    this.getAccessToken()
        .then(function(data){
            try {
                data = JSON.parse(data)
            }
            catch(e){
                return that.updateAccessToken()
            }
            if (that.isValidAccessToken(data)){
                Promise.resolve(data)
            }
            else {
                return that.updateAccessToken
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
            that.saveAccessToken(data);
        })
}

Wechat.prototype.isValidAccessToken = function(data){
    if (!data || !data.access_token || !data.expires_in){
        return false
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Data().getTime());

    if (now < expires_in){
        return true
    }
    else {
        return false
    }
};

Wechat.prototype.updateAccessToken = function(data){
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
    return new Promise(function(resolve, reject){
        request({url: url, json: true}).then(function(response){
            var data = response[1];
            try {
                var now = (new Date().getTime());
                var expires_in = now + (data.expires_in - 20) * 1000;

                data.expires_in = expires_in;
                resolve(data);
            }
            catch(e){
                console.log(e + data);
            }
        })
    });
};

module.exports = function(opt){
    var wechat = new Wechat(opt);
    return function(req, res){
        var token = opt.token;
        var signature = req.query.signature;
        var echostr = req.query.echostr;
        var timestamp = req.query.timestamp;
        var nonce = req.query.nonce;
        var st = [token, timestamp, nonce].sort().join('');
        var cryptSt = sha1(st);
        if (cryptSt === signature) {
            res.end(echostr);
        }
        else {
            res.end('ERROR');
        }
        //res.render('index',data);
        logger.info('['+ req.ips + '] [' + req.method + '] [' + req.originalUrl + ']');
    }

};