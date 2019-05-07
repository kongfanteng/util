/**
 * @fileoverview Calendar组件
 */
import React, { Component, PropTypes, Children } from 'react';
import classnames from 'classnames'
export default class Calendar extends Component{
  constructor(props) {
    super(props);
    let newDate = new Date();
    this.state = {
       year: this.formatDate(newDate, 'yyyy'),
       month: parseInt(this.formatDate(newDate,'MM')),
       day: parseInt(this.formatDate(newDate,'dd')),

       new_year: this.formatDate(newDate, 'yyyy'),
       new_month: parseInt(this.formatDate(newDate,'MM')),
       new_day: parseInt(this.formatDate(newDate,'dd'))
    };
  }
  componentWillReceiveProps(nextProps) {
     let self = this;
     let newDate = new Date(nextProps.current_time.replace(/-/g, "/"));
     self.setState({
       year: this.formatDate(newDate, 'yyyy'),
       month: parseInt(this.formatDate(newDate,'MM')),
       day: parseInt(this.formatDate(newDate,'dd')),

       new_year: this.formatDate(newDate, 'yyyy'),
       new_month: parseInt(this.formatDate(newDate,'MM')),
       new_day: parseInt(this.formatDate(newDate,'dd'))
     })
  }
  getMonthDays () {
    let self = this;
    let {
      new_year,
      new_month,
      new_day
    } = self.state;
    let monthDays = new Date(new_year, new_month, 0);
    return monthDays.getDate();
  }
  getFirstDayWeek () {
    let self = this;
    let {
      new_year, 
      new_month, 
      new_day
    } = self.state;
    let weekDays = new Date(new_year + "/" + new_month + "/1");
    return weekDays.getDay();
  }
  preMonth () {
    let self = this;
    let {
      new_year, 
      new_month, 
      new_day
    } = self.state;
    let newMonth = parseInt(new_month) - 1;
    if(newMonth < 1) {
       new_year--;
       newMonth = 12;
    }
    self.setState({
      new_year: new_year,
      new_month: newMonth,
      new_day: new_day
    })
  }
  nextMonth () {
    let self = this;
    let {
      new_year, 
      new_month, 
      new_day
    } = self.state;
    let newMonth = parseInt(new_month) + 1;
    if(newMonth > 12) {
       new_year++;
       newMonth = 1;
    }
    self.setState({
      new_year: new_year,
      new_month: newMonth,
      new_day: new_day
    })
  }
  curDay (newyear, newmonth, newday) {
    let self = this;
    self.setState({
      year:  newyear,
      month: newmonth,
      day:   newday
    })
    self.props.callback(newyear, newmonth, newday);
  }
  close () {
    this.props.close();
  }
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
  }
  render () {
    let self = this;
    let {
      year, 
      month, 
      day,

      new_year,
      new_month,
      new_day
    } = self.state;
    let {
      show,
      start_time,
      end_time,
      current_time
    } = self.props;
    let arr_day_pre = [];
    let arr_day_ing = [];
    //这个月有多少天
    let getDays = self.getMonthDays();
    //这个月第一天开始之前的数据
    let FirstDayWeek = self.getFirstDayWeek();
    for(var m = 0 ;m < FirstDayWeek; m++ ){
      arr_day_pre[m] = m;
    }
    let node_day_pre = [];
    arr_day_pre.forEach(function (item, index) {
      node_day_pre.push(<li></li>);
    })

    //开始时间
    let startDay   = self.formatDate(new Date(start_time), 'yyyyMMdd') * 1;   
    //结束时间
    let endDay     = self.formatDate(new Date(end_time), 'yyyyMMdd') * 1;     
    //选择当前时间
    let currentDay = self.formatDate(new Date(year + "/" + month + "/" + day), 'yyyyMMdd') * 1; 
    //明天
    let future__today = new Date();
    future__today.setDate(future__today.getDate() + 1);
    let tomorrowDay = self.formatDate(future__today, 'yyyyMMdd') * 1;
    for(var m = 0 ;m < getDays ; m++ ){
      arr_day_ing[m] = (m + 1);
    } 
    //显示日历DOM
    let node_day_ing = [];
    arr_day_ing.forEach(function (item, index) {
      var current = self.formatDate(new Date(new_year + "/" + new_month + "/" + item), 'yyyyMMdd') * 1;
      if(current == currentDay) {
        node_day_ing.push(
          <li className="active" onClick={self.curDay.bind(self, new_year, new_month, item)}>
            <div className="text">
              <span className="date-elem">{item}</span>
            </div>
          </li>
        );
      } else if (current < startDay) {
        node_day_ing.push(
          <li onClick={self.curDay.bind(self, new_year, new_month, item)}>
            <span className="date-elem">{item}</span>
          </li>
        );
      } else if (current > endDay) {
        node_day_ing.push(
          <li className="disabled">
            <span className="date-elem">{item}</span>
          </li>
        );
      } else { 
        if(current > tomorrowDay) {
          node_day_ing.push(
            <li className="no">
              <div className="text">
                <span className="date-elem">{item}</span>
                <span className="name-elem">暂无</span>
              </div>
            </li>
          );
        } else {
          node_day_ing.push(
            <li onClick={self.curDay.bind(self, new_year, new_month, item)}>
              <span className="date-elem">{item}</span>
            </li>
          );
        }
      }
    })
    return (
      <div className={classnames({"calendar-plugin": true,"show": show})} onTouchMove={(event) => {event.preventDefault();}}>
         <div className="calendar-nav">选择日期<span className="close" onClick={self.close.bind(self)} >×</span></div>
         <ul className="calendar-title">
            <li>日</li>
            <li>一</li>
            <li>二</li>
            <li>三</li>
            <li>四</li>
            <li>五</li>
            <li>六</li>
         </ul>
         <div className="calendar-content">
              <section className="calendar-item">
                  <div className="calendar-date">
                    <i className="icon i_back" onClick={self.preMonth.bind(self)} ></i>{
                    new_year}年{new_month}月
                    <i className="icon i_next" onClick={self.nextMonth.bind(self)} ></i>
                  </div>
                  <ul className="calendar-day">
                    {node_day_pre}
                    {node_day_ing}
                  </ul>
              </section>
         </div>
      </div>
    );
  }
}
Calendar.propTypes = {
  show: React.PropTypes.bool.isRequired
};
Calendar.defaultProps = {
  show: false
};


