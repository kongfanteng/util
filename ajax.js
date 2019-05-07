/*
提供ajax基础功能函数

ajax:
jsonp:
*/


function AjaxClass(options) {
  var XmlHttp = false;
  var document=document||{};
  try {
    XmlHttp = new XMLHttpRequest(); 
  } catch ( e ) {
    try {
      XmlHttp = new ActiveXObject("MSXML2.XMLHTTP");
    } catch ( e2 ) {
      try {
        XmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
      } catch ( e3 ) {
        console.log("你的浏览器不支持XMLHTTP对象，请升级到IE6以上版本！");
        XmlHttp = false;
      }
    }
  }

  var _opt = {};
  options.method = options.method || "GET";
  _opt.Method = options.method.toUpperCase();
  _opt.Url = options.url;
  _opt.Async = options.async || true;
  _opt.Arg = "";
  var arg = "";

  if(options.isFormData ){
    arg=options.data;
  }else{
    if (options.data) {
        options.data._t=new Date()*1;
        for (var prop in options.data) {
          if(typeof options.data[prop] != "undefined" && options.data[prop] !== null){
            arg += prop + "=" + options.data[prop] + "&"
          }
        }
    }
    var l= arg.length;
    arg=arg.substr(0,l-1);
  }
  
  if (_opt.Method == "GET") {
    _opt.Url = _opt.Url + "?" + arg;
  } else {
    _opt.Arg = arg;
  }

  _opt.CallBack = options.success;
  _opt.error = options.error || function(xhr) {
    console.log(xhr.statusText);
  };
  
  var Send = function() {
    if (_opt.Url == "") {
      return false;
    }
    if (!XmlHttp) {
      return IframePost();
    }
    XmlHttp.open(_opt.Method, _opt.Url, _opt.Async);
    //XmlHttp.overrideMimeType("text/plain; charset=x-user-defined");
    if (_opt.Method == "POST") {
      XmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    }
    XmlHttp.setRequestHeader("Accept", "*/*");
    

    if (options.xhrFields && options.xhrFields.withCredentials) {
      XmlHttp.withCredentials = true;
    //XmlHttp.setRequestHeader("Set-Cookie", document.cookie)
    }
    XmlHttp.onreadystatechange = function() {
      if (XmlHttp.readyState == 4) {
        var Result = false;
        if (XmlHttp.status == 200) {
          Result = XmlHttp.responseText;
          if (typeof Result == "string") {
            Result = JSON.parse(Result);
          }

          _opt.CallBack(Result);
        } else {
          _opt.error(XmlHttp);
        }
        XmlHttp = null;
      } else {

      }
    }
    if (_opt.Method == "POST") {
      XmlHttp.send(_opt.Arg);
    } else {
      XmlHttp.send(null);
    }
  }

  //Iframe方式提交
  function IframePost() {
    var Num = 0;
    var obj = document.createElement("iframe");
    obj.attachEvent("onload", function() {
      var Result = obj.contentWindow.document.body.innerHTML;
      if (typeof Result == "string") {
        Result = JSON.parse(Result);
      }
      _opt.CallBack(Result); obj.removeNode()
    });
    obj.attachEvent("onreadystatechange", function() {
      if (Num >= 5) {
        console.log(false);obj.removeNode()
      }
    });
    obj.src = me.Url;
    obj.style.display = 'none';
    document.body.appendChild(obj);
  }

  Send();
}

function jsonp(url, callback) {
  var script = document.createElement("script");
  var callbackName = "jsonp" + new Date() * 1;
  window[callbackName] = callback;
  script.src = url.indexOf("?") > 0 ? (url + "&callback=" + callbackName) : (url + "?callback=" + callbackName);
  document.body.appendChild(script);
}

function getscript(url, callback,opt) {
  var script = document.createElement("script");
  if(opt){
    for(var i in opt){
      script[i]=opt[i];
    }
  }
  
  script.async = false;
  script.defer = true;
  script.onload = function(e) {
    callback && callback();
  }
  script.src = url;
  document.body.appendChild(script);
}
export default {
  ajax: AjaxClass,
  getscript: getscript,
  jsonp: jsonp
}