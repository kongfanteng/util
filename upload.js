//图片上传组件
import * as apply from "../actions/apply.js"
import ajax from "../common/ajax.js"
import {hex_md5} from "./md5.js"
var headimg = "";
var host = "";
function random_string(len) {
　　var len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
　　var maxPos = chars.length;
　　var pwd = '';
　　for (var i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    pwd = hex_md5("mp_"+pwd + '' + (+new Date()));
    return pwd;
}
function get_suffix(filename) {
    var pos = filename.lastIndexOf('.')
    var suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
}
function calculate_object_name(filename,key) {
    suffix = get_suffix(filename)
    var suffix = get_suffix(filename)
    headimg = random_string(10)+ suffix
    return headimg;
}
function set_upload_param(up, filename, scene){
  var self = this;
  apply.getSignature(scene).then(function(ret){
      if(scene){
        ret.key = window.JHUser.uid;
      }
      var key = calculate_object_name(filename,ret.key);
      host = ret.host;
      var new_multipart_params = {
          'key' : key,
          'policy': ret.policyBase64,
          'OSSAccessKeyId': ret.accessid, 
          'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
          'callback' :ret.callbackbody,
          'signature': ret.signature,
      };
      up.setOption({
          'url': ret.host,
          'multipart_params': new_multipart_params
      });
      up.start();
    });    
}
export default function upload(options){
  return new Promise((resolve, reject) => {
    ajax.getscript("https://s.jihai8.com/h5/plupload/plupload.full.min.js",function(){
      //设置文件上传
      var uploader = new plupload.Uploader({
          runtimes : 'html5,flash,silverlight,html4',
          browse_button :options.browse_button, 
          container: options.container, //上传区域DOM ID，默认是browser_button的父元素，
          flash_swf_url : 'https://s.jihai8.com/h5/plupload/Moxie.swf',
          silverlight_xap_url : 'https://s.jihai8.com/h5/plupload/Moxie.xap',
          url : 'https://oss.aliyuncs.com',
          max_file_size: options.max_file_size, //最大文件体积限制
          unique_names: true,
          filters: {
            mime_types: [
              { 
                title: "images", 
                extensions: "jpg,gif,png,bmp,jpeg" 
              }
            ]
          },
          max_retries: 3,//上传失败最大重试次数
          auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
          resize:{
            quality: 70
          },
          init: {
            //添加文件后
            FilesAdded: function(up, files){
              for ( var i = 0 ; i < files.length; i++ ) {
                  var file = files[i];
                  if(options.startupload){
                    var type = options.startupload(file);
                    if(type){
                      set_upload_param(up, file.name, type); 
                    }
                  } else {
                     set_upload_param(up, file.name, options.sence); 
                  }
              }
            },
            //文件传输结束
            FileUploaded: function(up, file, info) {
              var picture = host + '/' + headimg;
              options.uploadsuccess && options.uploadsuccess(picture, file, headimg);
              options.uploadend && options.uploadend();
            },
            Error: function(up, err) {
              options.uploadend && options.uploadend();
              if(err.code == -600) {
                window.swal({
                  type: "tip",
                  title: "选择的文件太大了,图片不能大于" + options.max_file_size.toUpperCase()
                })
              }else if(err.code == -601 ){
                window.swal({
                  type:"tip",
                  title:"上传图片文件格式错误"
                })
              }
              console.log(err);
            }
          }
      });
      uploader.init();
      resolve(uploader);
    })
  });
}