/**
 * lazyload的组件
 * v2.0.1
 * 图片懒加载组件
 * version 2.0
 * 新增功能:
 * 1.重新组织lazyload代码,将这个组件变为纯原生js编写不依赖任何库的组件
 * 2.增加支持背景图懒加载
 * 3.增加渐出动画效果
 *
 */
export default class Lazyload {
  constructor(options) {
    var defaults = {
      container: document.body,
      effect: false
    },
    opts = _extend(defaults, options);
    if (typeof opts.container == 'string') {
      opts.container = document.querySelectorAll(opts.container);
    }
    if (!opts.container) {
      opts.container = document.body;
    }
    opts.images = opts.container.querySelectorAll('.lazy');
    this.container = opts.container;
    this.timer = null;
    this.effect = opts.effect;
    this.images = opts.images;
    this.clickload = opts.clickload;
    this.loadend = opts.loadend;
    this.setImages();
    if(this.clickload){
      this.clickloadEvent();
    } else {
      this.processScroll();
    }
    function _extend(ori, ext) {
      if (!ext) {
        ext = {};
      }
      if (Array.isArray(ori)) {
        for (var i = 0, len = ext.length; i < len; i++) {
          (ori.indexOf(ext[i]) === -1) && ori.push(ext[i]);
        }
      } else {
        for (var key in ori) {
          if ((!ext.hasOwnProperty(key)) || typeof ext[key] === "undefined") {
            ext[key] = ori[key];
          }
        }
      }
      return ext;
    }
  }
  getNewImage(){
    this.images = this.container.querySelectorAll('.lazy');
    //this.setImages();
    if(this.clickload){
      this.clickloadEvent();
    }
  }
  setImages(){
    var count = this.images.length;
    for(var i = 0; i < count; i++){
      var img = this.images[i];
      var wh = img.getAttribute("wh");
      var isset = img.getAttribute("isset");
      if(wh && isset != "1"){
        var imgdiv = img.parentElement;
        var _w = document.getElementById("content").offsetWidth;
        var hasimgdiv = 0;
        if(imgdiv.className == "imgdiv"){
          hasimgdiv = 1;
          img.style.width = "100%";
        }else{
          img.style.width = "100%";
        }      
        wh = wh.split("|");
        var w = wh[0];
        var h = wh[1];
        var _h = Math.ceil(_w * h / w);
        if(hasimgdiv){
          imgdiv.style.width = "100%";
          imgdiv.style.height = _h + "px";
        }
        img.style.height = _h + "px";
        img.setAttribute("isset","1");
      }
    }   
  }
  processScroll() {
    var _this = this;
    function _scrollEvent(instance) {
      var _this = instance;
      if (_this.timer) {
        clearTimeout(_this.timer);
        _this.timer = null;
      }
      _this.timer = setTimeout(function() {
        for (var i = 0; i < _this.images.length; i++) {
          if (_this.elementInViewport(_this.images[i])) {
            (function(i) {
              _this.loadImage(_this.images[i], function() {
                if(_this.images[i]){
                  _this.loadend&&_this.loadend(_this.images[i].src);
                }
              });
            })(i)
          }
        };
      }, 200);
    }
  }
  clickloadEvent(){
    var _this=this;
    var imgs=this.container.querySelectorAll('.lazy');
    for(var i=0; i < imgs.length; i++){
      if(imgs[i].className.indexOf("adde") == -1){
        imgs[i].addEventListener('click',function(event){
          event.stopPropagation();
          _this.loadImage(this, function() {
            
          },true);
        });
        imgs[i].className += " adde";
      }
    }
  }
  elementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (rect.top >= 0 && rect.left >= 0
      && rect.top <= (window.innerHeight || document.documentElement.clientHeight))
      || (rect.bottom >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    )
  }
  loadImage(el, fn) {
    var img = new Image(),
      destSrc = el.getAttribute('data-src'),
      destBackground = el.getAttribute('data-background'),
      src = '',
      type = '',
      desc = destSrc || destBackground,
      _this = this;
      

    
    if(el.className.indexOf("loaded")>=0){
        return;
    }
    if ((destSrc && (!destSrc && destSrc == 'undefined')) || (destBackground && (!destBackground && destBackground == 'undefined'))) {
      return;
    }

    //图片img
    if (destSrc) {
      type = 0;
    }
    //背景图片background
    if (destBackground) {
      type = 1;
    }
    switch (type) {
      case 0:
        src=el.src;
        if (desc == src) {
          return;
        }
        
        img.onload = _imgLoadEvent;
        
        break;
      case 1:
        src = el.style.backgroundImage;
        if ((new RegExp(desc)).test(src)) {
          return;
        }
        
        img.onload = _backgroundImageLoadEvent;
        break;
    }
    if (this.effect) {
      el.style.opacity = 0;
    }
    img.src = desc;
    function _imgLoadEvent() {
        
      
       el.src=desc;
      _removeClass();
      if (_this.effect) {
        el.style.opacity = 1;
      }
      

      fn&&fn(); 
    }
    function _backgroundImageLoadEvent() {
      el.style.backgroundImage = 'url(' + desc + ')';
      if (_this.effect) {
        el.style.opacity = 1;
      }
      _removeClass();
      fn&&fn(); 
    }

    function _removeClass() {
      var newClass = el.className.replace('lazy', '');

      el.className = newClass + ' loaded';
      console.log(el.className);
    }
  }
  getImages() {
    this.images = [];
    var imgs = this.container.querySelectorAll('.lazy'),
      _this = this;
    Array.prototype.slice.apply(imgs).forEach(function(img, index, imgs) {
      var src = img.getAttribute('src'),
        background = img.style.backgroundImage;
      if ((src && img.dataset.src != src) || (background && !(new RegExp(img.dataset.background)).test(background))) {
        _this.images.push(img);
      }
    });
    this.processScroll();
  }
}




