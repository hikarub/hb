var express = require('express');
//var bp = require('body-parser');
var app = express();
var path = require('path');
var wx = require('./wx');
var fsx = require('./fsx');

var d = __dirname + '/v';
app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.set('views', d);

var wechat_file = path.join(__dirname, './wechat.txt');
var conf = {
	wechat: {
		appID: 'wx3dade2f3d2a28f00',
		appSecret: '',
		token: 'chichimonde',
		getAccessToken: function(){
			return fsx.readFileAsync(wechat_file)
		},
		saveAccessToken: function(){
			return fsx.writeFileAsync(wechat_file)
		}
	}
};

app.use(wx(conf.wechat));

app.listen(1234);
console.log('Application Started on http://172.20.0.3:1234');

