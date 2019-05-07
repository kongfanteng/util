/**
 * @fileoverview Swipe组件
 * 支持translate3d
 */
import React, { Component, PropTypes, Children } from 'react';
import classnames from 'classnames'
var startY;
export default class Swipe extends Component{
  constructor(props) {
    super(props);
    this.state = {
      items        : [],
      activeIndex  : this.props.activeIndex || 0,
      translateX   : 0,
      pointStart   : 0,
      pointEnd     : 0,
      timeStart    : new Date(),
    };
  }
  componentWillMount() {
    // 增加头尾拼接节点
    let items = [].concat(this.props.children),
        firstItem = items[0],
        lastItem = items[items.length - 1];
    items.push(firstItem);
    items.unshift(lastItem);
    this.setState({
      items : items,
    });
  }
  componentDidMount() {
    // 监听窗口变化
    window.addEventListener("resize", () => this._updateResize());
    // 设置起始位置编号
    this.onJumpTo(this.props.activeIndex);
    // 自动轮播开始
    this.startAutoPlay();
  }
  componentWillUpdate() {
    setTimeout(this._transitionEnd.bind(this), this.props.speed);
  }
  componentWillUnmount() {
    // 自动轮播结束
    this.pauseAutoPlay();
    // 移除监听窗口变化
    window.removeEventListener("resize", () => this._updateResize());
  }
  selectedFuc (data) {
    this.props.selectedFuc(data);
  }
  render () {
    const { height, webview, children, ...silders } = this.props;
    const self = this;
    const style = {
      items : {},
      pagination : {},
    };
    if (!this._isDirectionX()) {
      style.items.height = height;
    } else {
      style.items.whiteSpace = 'nowrap';
      style.pagination.display = 'inline-block';
    }
    return (
      <div className={classnames({"ui-swipe":true,"match-hide":silders.imgs.length === 0})}>
        <div ref="swipeItems"
          className="ui-swipe-items"
          style={style.items}
          onTouchStart={(event) => this._onTouchStart(event)}
          onTouchMove={(event) => this._onTouchMove(event)}
          onTouchEnd={(event) => this._onTouchEnd(event)}>
          {
            silders.imgs.map((result, index) => {
              var imgdom;
              if(webview && webview == '1') {
                 imgdom = (<img src={result.imgurl} onClick={self.selectedFuc.bind(self, result)}/>);
              } else {
                 if(result.url && result.imgurl) {
                   imgdom = (<a href={result.url}><img src={result.imgurl} /></a>);
                 } else {
                   imgdom = (<a href="javascript:;"><img src={result} /> </a>);
                 }
              }
              return <div className="ui-swipe-item" key={index}><div className="ui-swipe-pic">{imgdom}</div></div>
            })
          }
        </div>
        <div className={classnames({"ui-swipe-pagination":true, "ui-swipe-bg": silders.showTitle === 1,"match-hide": silders.imgs.length === 0})}>
          <ul className="ui-swipe-page">
            {
              silders.imgs.map((result, index) => {
                return <li key={"page-" + index} className={classnames({'active': index == this.state.activeIndex})} style={style.pagination} onClick={() => this.onSlideTo(index)} />
              })
            }
          </ul>
          <ul className="ui-swipe-title" className={classnames({"ui-swipe-title":true,"match-hide":silders.showTitle === 0})}>
            {
              silders.imgs.map((result, index) => {
                return <li key={"title-" + index} className={classnames({'none': index != this.state.activeIndex})}>{result.title}</li>
              })
            }
          </ul>
        </div>
      </div>
    );
  }
  // 滑动到指定编号
  onSlideTo(index) {
    this._onMoveTo(index, this.props.speed);
  }
  // 静默跳到指定编号
  onJumpTo(index) {
    this._onMoveTo(index, 0);
  }
  // 自动轮播开始
  startAutoPlay() {
    this.moveInterval = (this.props.autoPlay && setInterval(() => {
      let activeIndex = this.state.activeIndex,
      maxLength = this.props.imgs.length;
      activeIndex = (['left', 'top'].indexOf(this.props.direction) > -1)
                  ? (activeIndex + 1)
                  : (activeIndex - 1);
      if (activeIndex > maxLength - 1) {
        activeIndex = 0;
        this.onJumpTo(-1);
        this.onSlideTo(activeIndex);
      } else if (activeIndex < 0) {
        activeIndex = maxLength - 1;
        this.onJumpTo(maxLength);
        this.onSlideTo(activeIndex);
      } else {
        this.onSlideTo(activeIndex);
      }
      this.onSlideTo(activeIndex);
    }, this.props.autoPlayIntervalTime));
  }
  // 暂停自动轮播
  pauseAutoPlay() {
    if (this.moveInterval) { 
      clearInterval(this.moveInterval);
    }
  }
  // 更新窗口变化的位置偏移
  _updateResize() {
    this.onJumpTo(this.props.activeIndex);
  }
  // 移动到指定编号
  _onMoveTo(index, speed) {
    const dom = this.refs.swipeItems,
          px = -dom.offsetWidth * index;
    this._doTransition(dom, px, speed); 
    this.setState({
      activeIndex : index,
      translateX  : px,
    });
  }
  // 执行过渡动画
  _doTransition(dom, offset, duration) {
    let x = 0,
        y = 0;
    if (this._isDirectionX()) {
      x = offset;
    } else {
      y = offset;
    }
    dom.style.webkitTransitionDuration = duration + "ms";
    dom.style.mozTransitionDuration = duration + "ms";
    dom.style.oTransitionDuration = duration + "ms";
    dom.style.transitionDuration = duration + "ms";
    dom.style.webkitTransform = "translate3d(" + x + "px, " + y + "px, 0)";
    dom.style.mozTransform = "translate3d(" + x + "px, " + y + "px, 0)";
    dom.style.oTransform = "translate3d(" + x + "px, " + y + "px, 0)";
    dom.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
  }
  _transitionEnd() {
    let activeIndex = this.state.activeIndex,
        maxLength = this.props.imgs.length;
    if (activeIndex > maxLength - 1) {
      this.onJumpTo(0);
    } else if (activeIndex < 0) {
      this.onJumpTo(maxLength - 1);
    }
  }
  // 触屏事件
  _onTouchStart(event) {
    this.pauseAutoPlay();

    let pointX = this._getCurrentPoint(event),
        activeIndex = this.state.activeIndex,
        maxLength = this.props.imgs.length;
    startY=event.touches[0].pageY;
    // 跳转到头尾
    if (activeIndex <= 0) {
      this.onJumpTo(0);
    } else if (activeIndex >= (maxLength - 1)) {
      this.onJumpTo(maxLength - 1);
    }
    this.setState({ 
      pointStart : pointX,
      timeStart  : new Date(),
    });
  }
  _onTouchMove(event) {
    const pointX = this._getCurrentPoint(event),
          px = this.state.translateX  + (pointX - this.state.pointStart),
          dom = this.refs.swipeItems;
    var thisY = event.touches[0].pageY;
    var chaX = Math.abs(pointX - this.state.pointStart);
    var chaY = Math.abs(thisY-startY);
    if(chaY < 2 * chaX){
      event.preventDefault();
      this._doTransition(dom, px, 0);
      this.setState({
        pointEnd: pointX
      });
    }
  }
  _onTouchEnd(event) {
    const px = (this.state.pointEnd !== 0)
             ? this.state.pointEnd - this.state.pointStart
             : 0,
          timeSpan = new Date().getTime() - this.state.timeStart.getTime(),
          dom = this.refs.swipeItems;
    let activeIndex = this.state.activeIndex;
    // 判断滑动临界点
    // 1.滑动距离比超过moveDistanceRatio
    // 2.滑动释放时间差低于moveTimeSpan
    if (Math.abs(px / dom.offsetWidth) >= this.props.moveDistanceRatio) {
      activeIndex = (px > 0) ? (this.state.activeIndex - 1) : (this.state.activeIndex + 1);
      this.onSlideTo(activeIndex);
    } else {
      this.onSlideTo(activeIndex);
    }
    // 恢复自动轮播
    this.startAutoPlay();
    this.setState({
      pointStart  : 0,
      pointEnd    : 0,
      activeIndex : activeIndex,
    });
  }
  // 获取鼠标/触摸点坐标
  _getCurrentPoint(event, type) {
    var touch = (type == 'mouse')
              ? event
              : event.touches[0];

    var offset = (this._isDirectionX())
               ? touch.pageX
               : touch.pageY;
    return offset;
  }
  // 是否横向移动
  _isDirectionX() {
    var dir = (['left', 'right'].indexOf(this.props.direction) > -1)
            ? true
            : false;
    return dir;
  }
}
Swipe.propTypes = {
  direction            : React.PropTypes.string.isRequired,
  height               : React.PropTypes.number.isRequired,
  activeIndex          : React.PropTypes.number.isRequired,
  imgs                 : React.PropTypes.array.isRequired,
  speed                : React.PropTypes.number.isRequired,
  autoPlay             : React.PropTypes.bool.isRequired,
  autoPlayIntervalTime : React.PropTypes.number.isRequired,
  moveDistanceRatio    : React.PropTypes.number.isRequired,
  moveTimeSpan         : React.PropTypes.number.isRequired,
};
Swipe.defaultProps = {
  direction            : 'left',
  height               : 160,
  activeIndex          : 0,
  speed                : 300,
  autoPlay             : true,
  imgs : [],
  autoPlayIntervalTime : 3000,
  moveDistanceRatio    : 0.04,
  moveTimeSpan         : 300,
};

