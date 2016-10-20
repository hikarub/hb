var crypto = require('crypto');
var Promise = require('bluebird');
var rawbody = require('raw-body');
var request = Promise.promisify(require('request'));
var Wechat = require('./wechat');


var log4js = require('log4js');
log4js.configure('conf.json', { cwd: ''});
var logger = log4js.getLogger('CC');

function sha1(str){
    var md5 = crypto.createHash('sha1');
    md5.update(str);
    str = md5.digest('hex');
    return str;
}

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

        if (req.method === 'GET') {
            if (cryptSt === signature) {
                res.end(echostr);
            }
            else {
                res.end('ERROR');
            }
        }
        else if (req.method === 'POST'){
            if (cryptSt !== signature) {
                res.end('NO COMMENT');
                return false
            }
            var data = rawbody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });

            console.log(data.toString());
        }
        //res.render('index',data);
        logger.info('['+ req.ips + '] [' + req.method + '] [' + req.originalUrl + ']');
    }

};