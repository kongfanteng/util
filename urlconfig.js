var getProtocol=function() {
	if (typeof window != "undefined") {
	  return window.location.protocol;
	} else {
	  return "";
	}
};
module.exports = {
	loginurl:"https://passport.jihai8.com/login/h5",
	userinfo:"https://passport.jihai8.com/user/info",
	wxlogin: "https://passport.jihai8.com/oauth/callback",
	news:"https://news.jihai8.com",
	commit:"https://comment.jihai8.com",
	newsv1:"https://news.jihai8.com/v1",
	newshao:"https://news.jihai8.com/hao",
	shareOauth:"https://passport.jihai8.com/Oauth/share",
	passport:"https://passport.jihai8.com",
	passport2:"https://passport.jihai8.cn",
	payurl:"https://passport.jihai8.com/pay/unifiedorder",
	topay:"https://h5.jihai8.com/page/new_pay",
	tonewpay:"https://h5.jihai8.com/page/new_pay",
	reward:"https://h5.jihai8.com/page/new_my#step20",
	betmatch:"https://g.jihai8.com",
	ws:"https://ws.jihai8.com",
	betgame:"https://api-hi.jihai8.com",
	odds:"https://dc.jihai8.com",
	and:"https://and.jihai8.com",
	match:"https://h8.jihai8.com/page/match",
	matchball:"https://h8.jihai8.com/page/ball",
	gunqiu:"https://h8.jihai8.com/page/gunqiu",
	sport:"https://h8.jihai8.com/page/sport",
	sportcenter:"https://h8.jihai8.com/page/sportcenter",
	redPockets:"https://passport.jihai8.com",
	active288:"https://h5.jihai8.com/page/active288",
	wss: "wss://ws.jihai8.com/ws/v2_0/lq",
	ws: "https://ws.jihai8.com",
	h5: "https://h5.jihai8.cn",
	tyson: "https://wsdc.tysondata.com"
}