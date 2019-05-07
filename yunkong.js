//app发版支控相关
import util from "./util.js";
import jsbridg from "./jsbridg.js";
export default{
	goCharge: function( type ){
		var iospay = util.getCookie("iospay");
		var url = util.getProtocol() + '//h5.jihai8.com/page/new_pay?ordertype=buy';
		
		if(iospay == "2"){
			if ( type && type == "buy_points" ){
				jsbridg.appiosPay(0, type);
			}else{
				jsbridg.appiosPay(0);
			}
		}else{
			if ( type && type == "buy_points" ){
				url = util.getProtocol() + '//h5.jihai8.com/page/buy';
			}
			util.gotourl( url );
		}
	},
	canOpenurl: function(data){
		if(data.jumptype == 2){
		  util.gotourl(data.url);
		} else if(util.isJHApp() && data.jumptype * 1 == 3 && data.url){
		  var json = {
			"url": data.url,
			"jumptype": 3
		  }
		  jsbridg.goWebview(json);
		}else {
		  util.gotourl(data.url);
		}
		
	}
}