import ajax from './ajax.js'
import jsbridg from './jsbridg.js'
var  urlconfig = require("../common/urlconfig.dev.js");
if(process.env.NODE_ENV=="production"){
  urlconfig = require("../common/urlconfig.js");
}
var util = require("./util");
var alertMod = function(str) {
  window.swal(str);
};
var share = {
  isTX: function() {
    return util.isTX();
  },
  shareArr: ["shareAppMessage", "shareTimeline", "shareQQ", "shareWeibo"],
  getQQshareurl:function(){
      var obj = this.shareInfo;
      //QQ空间
      var p = {
        summary: obj.title,
        action: "shareToQQ",
        targetUrl: obj.link,
        imageUrl: obj.imgUrl
      }
      var s = [];
      for(var i in p){
        s.push(i + '=' + encodeURIComponent(p[i]||''));
      }
      var url = 'https://qzs.qzone.qq.com/open/connect/widget/mobile/qzshare/index.html?page=qzshare.html&loginpage=loginindex.html&logintype=qzone&' + s.join('&');
      return url;
  },
  getWBshareurl:function(){
    var obj = this.shareInfo;
    var p = {
      appkey: "1532493832",
      url: obj.link,
      title: obj.title,
      source: '',
      sourceUrl: '',
      content: obj.desc,
      pic: obj.imgUrl
    }
    var s = [];
    for(var i in p){
      s.push(i + '=' + encodeURIComponent(p[i] || ''));
    }
    return 'http://v.t.sina.com.cn/share/share.php?' + s.join('&');
  },
  shareinit: function(obj) {
    this.shareInfo = obj;
    if (this.isTX()) {
      this.getSna();
    }
    if(util.isJHApp()){
      jsbridg.initAppShare(obj);
    }
  },
  getSna: function() {
    var _this = this;
    var tempSignUrl = encodeURIComponent(location.href.substr("#"));
    ajax.ajax({
      url: urlconfig.shareOauth,
      data: {
        share_url: tempSignUrl,
        t: new Date() * 1
      },
      success: function(data) {
        _this.loadWxApi(data);
      }
    })
  },
  loadWxApi: function(data) {
    var _this = this;
    ajax.getscript("https://res.wx.qq.com/open/js/jweixin-1.0.0.js", function() {
      _this.initShare(data, wx);
    });
  },
  initShare: function(data, wx) {
    var _this = this;
    var r = data;
    wx.config({
      appId: r.appid,
       debug: false,
      beta:true,
      timestamp: r.timestamp,
      nonceStr: r.noncestr,
      signature: r.signature,
      jsApiList:["checkJsApi","onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo","launch3rdApp","getInstallState"]
    });
    wx.ready(function() {
      for (var i = 0; i < _this.shareArr.length; i++) {
        _this[_this.shareArr[i]](_this.shareInfo, wx);
      }
    });
  },
  shareAppMessage: function(o, wx) {
    var _this = o;
    wx.onMenuShareAppMessage({
      //分享给朋友
      title: _this.title,
      desc: _this.desc,
      link: _this.link,
      imgUrl: _this.imgUrl,
      fail: function(res) {
        alertMod(JSON.stringify(res));
      }
    });
  },
  shareTimeline: function(o, wx) {
    var _this = o;
    wx.onMenuShareTimeline({
      //分享到朋友圈
      title: _this.title,
      link: _this.link,
      imgUrl: _this.imgUrl,
      fail: function(res) {
        alertMod(JSON.stringify(res));
      }
    });
  },
  shareQQ: function(o, wx) {
    var _this = o;
    wx.onMenuShareQQ({
      //分享到QQ
      title: _this.title,
      desc: _this.desc,
      link: _this.link,
      imgUrl: _this.imgUrl,
      fail: function(res) {
        alertMod(JSON.stringify(res));
      }
    });
  },
  shareWeibo: function(o, wx) {
    var _this = o;
    wx.onMenuShareWeibo({
      //分享到微博
      title: _this.title,
      desc: _this.desc,
      link: _this.link,
      imgUrl: _this.imgUrl,
      fail: function(res) {
        alertMod(JSON.stringify(res));
      }
    });
  }
};
module.exports = share;

