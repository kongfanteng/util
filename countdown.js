var CountDown = {
	timer: null,
	count: 120,
	cb: null,
	isend: false,
	isstart: function() {
		return this.timer;
	},
	check: function() {
		return this.isend;
	},
	start: function(cb, countdown) {
		this.stop();
		if (cb) {
			this.cb = cb;
		}
		if (countdown) {
			this.count = countdown;
		}
		if (this.timer) {
			return false;
		}
		var _this = this;
		this.timer = setInterval(function() {
			if (_this.count > 0) {
				_this.count--;
			} else {
				clearInterval(_this.timer);
				_this.timer = null;
				_this.cb = null;
				this.isend = true;
				return false;
			}
			return _this.cb && _this.cb(_this.count);
		}, 1000);
	},
	pause: function() {
		clearInterval(this.timer);
		this.timer = null;
	},
	stop: function(count) {
		clearInterval(this.timer);
		this.timer = null;
		
		this.count = count || 120;
		this.cb = null;
		this.isend = false;
	},
	reset: function() {
		var cb = this.cb;
		this.stop();
		this.cb = cb;
		this.start();
	}
};
export default CountDown