var obj = {
    bridg:function(obj){
      if(!obj) {
        return;
      }
      var ua = "";
      if(typeof navigator != "undefined" ){
        ua = navigator.userAgent.toLowerCase();
      }   
      if(ua.indexOf("jihai8") == -1){
        return;
      }
       var str = JSON.stringify(obj);
       if(typeof JHAppJs != "undefined"){
         JHAppJs.runOnAppJs(str);
       }else if(typeof runOnAppJs != "undefined"){
         runOnAppJs(str);
       }else{
        if(window.webkit&&window.webkit.messageHandlers){
          window.webkit.messageHandlers.JihaiMessage.postMessage(str);
        }
       }  
    },
    runAppNotify:function(str){
      alert(str);
    },
    initCallback: function(call){
      var callbackName = "appcall" + new Date()*1;
      window[callbackName] = function(data){
        if(typeof data == "string"){
          data = JSON.parse(data);
        }
        if(data.errno){
            
        }else{
          var msg = data;
          if(data && data.data){
              msg = data.data;
          }
          call && call(msg);
        }
        delete window[callbackName];
      };
      return callbackName;
    },
    appComment:function(option){
        var obj = {
            code: 150,
            params: {
              board: option.board,
              topic: option.topic,
              replyid: option.replyid,
              replyname: option.replyname,
              topic_uid: option.uid
            }
        };
        if(option.callback){
            obj.callback = this.initCallback(option.callback);
        }
        this.bridg(obj);
    },
    appShare:function(option){
      var obj = {
          code: 151,
          params: {
            title:option.title,
            desc:option.desc,
            link:option.link,
            imgUrl:option.imgUrl
          }
      };
      if( option.shareType ){
        obj.params.shareType = option.shareType || "";
      };
      if( option.newsid ){
        obj.params.newsid = option.newsid || "";
      };
      this.bridg(obj);
    },
    //app右上角
    initAppShare: function(option){
      var obj = {
        code: 153,
        params: {
          title: option.title,
          desc: option.desc,
          link: option.link,
          imgUrl: option.imgUrl
        }
      };
      if( option.shareType ){
        obj.params.shareType = option.shareType || "";
      };
      if( option.source ){
        obj.params.source = option.source || "";
      };
      if( option.newsid ){
        obj.params.newsid = option.newsid || "";
      };
      this.bridg(obj);
    },
    appLogin:function(){
      this.bridg({
        code:100
      });
    },
    appUserPage:function(uid){
      this.bridg({
        code:152,
        params:{
              uid:uid
            }
      });
    },
    setTitle:function(title){
      this.bridg({
        code:154,
        params:{
              title:title
            }
      });
    },
    setVideo:function(src){
      this.bridg({
        code:171,
        params:{
              src:src
            }
        });
    },
    appFollowInfo:function(uid,isfollow){
      this.bridg({
        code:155,
        params:{
            uid:uid,
            isfollow:isfollow
          }
      });
    },
    appMatchFollow:function(id,isfollow){
      this.bridg({
        code:156,
        params:{
            matchid:id,
            isfollow:isfollow
          }
      });
    },
    appInfoLike:function(board,id,like){
      this.bridg({
        code:157,
        params:{
            board:board,
            id:id,
            like:like
          }
      });
    },
    goMatchLive(matchid,isLqCode){
      this.bridg({
        code: isLqCode || 164,  // 篮球是9，足球是164
        params:{
            matchid:matchid
          }
      });
    },
    goJihaihao(){
      this.bridg({
        code: 300,
        params: {
            code:501,
            jumptype:1
          }
      });
    },
    goLive2(){
      this.bridg({
        code: 163
      });
    },
    goLive () {
      this.bridg({
        code: 300,
        params: {
            code: 12,
            jumptype: 1
          }
      });
    },
    goFoundPage(){
      this.bridg({
        code: 300,
        params: {
            code:100,
            jumptype:1
          }
      });
    },
    goDataPage(flag){
      let params = {
          code: 15,
          jumptype:1
      }
      // 1刷新   0不刷新（默认）
      if(flag){
        params.refresh = 1
      }
      this.bridg({
        code: 300,
        params: params
      });
    },
    goHaiba(){
      this.bridg({
        code: 300,
        params: {
            code:503,
            jumptype:1
          }
      });
    },
    goUserList(matchid){
      this.bridg({
        code: 502,
        params:{
            news_id:matchid,
            jumptype:1
          }
      });
    },
    goBasketMatchLive(matchid){
      this.bridg({
        code: 9,
        params: {
            matchid: matchid
          }
      });
    },
    goPointsDetail(){
      this.bridg({
        code:110,
        params:{

        }
      });
    },
    postApply(){
      this.bridg({
        code:158,
        params:{}
      });
    },
    appUploadCut(cut){
      this.bridg({
        code:159,
        params:{
           cut:cut+""
        }
      });
    },
    appCheckInfo:function(board,id,support,against){
      this.bridg({
        code:172,
        params:{
            board:board,
            id:id,
            support:support,
            against:against
          }
      });
    },
    goHome(){
      this.bridg({
        code: 160
      });
    },
    appWXPay(json){
      this.bridg({
        code:200,
        params:json,
        callback:"appPaycallback"
      });
    },
    appAliPay(str){
      this.bridg({
        code:201,
        params:{urlparams:str},
        callback:"appPaycallback"
      });
    },
    appiosPay(fee, type){
      this.bridg({
        code: 202,
        params: {fee: fee, type: type},
        callback: ""
      });
    },
    bfbPay (pay_info) {
      this.bridg({
        code: 203,
        params: {
          pay_info: pay_info
        }
      });
    },
    // qq支付
    qqPay (pay_info){
      this.bridg({
        code: 204,
        params: {
          pay_info: pay_info
        },
        callback:"appPaycallback"
      });
    },
    appTeamPage(teamId,teamName){
      this.bridg({
        code:173,
        params:{teamId:teamId,teamName:teamName}
      });
    },
    collectInfo(newsid,status){
      this.bridg({
        code:174,
        params:{newsid:newsid,status:status}
      });
    },
    goMyCenter(){
      this.bridg({
        code: 300,
        params: {
          code: 300,
          jumptype: 1
        }
      })
    },
    goBack () {
      this.bridg({
        code: 301,
        params: {}
      });
    },
    appDialog (message) {
      this.bridg({
        code: 302,
        params:{
          message: message
        }
      });
    },
    androidUpdate(url){
      this.bridg({
        code: 175,
        params: {
          apk_url: url
        }
      })
    },
    /*
      {"jumptype":1, "code":100, "params":"id=1234", "title":"", "url":""}
      jumptype: 1代表跳客户端原生，2代表跳客户端WebView，3代表跳外部浏览器
      code:跳客户端原生需要配置，不同的跳转码代表不同的跳转页面，配合params传递参数
      title:跳转标题，可不传
      url：跳转WebView或外部浏览器，跳转地址
      goWebview({
        code: 501,
        jumptype: 1,
        params: "newsPlateType=23"
      });   // 直播间列表
     */
    goWebview(data) {
      this.bridg({
        code: 300,
        params: data
      })
    },
    goTalkRoom(code){
      this.bridg({
        code: 300,
        params: {
          code: code,
          jumptype: 1
        }
      })
    }
}
module.exports = obj;