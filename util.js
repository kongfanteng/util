import ajax from "./ajax.js"
import jsbridg from './jsbridg.js'
var urlconfig = require("../common/urlconfig.dev.js");
var isprod = 0;
if(process.env.NODE_ENV == "production"){
  urlconfig = require("../common/urlconfig.js");
  isprod = 1;
}
var obj = {
  rootdomain: "jihai8.com",
  appid: "wx4f099de5e5b9b29e",
  getProtocol: function() {
    if (typeof window != "undefined") {
      return window.location.protocol;
    } else {
      return "https";
    }
  },
  loginurl: function() {
    return  urlconfig.loginurl;
  },
  objectTraverse: function(obj, fn, isOverWrite, breakKey) {
    breakKey = breakKey || 'traverse_break';
    var value, result;
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      value = obj[key];
      result = fn(key, value);
      if (result === breakKey) {
        break;
      } else {
        if (isOverWrite && result !== undefined && obj[key] !== result) {
          obj[key] = result;
        } else if (typeof value == 'object') {
          obj[key] = this.objectTraverse(value, fn, isOverWrite, breakKey);
        }
      }
    }
    return obj;
  },
  cloneObj: function(obj) {
    if (obj) {
      obj = JSON.parse(JSON.stringify(obj));
    }
    return obj;
  },
  encodeString: function(str) {
    return encodeURIComponent(str + '');
  },
  decodeString: function(str) {
    return decodeURIComponent((str + '').replace(/\+/g, '%20'));
  },
  htmlEncode: function(s){
    //仅在浏览器中使用，禁止在服务端用
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
  },
  htmlDecode: function (s){
    //仅在浏览器中使用，禁止在服务端用
    var div = document.createElement('div');
    div.innerHTML = s;
    return div.innerText || div.textContent;
  },
  isCookie:function(){
    return navigator.cookieEnabled;
  },
  delCookie: function(name) {
    var path_domain = "; path=/; domain=" + this.rootdomain;
    document.cookie = name + "=; expires=" + new Date(0).toUTCString() + path_domain;
  },
  getCookie: function(name) {
    var cookie_start = document.cookie.indexOf(name + "="),
      cookie_end = document.cookie.indexOf(";", cookie_start);
    return cookie_start == -1 ? "" : document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length));
  },
  setCookie: function(name, value, isSession) {
    var expires = new Date();
    expires.setTime(expires.getTime() + 2592000000); //1month
    var path_domain = "; path=/; domain=" + this.rootdomain;
    if (typeof (name) === "object") {
      for (var v in name) {
        if (name[v] != '' || name[v] === 0 || name[v].length) { //如果值为空，就不设置cookie
          var cookie_content = escape(v) + "=" + escape(name[v]);
          document.cookie = cookie_content + "; expires=" + expires.toGMTString() + path_domain;
        }
      }
    } else {
      if (value != '' || value === 0 || value.length) { ////如果值为空，就不设置cookie
        var cookie_content = name + "=" + value;
        document.cookie = cookie_content + (isSession ? "" : ("; expires=" + expires.toGMTString())) + path_domain;
      }
    }
  },
  setlocalStorage:function(key, val){
    try {
      window.localStorage.setItem(key, val);
    } catch ( err ) {
    }
  },
  getlocalStorage (key) {
     return window.localStorage.getItem(key);
  },
  removelocalStorage (key) {
     return window.localStorage.removeItem(key);
  },
  isPrivateMode:function(){
    var isPrivateMode = false;
    try {
      window.localStorage.setItem('isPrivateMode', '1');
      window.localStorage.removeItem('isPrivateMode');
      isPrivateMode  = false;
    } catch (e) {
      isPrivateMode = true
    }
    return isPrivateMode;
  },
  urlQuery: function(name) {
    var href = window.location.search;
    href = href.substr(1).replace(/#[^&]*$/, '');
    var params = href.split('&');
    for (var i = 0, j = params.length; i < j; i++) {
      var temp = params[i].split('=');
      if (name == temp[0]) {
        return temp[1];
      }
    }
    return '';
  },
  appendUrlParam: function(url, param, isHashMode) {
      if (typeof param == "string") {
         param = param.replace(/^&/, "");
      } 
      if (!param) {
          return url;
      }
      if (isHashMode) {
          if (url.indexOf("#") == -1) {
              url += "#" + param;
          } else {
              url += "&" + param;
          }
      } else {
          if (url.indexOf("#") == -1) {
              if (url.indexOf("?") == -1) {
                  url += "?" + param;
              } else {
                  url += "&" + param;
              }
          } else {
              var tmp = url.split("#");
              if (tmp[0].indexOf("?") == -1) {
                  url = tmp[0] + "?" + param + "#" + (tmp[1] || "");
              } else {
                  url = tmp[0] + "&" + param + "#" + (tmp[1] || "");
              }
          }
      }
      return url;
  },
  forEach: function(array, func){
    var l = array.length;
    for(var i = 0; i < l; i++){
      func(array[i], i);
    }
  },
  formatMoney: function(num, decimal, round) {
    var arr;
    if ( typeof decimal !== 'undefined') {
        num = this.formatNum(num, decimal, round);
    }
    arr = (num + '').split('.');
    arr[0] = arr[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    return (arr[0] + (arr.length == 2 ? '.' + arr[1] : '')).replace(/^\./g, '0.');
  },
  formatNum:  function(num, decimal, round) {
    var pow;
    decimal = typeof (decimal * 1) !== 'number' || isNaN(decimal * 1) ? 2 : Math.abs(decimal);
    pow = Math.pow(10, decimal);
    num *= 1;
    //f_num处理浮点数问题，能保证保留10位小数以内计算得到正常结果
    var f_num = 0.000000000099999;
    switch (round) {
    case 1:
      num = Math.ceil(num * pow) / pow;
      break;
    case -1:
      num = Math.floor(num * pow + f_num) / pow;
      break;
    case 465:
      //四舍六入五成双,如保留两位小数，第三位小数如果是5，则看第二位是奇偶，如果是奇，则进位，否则舍去
      var is_jo = Math.floor(num * pow + f_num) % 10 % 2;
      //要进位上数字是否是5
      var is_five = Math.floor(num * pow * 10 + f_num) % 10 == 5;
      var step = is_five && !is_jo ? 1 / pow : 0;
      num = Q_core.number.format(num, decimal) - step;
      break;
    default:
      num = (num * pow + f_num) / pow;
    }
    return (num.toFixed(decimal) + '').replace(/^\./g, '0.').replace(/\.$/, '');
  },
  formatDate (date, fmt, flag) {
       /**
         * 对Date的扩展，将 Date 转化为指定格式的String
         * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
         * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
         * eg:
         * this.formatDate(new Date(),'yyyy-MM-dd') ==> 2014-03-02
         * this.formatDate(new Date(),'yyyy-MM-dd hh:mm') ==> 2014-03-02 05:04
         * this.formatDate(new Date(),'yyyy-MM-dd HH:mm') ==> 2014-03-02 17:04
         * this.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
         * this.formatDate(new Date(),'yyyy-MM-dd E HH:mm:ss') ==> 2009-03-10 二 20:09:04
         * this.formatDate(new Date(),'yyyy-MM-dd EE hh:mm:ss') ==> 2009-03-10 周二 08:09:04
         * this.formatDate(new Date(),'yyyy-MM-dd EEE hh:mm:ss') ==> 2009-03-10 星期二 08:09:04
         * this.formatDate(new Date(),'yyyy-M-d h:m:s.S') ==> 2006-7-2 8:9:4.18
       */
        if(!date) {
          return;
        }
        var o = {
            "M+" : date.getMonth() + 1, //月份
            "d+" : date.getDate(), //日
            "h+" : flag ? date.getHours() : (date.getHours() % 12 == 0 ? 12 : date.getHours() % 12), //小时
            "H+" : date.getHours(), //小时
            "m+" : date.getMinutes(), //分
            "s+" : date.getSeconds(), //秒
            "q+" : Math.floor((date.getMonth() + 3) / 3), //季度
            "S"  : date.getMilliseconds() //毫秒
        };
        var week = {
            "0" : "日",
            "1" : "一",
            "2" : "二",
            "3" : "三",
            "4" : "四",
            "5" : "五",
            "6" : "六"
        };
        if(/(y+)/.test(fmt)){
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        if(/(E+)/.test(fmt)){
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[date.getDay() + ""]);
        }
        for(var k in o){
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
  },
  formatTime: function(s) {
    var arr = s.split(" ");
    var date = arr[0].split("-");
    var time = arr[1].split(":");
    var y = date[0];
    var m = date[1];
    var d = date[2];
    var _string = new Date();
    var _y = _string.getFullYear();
    var _m = _string.getMonth() + 1;
    var _d = _string.getDate();
    if (y == _y && m == _m && d == _d) {
      var _hours = Number(time[0]);
      var _hours_str = (_hours < 12) ? (_hours < 6 ? "凌晨 " + _hours : "上午 " + _hours) : ((_hours > 12) ? (_hours >= 18 ? "晚上 " + (_hours - 12) : "下午 " + (_hours - 12)) : "中午 12");
      return _hours_str + ":" + time[1];
    } else {
      return y.toString().substring(2) + "-" + m + "-" + d;
    }
  },
  getLocalTime: function(tm) {
    var tm = tm - 0;
    var da = tm;
    da = new Date(da);
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var h = da.getHours();
    var m = da.getMinutes();
    var s = da.getSeconds();
    var datatime = year + '-' + month + '-' + date + ' ' + h + ':' + (m * 1 >= 10 ? m : "0" + m * 1) + ':' + s
    return this.formatTime(datatime)
  },
  ua: function() {
    if(typeof navigator != "undefined" ){
      return navigator.userAgent.toLowerCase();
    }else{
      return "";
    } 
  },
  isMobile: function() {
    return this.ua().match(/iPhone|iPad|iPod|Android|IEMobile/i);
  },
  isAndroid: function() {
    return this.ua().indexOf("android") != -1 ? 1 : 0;
  },
  isIOS: function() {
    var a = this.ua();
    return (a.indexOf("iphone") != -1 || a.indexOf("ipad") != -1 || a.indexOf("ipod") != -1) ? 1 : 0;
  },
  isJHApp: function() {
    var a = this.ua();
    return a.indexOf("jihai8") > -1;
  },
  isJHAppAn: function() {
    var a = this.ua();
    return a.indexOf("jihai8an") > -1;
  },
  isJHAppios: function() {
    var a = this.ua();
    return a.indexOf("jihai8ios") > -1;
  },
  isAppPay:function(){
    //判断App是否支持App支付
    var s = 0;
    if(this.isJHAppAn() && this.getAppV()>=180){
      s = 1;
    }else if(this.isJHAppios() && this.getAppV()>=170){
      s = 1;
    }
    return s;
  },
  get_clound_control: function () {
    /*
      客户单云控cookie名统一： jh_cloud_control 1: 不显示  0： 显示
      value: "0|0|0" （竞猜|发现赛事卡片|发现即嗨每日数据精选）
     */
    var arr_cloud_control = [0, 0, 0];
    var str_cloud_control = this.getCookie("jh_cloud_control");
    if(str_cloud_control && this.isJHApp()) {
      arr_cloud_control = str_cloud_control.split("|");
    }
    return arr_cloud_control;
  },
  //jsv 是APP版本号
  getAppV: function(){
    return this.getCookie("jsv") * 1;
  },
  getDeviceid: function(){
    return this.getCookie("deviceid");
  },
  platform: function() {
    if (this.isMobile()) {
      if (this.isIOS()) {
        return "IOS";
      } else if (this.isAndroid()) {
        return "Android";
      } else {
        return "other-mobile";
      }
    } else {
      return "PC";
    }
  },
  isQQ: function() {
    //不严格
    //mqqbrowser wifi webp
    //uiwebview qq mac
    var a = this.ua();
    if (this.isIOS()) {
      return a.indexOf("uiwebview") > 0 && a.indexOf('qq') > 0 ? 1 : 0;
    } else if (this.isAndroid()) {
      return a.indexOf("webp") > 0 && a.indexOf('qq') > 0 ? 1 : 0;
    }
  },
  isWeixin: function() {
    return this.ua().indexOf("micromessenger") != -1 ? 1 : 0;
  },
  isWeibo: function() {
    return this.ua().indexOf("weibo") != -1 ? 1 : 0;
  },
  isTX: function() {
    return this.isWeixin() || this.isQQ();
  },
  isWeixinPay: function() {
    if (this.isWeixin()) {
      var a = this.ua(),
        b = a.substr(a.indexOf("micromessenger"), 18).split("/");
      if (Number(b[1]) >= 5) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  },
  isShowheader: function() {
    return !this.isTX() && !this.isJHApp();
  },
  isLogin: function(callback) {
    if(!this.isJHAppAn()){
      if(typeof window.isLogin != "undefined"){
        return window.isLogin;
      }
    }
    var result = false;
    if (this.getCookie("JH")) {
      result = true;
    }
    return result;
  },
  goDownAppPage:function(){
    var self = this;
    var url = self.getProtocol()+"//h5.jihai8.com/page/share?down=1";
  }, 
  getsrc: function(){
    var src = this.urlQuery("src");
    if(!src){
      if(this.isJHAppAn()){
        src = "android" + "_JH_000_" + this.getAppV();
      }else if(this.isJHAppios()){
        src = "ios" + "_JH_000_" + this.getAppV();
      }else {
        src = "h5";
      }
    }
    return src;
  },
  isHiscores: function(){
    var self = this;
    var is_hiscores = false;
    var src_hiscores = this.urlQuery("src") || "";
    if (src_hiscores) {
      if (src_hiscores.indexOf("hiscores") > -1) {
        is_hiscores = true;
      } else {
        is_hiscores = false;
      }
    } else {
      is_hiscores = false;
    }
    return is_hiscores;
  },
  openAppIframe:function(src) {
      var iframe = document.createElement("iframe");
      iframe.style.cssText = "display:none;width=0;height=0;";
      iframe.src = src;
      document.body.appendChild(iframe);
  },
  goJHApp: function(str){
    var self = this;
    str = str ? "?" + str : "";
    var src = this.urlQuery("src");
    var downUrl = self.getProtocol() + "//h5.jihai8.com/page/share?down=1&src=" + src;
    if( self.isWeixin() ){
      downUrl = self.getProtocol() + "//h5.jihai8.cn/page/share?down=1&src=" + src;
    }
    var call = function(){
      if(window.location.href.indexOf("down=1") > -1 && downUrl.indexOf("down=1") > -1){

      }else{
        window.location.href = downUrl;
      }
    }
    //尝试打开客户端
    if(this.isIOS()) {
        if(this.isWeixin()){
          call();
          return;
        } else {
          window.location.href = "jihai://" + str;
          setTimeout(function () {
            call();
          }, 1800);
        }
    }else if(this.isAndroid()) {
      if(this.isWeixin() || this.isQQ()) {
        window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.haiqiu.jihai";
      } else {
        this.openAppIframe("jihai://" + str);
        //直接下载
        setTimeout(function(){
          call();
        },1800); 
      }
    } else {
      this.openAppIframe("jihai://" + str);
      //直接下载
      setTimeout(function(){
        call();
      },1800); 
    }
  },
  doLogin: function(url, nowx) {
    if (!url) {
      url = location.href.substr("#")
    }
    url = this.encodeString(url);
    if (this.isWeixin()) {
      if(!nowx){
        this.wxLogin(url);
      }else{
        this.gotourl(this.loginurl() + "?nowxlogin=1&backurl=" + url);
      }     
    } else {
      if(this.isJHApp()){
        jsbridg.appLogin();
      }else{
        if(nowx){
          this.gotourl(this.loginurl() + "?nowxlogin=1&backurl=" + url);
        }else{
          this.gotourl(this.loginurl() + "?backurl=" + url);
        }   
      }    
    }
  },
  wxLogin: function(backurl) {
    if (!this.isWeixin()) {
      return;
    }
    if (!backurl) {
      var queryurl = this.urlQuery("backurl");
      if (queryurl) {
        backurl = queryurl;
      } else {
        backurl = this.encodeString(this.getProtocol()+"//h5.jihai8.com");
      }
    }
    var url =  urlconfig.wxlogin+"?scene=wap&src="+this.getsrc()+"&redirect_uri=" + backurl;
    url = this.encodeString(url);
    var scope = "snsapi_userinfo";
    var tourl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + this.appid
      + '&redirect_uri=' + url
      + '&response_type=code&scope=' + scope + '&state=STATE&connect_redirect=1#wechat_redirect';
    this.gotourl(tourl);
  },
  checkLogin: function(callback) {
    var me = this;
    var url = location.href.substr("#");
    if (!this.isLogin()) {
      me.doLogin(url);
      return false;
    } else {
      callback && callback();
      return true;
    }
  },
  getUserInfo: function(callback) {
    var me = this;
    //获取当前用户信息
    ajax.ajax({
      url:  urlconfig.userinfo,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        if (data.error == "-1") {
          me.delCookie("JH");
        }
        callback && callback(data);
      }
    })
  },
  changeUserImgUrl:function(url){
    if(url){
      if(url.indexOf("jhios.oss-cn-beijing.aliyuncs.com") > 0 || url.indexOf("jhuserimg.oss-cn-beijing.aliyuncs.com") > 0 || url.indexOf("img1.jihai8.com") > 0){
          url = url.replace(/@.+$/,"").replace(/\?x-oss.+$/,"");
          url = url + "@!userimg";
      }
    }
    return url;
  },
  addImgstyle:function(url,style){
    if(url){
      if(url.indexOf("jhios.oss-cn-beijing.aliyuncs.com") > 0 || url.indexOf("jhimg.oss-cn-beijing.aliyuncs.com") > 0 || url.indexOf("img0.jihai8.com") > 0){
          url = url.replace(/@.+$/,"").replace(/\?x-oss.+$/,"");
          url = url + "@!" + style;
      }
    }
    return url;
  },
  //贝付宝第三方跳转加密
  encrypHyAlipay: function (pwd1, pwd2){
    var _0xa9f1 = [
      "\x61\x6C\x69\x70\x61\x79\x71\x72\x3A\x2F\x2F\x70\x6C\x61\x74\x66\x6F\x72\x6D\x61\x70\x69\x2F\x73\x74\x61\x72\x74\x61\x70\x70\x3F\x73\x61\x49\x64\x3D\x31\x30\x30\x30\x30\x30\x30\x37\x26\x63\x6C\x69\x65\x6E\x74\x56\x65\x72\x73\x69\x6F\x6E\x3D\x33\x2E\x37\x2E\x30\x2E\x30\x37\x31\x38\x26\x71\x72\x63\x6F\x64\x65\x3D", 
      "\x68\x72\x65\x66", 
      "\x75\x6E\x64\x65\x66\x69\x6E\x65\x64", 
      "", 
      "\x73\x74\x72\x69\x6E\x67"
    ];
    var aliJsWap = function (_0x9b47x2, _0x9b47x3) {
      var _0x9b47x4 = false;
      if (_0x9b47x4) {
        return
      };
      _0x9b47x4 = true;
      var _d8 = _0xa9f1[0] + _0x9b47x2;
      if(!util.isJHApp() ){
        location[_0xa9f1[1]] = _d8;
        _0x9b47x3 = typeof(_0x9b47x3) == _0xa9f1[2] ? _0xa9f1[3] : _0x9b47x3;
        setTimeout(function() {
          if (typeof _0x9b47x3 !== _0xa9f1[4]) {
            _0x9b47x3 = _0xa9f1[3];
          };
          if (_0x9b47x3 && typeof _0x9b47x3 === _0xa9f1[4]) {
            location[_0xa9f1[1]] = _0x9b47x3;
          }
        }, 5000);
        setTimeout(function() {
          _0x9b47x4 = false;
        }, 2500);
      } else {
        return _d8;
      }
    }
    return aliJsWap(pwd1, pwd2);
  }, 
  loginOut: function() {
    //退出登录
    this.delCookie("JH");
    window.location.reload();
  },
  checkPass: function(s) {
    //密码复杂度检测 小于2不合要求
    if (s.length < 6) {
      return 0;
    }else if(s.length>20){
      return 0;
    }
    var ls = 0;
    if (s.match(/([a-zA-Z])+/)) {
      ls++;
    }
    if (s.match(/([0-9])+/)) {
      ls++;
    }
    return ls

  },
  goHome: function() {
    if(this.isJHApp() && this.getAppV() >= 130){
      jsbridg.goHome();
    }else{
      this.gotourl("/" );
    }
  },
  goListpage: function() {
    this.gotourl("/list");
  },
  gotoInfoPage:function(id,tocommit){
    if(id){
      var date = id.substring(0, 8);
      var id = id.substring(8);
      this.gotourl("/info/" + date + "/" + id + ".html" + (tocommit ? "?tocommit=1" : "")); 
    }
  },
  gotoUserInfoPage:function(id,tocommit){
    if(id){
      var date = id.substring(0, 8);
      var id = id.substring(8);
      this.gotourl("/readinfo/" + date + "/" + id + ".html" + (tocommit ? "?tocommit=1" : "")); 
    }
  },
  gotoThirdInfoPage:function(id,tocommit){
    if(id){
      var date = id.substring(0, 8);
      var id = id.substring(8);
      this.gotourl("/thirdinfo/" + date + "/" + id + ".html" + (tocommit ? "?tocommit=1" : "")); 
    }
  },
  //跳转到webview
  goWebview: function (data) {
    if(this.isJHApp()){
      jsbridg.goWebview(data);
    }else{
      window.location.href = data.url;
    }
  },
  androidUpdate:function(url){
    if( this.isJHAppAn() && this.getAppV() >= 244 ){
      jsbridg.androidUpdate(url);
    }
  },
  gotourl: function(url) {
    //跳转页面 把src和channel传递下去
    var _url = window.location.href;
    var src  = this.urlQuery("src");
    var channel = this.urlQuery("channel");
    if(!src){
      src = channel;
    }
    if(src){
      if(url.indexOf("src=")>-1){
        url = url.replace(/(src=)\w+/g,"$1"+src);
      }else{
        var index = url.indexOf("#");
        if(index > 0){
          var strend = url.substring(index);
          url = url.substring(0,index);
        }
        if(url.indexOf("?") > -1){
          url = url + "&src=" + src;
        }else{
          url = url + "?src=" + src;
        }
      }
      url = url + (strend ? strend : ""); 
    }
    //记录邀请红包uid
    var invite_id = this.urlQuery("invite_id");
    if (invite_id) {
       if(url.indexOf("?") > -1) {
          url = url + "&invite_id=" + invite_id;
       } else {
          url = url + "?invite_id=" + invite_id;
       }
    }
    //记录自动关注uid
    var follow_id = this.urlQuery("follow_id");
    if (follow_id) {
      if(url.indexOf("?") > -1) {
        url = url + "&follow_id=" + follow_id;
      } else {
        url = url + "?follow_id=" + follow_id;
      }
    }
    if(url.indexOf("http") > -1){
      if(!isprod){
        url = url.replace("https:", "http:");
      }
    }
    window.location.href = url;
  },
  transferPathToUrl: function(url) {
    var protocol = location.protocol + "//";
    var host = location.host;
    return protocol + host + url;
  },
  goReward:function(){
    this.gotourl(urlconfig.reward);
  },
  setTitle: function(title) {
    if(window.document.title != title){
      window.document.title = title;
      var pagetitle = document.getElementById("pagetitle");
      if(pagetitle){
        pagetitle.innerText = title;
      }
      jsbridg.setTitle(title);
    }
  },
  goAppUserPage:function(uid){
      if(this.isJHApp()){
        jsbridg.appUserPage(uid);
      }else{
        this.goJHApp();
      }
  },
  goMyCenter:function(){
    jsbridg.goMyCenter();
  },
  goPointsDetail: function(){
    if(this.isJHApp()){
      jsbridg.goPointsDetail();
    }
  },
  openAds: function (url, jumptype) {
     var isAndroid = this.isJHApp() && this.isJHAppAn() && this.getAppV() >= 183;
     var isIOS = this.isJHApp() && this.isJHAppios() && this.getAppV() >= 181;
     if(isAndroid || isIOS) {
       jsbridg.openAds(url, jumptype);
     }
  },
  goAppFollowInfo: function(authorid, isfollow){
    var toApp = 0;
    if(this.isJHApp()){
      var jsv = this.getAppV();
      if(jsv >= 120){
         jsbridg.appFollowInfo(authorid, isfollow);
         toApp = 1;
      }
    }
    var self = this;
    if(!toApp){
      if(isfollow){
        swal(
          {
            type: "confirm",
            title: "成功关注大咖，您已成为大咖的粉丝，下载即嗨App，Ta的竞猜推荐会第一时间推送给您",
            confirmTitle: "前往下载",
            cancelTitle: "暂不"
          },
          function(){
            self.goJHApp();
          },
          function(){}
        )
       }else{
          swal(
            {
              type: "tip",
              title: isfollow ? "关注成功" : "取消关注成功"
            }
          );
       }
    }
  },
  wxGoApp() {
    var self = this;
    if( self.isTX() ){
      window.swal({
        type: "confirm",
        title: "立即领取88元红包",
        confirmTitle: "立即领取",
        cancelTitle: "我再想想"
      }, function(){ 
        self.gotourl("/page/signup88");
      }, function(){

      });
    }
  },
  //足球详情 || 足球详情
  goMatchLive: function(matchid,isLq){
    var isgo = false;
    if(this.isJHApp()){
      if(matchid){
        var jsv = this.getAppV();
        if(jsv >= 100){
          isgo = true;
        }
      }
    }
    if(isgo){
      if (isLq == 'lq') {
        // 篮球是传个code 9 
        jsbridg.goMatchLive(matchid, 9);
      }else{
        jsbridg.goMatchLive(matchid);
      }
    }else{
      var str = isLq == 'lq' ? "jumptype=1&code=9&param=" + encodeURI("matchid="+matchid) :  "jumptype=1&code=164&param=" + encodeURI("matchid=" + matchid);
      this.goJHApp(str);
    }
  },
  //篮球详情
  goBasketMatchLive:function(matchid){
    var isgo = false;
    if(this.isJHApp()){
      if(matchid){
        var jsv = this.getAppV();
        if(jsv >= 100){
          isgo = true;
        }
      }
    }
    if(isgo){
      jsbridg.goBasketMatchLive(matchid);
    }else{
      var str = "jumptype=1&code=9&param=" + encodeURI("matchid=" + matchid);
      this.goJHApp(str);
    }
  },
  //跳转即嗨号
  goJihaihao(){
    var isgo = false;
    if(this.isJHApp()){
        var jsv = this.getAppV();
        if(jsv >= 230){
          isgo = true;
        }
    }
    if(isgo){
      jsbridg.goJihaihao();
    }
  },
  //跳转发现页   flag是否刷新
  goFoundPage(flag){
    var isgo = false;
    if(this.isJHApp()){
        var jsv = this.getAppV();
        if(jsv >= 240){
          isgo = true;
          // 去数据页
          if( jsv >= 270 ){
            this.goDataPage(flag);
            return;
          }
        }
    }
    if(isgo){
      jsbridg.goFoundPage();
    }
  },
  //跳转数据页   flag是否刷新
  goDataPage(flag){
    var isgo = false;
    if(this.isJHApp()){
        var jsv = this.getAppV();
        if(jsv >= 270){
          isgo = true;
        // 去发现页
        }else{
          this.goFoundPage();
        }
    }
    if(isgo){
      jsbridg.goDataPage(flag);
    }
  },
  //跳转嗨吧
  goHaiba(){
    var isgo = false;
    if(this.isJHApp()){
        var jsv = this.getAppV();
        if(jsv >= 240){
          isgo = true;
        }
    }
    if(isgo){
      jsbridg.goHaiba();
    }
  },
  //跳转即时比分
  goLive(){
    if (this.isJHAppAn()) {
      jsbridg.goLive2();
    } else {
      jsbridg.goLive();
    }
  },
  //返回上一级
  goBack () {
    jsbridg.goBack();
  },
  //系统app提示
  appDialog (message) {
    jsbridg.appDialog(message);
  },
  // 查看该资讯付费用户列表
  goUserList: function(newsid){
    var isgo = false;
    if(this.isJHApp()){
      if(newsid){
        var jsv = this.getAppV();
        if(jsv >= 100){
          isgo = true;
        }
      }
    }
    if(isgo){
      var json = {
        jumptype: 1,
        code: 502,
        params: "news_id=" + newsid
      }
      jsbridg.goWebview(json);
    }else{
      var str = "code=300&params={jumptype=1&code=502&params=" + encodeURI("news_id=" + newsid) + "}";
      this.goJHApp(str);
    }
  },
  isexinfo(type){
    return type == "duanzi" || type == "meinv";
  },
  getPlates(type){
    var plates = {
      "1"  : "足球精读",
      "2"  : "足球推荐",
      "3"  : "美女",
      "4"  : "即嗨号",
      "5"  : "首页",
      "6"  : "篮球周边",
      "7"  : "段子",
      "8"  : "专题",
      "9"  : "竞彩足球",
      "10" : "球队资讯",
      "11" : "竞彩篮球",
      "12" : "篮球推荐",
      "13" : "电竞"
    }
    return plates[type];
  },
  getMatchStatusColor (match_state, type) {
    var color = "#7d7d7d";
    //足球
    if (type == '1') {
      switch(match_state) {
        case '1':
        case '3':
        case '4':
        case '-1':
          color = "#ff5048";
          break;
        //中场
        case '2': 
          color = "#0777e0";
          break;
        case '0':
        case '-10':
        case '-11':
        case '-12':
        case '-13':
        case '-14':
          color = "#7d7d7d";
          break;
      }
    } else {
      switch(match_state) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '-1':
          color = "#ff5048";
          break;
        //中场
        case '50': 
          color = "#0777e0";
          break;
        case '0': 
        case '-2':
        case '-3':
        case '-4':
        case '-5':
          color = "#7d7d7d";
          break;
      }
    }
    return color;
  },
  pageinit: function() {
    //页面初始化
    require('../components/common/popbox');
    //pressed效果
    function touchstart(e) {
      var target = e.target || e.srcElement;
      if (target.className.indexOf("press") > -1) {
        target.className = target.className + " pressed";
      }
    }
    function touchend(e) {
      var target = e.target || e.srcElement;
      if (target.className.indexOf("press") > -1) {
        target.className = target.className.replace("pressed", "");
      }
    }
    document.body.addEventListener("touchstart", touchstart, false);
    document.body.addEventListener("touchend", touchend, false);
  },
  cnzzrewardinfo:function(title,infoid,domid){
    //打赏点击
    _czc.push(['_trackEvent', '资讯', '打赏',title, infoid, domid]);
  },
  cnzzlist:function(title,infoid,domid){
    //返回列表点击
    _czc.push(['_trackEvent', '资讯', '返回列表页',title, infoid, domid]);
  },
  cnzzcomment:function(title,infoid,domid){
    //评论点击
    _czc.push(['_trackEvent', '资讯', '评论',title, infoid, domid]);
  },
  cnzzJHTrack:function(freeName,title,infoid,domid){
    // 资讯下 各个类型判断
    _czc.push(['_trackEvent', '即嗨', freeName, title || "", infoid || "", domid || ""]);
  },
  cnzzTYFTrack:function(freeName,title,infoid,domid){
    // 资讯下 各个类型判断
    _czc.push(['_trackEvent', '体育疯', freeName, title, infoid, domid]);
  },
  getExpLevel:function(fee){
    var fee=fee?fee*1:0;
    var b=0;
    var bi=10000;
    var chn=1000000;
    //获取经验值等级
    if(fee<100*bi){
      b=fee/chn;
    }else if(fee<200*bi){
      b=10+(fee-100*bi)/chn;
    }else if(fee<300*bi){
      b=20+(fee-200*bi)/chn;
    }else if(fee<400*bi){
      b=30+(fee-300*bi)/chn;
    }else if(fee<500*bi){
      b=40+(fee-400*bi)/chn;
    }else if(fee<600*bi){
      b=50+(fee-500*bi)/chn;
    }else if(fee<700*bi){
      b=60+(fee-600*bi)/chn;
    }else if(fee<800*bi){
      b=70+(fee-700*bi)/chn;
    }else if(fee<900*bi){
      b=80+(fee-800*bi)/chn;
    }else if(fee<1000*bi){
      b=90+(fee-900*bi)/chn;
    }else {
      b = 99; 
    }
    if(b*10<1 && fee>0){
      b=0.5;
    }else if(b>99){
      b=99;
    }
    return b;
  },
  /**
   * 尝试唤起APP
   * @param scheme 唤起的scheme
   */
  tryCallApp: function (scheme) {
    var aLink = document.createElement('a');
    var body = document.body;
    aLink.href = scheme;
    body.appendChild(aLink);
    aLink.click();
  },  
  /*添加class*/
  addClassName: function addClassName(ele, str) {
    //定义一个正则 正则判断
    if (typeof str != "string") {
      throw new Error("str参数有问题")
    }
    if (typeof ele == "object" ? (ele instanceof Element ? 0 : 1) : 1) {
      throw new Error("ele参数出错")
    }
    if(ele.classList){
      ele.classList.add(str);
    }else{
      let reg = new RegExp("(^| )" + str + "( |$)");
      if (!reg.test(ele.className)){
       if(ele['className'].substr(-1)!=" "){
          //添加
          ele['className'] += " " + str;
        }else{
          ele['className'] += str;
        }
      }
    } 
  },
  /*移除css*/
  removeClassName: function removeClassName(ele, str) {
    if (typeof str != "string") {
      throw new Error("str参数有问题")
    }
    if (typeof ele == "object" ? (ele instanceof Element ? 0 : 1) : 1) {
      throw new Error("ele参数出错")
    }
    if(ele.classList){
      ele.classList.remove(str);
    }else{
      //定义一个正则 正则判断
      let reg = new RegExp("(^| )" + str + "( |$)", "g");
      if (reg.test(ele.className)) {
        ele.className = ele.className.replace(/ /g, " ");
        ele.className = ele.className.replace(reg, "");
      }
    }
  },
  toggleClass: function(ele, str) {
    if(ele.classList){
      ele.classList.toggle(str);
    }else{
      let reg = RegExp('' + str + '');
      try{
          if (reg.test(ele.className)) {
            // true要移除
            ele.className = ele.className.replace(/ /g, " ");
            ele.className = ele.className.replace(reg, "");
          } 
          else {
            if(ele['className'].substr(-1)!=" "){
              //添加
              ele['className'] += " " + str;
            }else{
              ele['className'] += str;
            }
          }
      }catch(e){
        console.error('错误原因是这个ele' + ele)
        return null

      }
    } 
  }
}
module.exports = obj;