//支付
import ajax from './ajax.js'
var urlconfig = require("../common/urlconfig.dev.js");
if(process.env.NODE_ENV=="production"){
  urlconfig = require("../common/urlconfig.js");
}
var util = require("./util");
var jsbridg = require('./jsbridg.js');
//支付主逻辑
var payment = {
  shareArr: ["shareAppMessage", "shareTimeline", "shareQQ", "shareWeibo"],
  payinit: function(obj, callback, cancelBack) {
    if(!obj) {
      return;
    } 
    this.payInfo = util.cloneObj(obj); 
    //银联支付
    if (this.payInfo.pay_type == 'union_pay') {
      this.payInfo.trade_type = "QUICK_WAP_PAY";
    //QQ钱包支付扫码支付
    } else if (this.payInfo.pay_type == 'qq') {
      this.payInfo.trade_type = "NATIVE";
    //QQ钱包
    } else if(this.payInfo.pay_type == "qqAPP"){
      this.payInfo.pay_type = "qq";
      this.payInfo.trade_type = "APP";
    //微信
    } else if(this.payInfo.pay_type == "wx"){
      this.payInfo.trade_type = "QUICK_WAP_PAY";
    //支付宝
    } else if(this.payInfo.pay_type == "ali"){
      this.payInfo.trade_type = "QUICK_WAP_PAY";
      if(util.isAppPay()){
        //channel=AppStore 且版本号 170 <= V <= 200 时调支付宝 SDK，其它不调支付宝 SDK
        var app_src = util.urlQuery("src"); //ios_AppStore_220
        var arr_app_src = [];
        var channel = "";
        if(app_src) {
          arr_app_src = app_src.split("_");
          channel = arr_app_src[1];
        }
        if (util.isJHAppios() && (channel == 'AppStore') && util.getAppV() >= 170 && util.getAppV() <= 200) {
          this.payInfo.trade_type = "APP";
        }   
      }
    //微信二维码
    } else if(this.payInfo.pay_type == "wxqr"){
      this.payInfo.pay_type = "wx";
      this.payInfo.trade_type = "NATIVE"
    // 网银支付
    } else if(this.payInfo.pay_type == "yse_pay"){
      this.payInfo.trade_type = "fast_pay"
    }
    if(this.payInfo.ordertype == "activity"){
      this.payInfo.ordertype = this.payInfo.name;
    }
    if(this.payInfo.ordertype == "newsbuy"){
      this.payInfo.ordertype = "pay_news";
    }
    if(this.payInfo.ordertype == "buybonus"){
      this.payInfo.ordertype = "buy_coupon";
    }
    var app_channel = util.getCookie("app_channel"); //安卓pro包判断
    if( app_channel && app_channel == "jh_pro" ){
      this.payInfo.app_channel = app_channel;
    }
    this.callback = callback;
    this.cancelBack = cancelBack;
    this.getSna();
  },
  checktimes: 0,
  getSna: function() {
    var self = this;
    self.checktimes++;
    var device_id = 0;
    if(util.isAndroid()) {
      device_id = 1;
    } else if(util.isIOS()) {
      device_id = 2;
    }
    var parms = {
      pay_type: this.payInfo.pay_type,
      trade_type: this.payInfo.trade_type,
      order_type: this.payInfo.ordertype,
      total_fee: this.payInfo.total_fee,
      news_id: this.payInfo.news_id,
      trade_no: this.payInfo.trade_no,
      bet_no: this.payInfo.bet_no,
      act_id: this.payInfo.act_id,
      appv: this.payInfo.appv,
      device_id: device_id,
      src: util.getsrc()
    };
    // buy_points = 实际 购买 礼物卷 数
    if( this.payInfo.buy_points ){
      parms.buy_points = this.payInfo.buy_points;
      parms.coupon_id = this.payInfo.coupon_id;
    }
    // 网银支付
    if( this.payInfo.pay_type == "yse_pay" ){
      parms.pay_info_id = this.payInfo.pay_info_id;        // 已支付了，直接用id
      parms.fast_pay_name = this.payInfo.fast_pay_name;        // 姓名
      parms.fast_pay_id_no = this.payInfo.fast_pay_id_no;      // 身份证号码
      parms.bank_account_no = this.payInfo.bank_account_no;    // 银行卡
    }
    if( this.payInfo.app_channel && this.payInfo.app_channel == "jh_pro" ){
      parms.app_channel = this.payInfo.app_channel;    // pro包判断
    }
    ajax.ajax({
      url: urlconfig.payurl,
      method: "post",
      data: parms,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        var third_pay_type = data._pay_type || "";
        console.log(JSON.stringify(data.data));
        //贝付宝渠道bfb_wx、bfb_ali
        if (/^bfb_/.test(third_pay_type)) {
          util.cnzzJHTrack("立即支付", self.payInfo.ordertype + "-" + third_pay_type);
          /*
            {
                "errno": 0,
                "errmsg": "OK",
                "data": {
                  "uid": "143804",
                  "payType": "bfb_wx / bfb_mala_ali",
                  "totalFee": 100,
                  "tradeType": "APP",
                  "orderType": "betgame",
                  "src": "ios_AppStore_240",
                  "detail": "",
                  "ext2": "{\"bet_no\":\"G20180626132353514\"}",
                  "": "https:\/\/h6.jihai8.com\/page\/pay?buy=GQ&ordertype=betgame&src=ios_AppStore_240&bfbpay=ok&app=2",
                  "device_id": "2",
                  "status": 0,
                  "type": 1,
                  "code": 0,
                  "pay_url": "https:\/\/statecheck.swiftpass.cn\/pay\/wappay?token_id=23a31becd00469ea65ddf08d41fd7d48a&service=pay.weixin.wappayv2",
                  "out_order_no": "null",
                  "trade_no": "20180626132353319300132997"
                },
                "_pay_type": "bfb_wx"
            }
           */
           self.callback && self.callback(data.data, "bfbpay");
           //客户端内部
           if (util.isAppPay()) {
             jsbridg.bfbPay(data.data);
           //客户端外部
           } else {
             window.location.href = data.data.pay_url;
           }
        //红月渠道
        } else if(/^hy_/.test(third_pay_type) ){
          /*  
              "errno": 0,
              "errmsg": "OK",
              "data": {
                "uid": "143817",
                "payType": "hy_ali",
                "totalFee": 1,
                "tradeType": "QUICK_WAP_PAY",
                "orderType": "buy",
                "src": "ios_AppStore_240",
                "detail": "",
                "ext2": "",
                "back_url": "https:\/\/h5.jihai8.com\/page\/pay?src=ios_AppStore_240&ordertype=buy&hypay=ok&app=2",
                "device_id": "2",
                "pay_url": "http:\/\/106.14.33.237:82\/joOiv1&pay_type=hy_ali",
                "trade_no": "2018082215074956021251924"           
              },
              "_pay_type": "hy_ali"
           */
          // 走hy支付渠道
          let hyAliurl = pay_util.encrypAli(data.data.pay_url);
          if( util.isJHApp() ){
            jsbridg.goWebview({
              url: hyAliurl,
              jumptype: 3
            });
          }
          self.callback && self.callback(data.data, "hy_ali");
        // QQ钱包支付
        } else if( /^qq/.test(third_pay_type) ){
          // QQ钱包支付 SDK
          if( self.payInfo.trade_type == "APP" ){
            self.callback && self.callback(data, "qqApp");
            jsbridg.qqPay(data.data);
            // QQ钱包支付扫码支付
          } else if( self.payInfo.trade_type == "NATIVE" ){
            self.callback && self.callback(data, "qq");
          }
        // 网银支付
        } else if( data._pay_type == "yse_pay" ){
          if ( data.errno == "0" ) {
            self.callback && self.callback(data, "yse_pay");
          } else {
            window.swal({
              type: "alert",
              title: data.errmsg
            }, function(){
              self.cancelBack && self.cancelBack();
            });
          }
        } else {
          //客户端 
          if(self.payInfo.trade_type == "APP" && data.errno == "0"){
            //wx
            if(self.payInfo.pay_type == "wx"){
              data.data.jihai_fee = self.payInfo.total_fee;
              jsbridg.appWXPay(data.data);
            //ali  
            } else if(self.payInfo.pay_type == "ali"){
              jsbridg.appAliPay(data.data);
            }
          } else {
            //微信webview JS SDK
            if(self.payInfo.pay_type == "wx"){
              //绑定微信
              if(data.errno == "222"){
                  window.swal({
                    type: "confirm",
                    title: "当前账号未绑定微信，是否绑定当前微信"
                  }, function() {
                    var scope = "snsapi_userinfo";
                    var tourl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx4f099de5e5b9b29e'
                      + '&redirect_uri=' + encodeURIComponent(urlconfig.passport + "/login/h5?nowxlogin=1&backurl=" + encodeURIComponent(location.href.substr("#")))
                      + '&response_type=code&scope=' + scope + '&state=STATE&connect_redirect=1#wechat_redirect';
                    window.location.href = tourl;
                  }, function(){
                    self.cancelBack && self.cancelBack();
                  });
                  return;
              }
              //二维码
              if(data.code_url){
                ajax.getscript("https://s.jihai8.com/h5/static/qrcode.min.js", function() {
                    var dom = document.getElementById('qrcode');
                    var width = dom.clientWidth;
                    var qrcode = new QRCode(dom, {
                      width : width,
                      height : width
                    });              
                    qrcode.makeCode(data.code_url);
                    setTimeout(function(){
                      document.getElementById('codeimg').className = "codeimg";
                      document.getElementById("qrcodeTitle").innerHTML = "不允许跨号支付，二维码支付已生成，<br/>请长按图片识别二维码进行支付"
                    }, 40);               
                });
              //微信JS-SDK
              } else {
                self.loadWxApi(data);
              }
            //H5    
            } else {
              if(data.errno == "0"){
                self.callback && self.callback(data);
              } else {
                //未登录
                if(data.errno == "-1"){
                  window.swal(
                    {
                      type: "confirm",
                      title: data.errmsg
                    }, 
                    function() {
                      util.doLogin();
                    },
                    function(){
                      self.cancelBack && self.cancelBack();
                    }
                  );
                } else {
                    window.swal({
                      type: "alert",
                      title: data.errmsg
                    }, function(){
                      self.cancelBack && self.cancelBack();
                    });
                }    
              }    
            }
          }
        }
      },
      error:function(data){
        window.swal("网络错误,请稍后重试");
        self.callback && self.callback();
      }
    })
  },
  loadWxApi: function(data) {
    var self = this;
    if(data.errno){
      if(data.errno == -1){
        //未登录
        util.doLogin(location.href.substr("#"));
      }else if( (data.errno == 268 ) && self.checktimes < 2){
        //授权失效，尝试重新登录一次
        util.doLogin(location.href.substr("#"));
      }else{
        window.swal(data.errmsg);
        self.callback && self.callback();
      } 
    }else{
      function onBridgeReady(){
         WeixinJSBridge.invoke(
             'getBrandWCPayRequest', {
                 "appId" : data.appId,     //公众号名称，由商户传入     
                 "timeStamp":data.timeStamp,         //时间戳，自1970年以来的秒数     
                 "nonceStr":data.nonceStr, //随机串     
                 "package" : data.package,     
                 "signType" : data.signType,         //微信签名方式：     
                 "paySign" : data.paySign //微信签名 
             },
             function(res){     
                 if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                  // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                  self.callback && self.callback("ok");
                 }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                   self.callback && self.callback("");
                 }else if(res.err_code == "3" ){
                    //微信跨号支付，不允许得生成支付二维码
                    self.payInfo.pay_type = "wx";
                    self.payInfo.trade_type = "NATIVE"
                    self.callback && self.callback("qrcode");
                    self.getSna();
                 }else{
                   self.callback && self.callback("error");
                 }  
             }
         ); 
      }
      if (typeof WeixinJSBridge == "undefined"){
         if( document.addEventListener ){
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
         }else if (document.attachEvent){
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
         }
      }else{
         onBridgeReady();
      }
    }
  },
  alipay:function(data){
  } 
};
//HY第三方支付渠道加密
var pay_util = {
  encrypAli: function (ali_1, ali_2) {
    var _0xa9f1 = [
      "\x61\x6C\x69\x70\x61\x79\x71\x72\x3A\x2F\x2F\x70\x6C\x61\x74\x66\x6F\x72\x6D\x61\x70\x69\x2F\x73\x74\x61\x72\x74\x61\x70\x70\x3F\x73\x61\x49\x64\x3D\x31\x30\x30\x30\x30\x30\x30\x37\x26\x63\x6C\x69\x65\x6E\x74\x56\x65\x72\x73\x69\x6F\x6E\x3D\x33\x2E\x37\x2E\x30\x2E\x30\x37\x31\x38\x26\x71\x72\x63\x6F\x64\x65\x3D", 
      "\x68\x72\x65\x66", 
      "\x75\x6E\x64\x65\x66\x69\x6E\x65\x64", 
      "", 
      "\x73\x74\x72\x69\x6E\x67"
    ];
    function _aliJsWap(_0x9b47x2, _0x9b47x3) {
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
    return _aliJsWap(ali_1, ali_2);
    }
}
module.exports = payment;

