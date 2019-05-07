import util from './util.js'
import * as http from "../actions/http.js"
var openim = {
	init(){
		let self = this;
		util.checkLogin(function () {
			http.getUser(function(data){
				if( data && data.errno == "0" ){
					let info = data.data;
					let custom = {
						"用户ID": info.uid || "",
						"用户昵称": info.nickname || "",
						"用户等级": info.exp_level || "",
						"注册时间": info.regtime || "",
						"来源": info.src || "",
					}
					let json = {
						userId: "JH-" + info.uid, // 自定义用户的唯一id，不能传空字符串或null，字母大小写、数字及'-'和 '_'组成
						nickName: "JH-" + info.uid + "-" + info.nickname,//自定义用户昵称，定义用户昵称则userId必传
						customField: custom
					};
					window.qimoClientId = json;
					self.addScript();
				}
			});
		});
	},
	addScript(){
		let script = document.createElement("script");
		script.src = "https://ykf-webchat.7moor.com/javascripts/7moorInit.js?accessId=dfccdeb0-5687-11e9-8921-9f55385456c6&autoShow=false&language=ZHCN";
		script.type = "text/javascript";
		script.async = "async";
		document.body.appendChild(script);
	},
	// 点击事件
	qimoChatClick(){
		qimoChatClick && qimoChatClick();
		this.changeMeta(false);
	},
	// 更改 meta标签 viewport
	changeMeta( theflag ){
		let flag = theflag || false;
		let metaELs = document.getElementsByTagName("meta");
		let aMetaEl;
		for(let i = 0; i < metaELs.length; i++){
			if( metaELs[i].name && metaELs[i].name == "viewport" ){
				aMetaEl = metaELs[i];
			}
		}
		let dpr =  1;
		let scale = 1;
		let isIOS = window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
		dpr = isIOS ? Math.min(window.devicePixelRatio, 3) : 1,
		//被iframe引用时，禁止缩放
		dpr = window.top === window.self ? dpr : 1;
		scale = flag ? (1 / dpr) : 1;
		aMetaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale + ',user-scalable=no');
	}
}
module.exports = openim;