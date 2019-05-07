var Lazy = function(el, listenEl, event, config, callback) {
	this.attr = config.attr || "data-lazyload",
	this.diff = config.diff || -10;
	this.loader = config.loader || function(img, src) {
	  img.src = src;
	}
	this.el = el;
	this.event = event;
	this.listenEl = listenEl;
	this.timer = null;
	this.callback = callback || function () {}
	this.bind();
};
Lazy.prototype = {
	needScrollLoad: function () {
	  var remain = 150;
	  var scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
	  var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
	  var clientHeight = window.innerHeight;
	  return scrollHeight >= remain + 50 && scrollHeight - scrollTop - clientHeight < remain
	}, 
	load: function() {
		var self = this;
		if (!this.el) {
			return;
		}
		this.loadEls = [].slice.call(this.el.querySelectorAll("[" + this.attr + "]"));
		if (!this.loadEls.length) {
			return;
		}
		var screenHeight = window.innerHeight;
		var scrollY = window.scrollY;
		for (var i = 0, el; el = this.loadEls[i]; i++) {
			var elRect;
			var _rect = el.getBoundingClientRect();
			var _tmpRect = {
				top: _rect.top + scrollY,
				bottom: _rect.bottom + scrollY
			};
			elRect = _tmpRect;
			var tDiff = -Math.abs(this.diff),
				bDiff = +Math.abs(this.diff);
			var isInViewPort = !(elRect.top > screenHeight + scrollY + bDiff || elRect.bottom < scrollY + tDiff);
			if (isInViewPort) {
				self.loader(el, el.getAttribute(this.attr));
				el.removeAttribute(this.attr)
			} 
		}
	},
	bind: function() {
		var self = this;
		self.listenEl.addEventListener(self.event, function () {
			clearTimeout(self.timer);
			self.timer = setTimeout(function() {
			  self.load();
			  if (self.needScrollLoad()) {
			  	self.callback && self.callback()
			  }
			}, 100)
		}, false);
		self.load();
	}
};
module.exports = Lazy;
