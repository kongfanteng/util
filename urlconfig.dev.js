/*配置*/
var getProtocol=function() {
	if (typeof window != "undefined") {
	  return window.location.protocol;
	} else {
	  return "";
	}
};
//开发环境
module.exports = {
	loginurl:getProtocol()+"//passport.jihai8.com/login/h5",
	userinfo:getProtocol()+"//passport.jihai8.com/user/info",
	wxlogin:getProtocol()+"//passport.jihai8.com/oauth/callback",
	news:getProtocol()+"//news.jihai8.com",
	commit:getProtocol()+"//comment.jihai8.com",
	newsv1:getProtocol()+"//news.jihai8.com/v1",
	newshao:getProtocol()+"//news.jihai8.com/hao",
	passport:getProtocol()+"//passport.jihai8.com",
	passport2: getProtocol()+"//passport.jihai8.cn",
	shareOauth:getProtocol()+"//passport.jihai8.com/Oauth/share",
	payurl:getProtocol()+"//passport.jihai8.com/pay/unifiedorder",
	topay:getProtocol()+"//h5.jihai8.com/page/new_pay",
	tonewpay:getProtocol()+"//h5.jihai8.com/page/new_pay",
	reward:getProtocol()+"//h5.jihai8.com/page/new_my#step20",
	betmatch:getProtocol()+"//g.jihai8.com",
	betgame:getProtocol()+"//api-hi.jihai8.com",
	odds:getProtocol()+"//odds.jihai8.com",
	and:getProtocol()+"//and.jihai8.com",
	ws:getProtocol() + "//ws.jihai8.com",
	match:getProtocol()+"//h5.jihai8.com/page/match",
	matchball:getProtocol()+"//h5.jihai8.com/page/ball",
	gunqiu:getProtocol()+"//h5.jihai8.com/page/gunqiu",
	sport:getProtocol()+"//h5.jihai8.com/page/sport",
	sportcenter:getProtocol()+"//h5.jihai8.com/page/sportcenter",
	redPockets:getProtocol()+"//passport.jihai8.com",
	active288:getProtocol()+"//h5.jihai8.com/page/active288",
	wss: "ws://ws.jihai8.com/ws/v2_0/lq",
	ws: getProtocol() + "//ws.jihai8.com",
	h5: getProtocol() + "//h5.jihai8.cn",
	tyson: getProtocol() + "//wsdc.tysondata.com"
}
