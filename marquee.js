//构造器函数
function marguee(config){
    this.option = {
        time: 3000, //滚动时间间隔
        wrapDom: null,//滚动容器
        ele: "li" //滚动容器子节点
    }
    if(config){
        for(var i in config){
          this.option[i] = config[i];
        }
    }
    else{
        console.log('参数错误！');
        return;
    }
    this.remain = 0; //已滚动距离
    this.begin  = 0; //已滚动次数
    this.timer  = null; //定时器
    var eles = this.option.wrapDom.getElementsByTagName(this.option.ele);
    this.max  = eles.length || 1;
    this.dest = this.option.wrapDom.offsetHeight / this.max;
    this.option.wrapDom.appendChild(eles[0].cloneNode(true));
};
marguee.prototype.start = function(){
    var self = this;
    self.timer  = setInterval(function(){
        self.remain -= self.dest;
        self.begin++; 
        self.option.wrapDom.style.webkitTransitionDuration = "1000ms";
        self.option.wrapDom.style.webkitTransform = "translate3d(0, " + self.remain + "px, 0)";
        self.option.wrapDom.style.transitionDuration = "1000ms";
        self.option.wrapDom.style.transitionDuration = "translate3d(0, " + self.remain + "px, 0)";              
        if(self.begin == self.max ){
            setTimeout(function(){
            
            self.remain =0;
            self.begin  = 0;
            self.option.wrapDom.style.webkitTransitionDuration = "0ms";
            self.option.wrapDom.style.webkitTransform = "translate3d(0, " + self.remain + "px, 0)";
            self.option.wrapDom.style.transitionDuration = "0ms";
            self.option.wrapDom.style.transitionDuration = "translate3d(0, " + self.remain + "px, 0)"; 

            },1000);
         
        }
    }, self.option.time)
}

module.exports = marguee;
