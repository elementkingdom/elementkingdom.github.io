/*
 *
 * Handy functions
 *
 */
// select the first match only, context is optional
function $(selector, context) {
	return (context || document).querySelector(selector);
}

// select a list of matching elements, context is optional
function $all(selector, context) {
	return (context || document).querySelectorAll(selector);
}

var forEach = function (array, callback, scope) {
	for (var i = 0; i < array.length; i++) {
		callback.call(scope, i, array[i]); // passes back stuff we need
	}
};


function dirProp(direction, hProp, vProp) {
	return (direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp
}

function HammerCarousel(container, direction) {
	this.container = container;
	this.direction = direction;

	this.panes = Array.prototype.slice.call(this.container.children, 0);
	this.containerSize = this.container[dirProp(direction, 'offsetWidth', 'offsetHeight')];

	this.currentIndex = 0;

	this.hammer = new Hammer.Manager(this.container);
	this.hammer.add(new Hammer.Pan({ direction: this.direction, threshold: 10 }));
	this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this.onPan, this));

	this.show(this.currentIndex);
}

HammerCarousel.prototype = {
	/**
	 * show a pane
	 * @param {Number} showIndex
	 * @param {Number} [percent] percentage visible
	 * @param {Boolean} [animate]
	 */
	show: function(showIndex, percent, animate){
		showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
		percent = percent || 0;

		var className = this.container.className;
		if(animate) {
			if(className.indexOf('animate') === -1) {
				this.container.className += ' animate';
			}
		} else {
			if(className.indexOf('animate') !== -1) {
				this.container.className = className.replace('animate', '').trim();
			}
		}

		var paneIndex, pos, translate;
		for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
			pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
			translate = 'translate3d(' + pos + 'px, 0, 0)';
			this.panes[paneIndex].style.transform = translate;
			this.panes[paneIndex].style.mozTransform = translate;
			this.panes[paneIndex].style.webkitTransform = translate;
		}

		this.currentIndex = showIndex;
	},

	onPan : function (ev) {
		var delta = dirProp(this.direction, ev.deltaX, ev.deltaY);
		var percent = (100 / this.containerSize) * delta;
		var animate = false;

		if (ev.type == 'panend' || ev.type == 'pancancel') {
			if (Math.abs(percent) > 20 && ev.type == 'panend') {
				this.currentIndex += (percent < 0) ? 1 : -1;
			}
			percent = 0;
			animate = true;
		}

		this.show(this.currentIndex, percent, animate);
	}
};


// For while in development
function notify(feedbackMsg){
	$('.alert .feedback').innerHTML = feedbackMsg;
	$('.alert').classList.add('show')
	setTimeout(function(){
		$('.alert').classList.add('fadeIn')
	},10)
	setTimeout(function(){
		$('.alert').classList.remove('fadeIn')
	},1500)
	setTimeout(function(){
		$('.alert').classList.remove('show')
	},1800)
}

// X Time ago
function timeAgo(date) {
	date = new Date(date)

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago";
    }
    if(seconds == 0) {
    	return "Just now";
    }
    return Math.floor(seconds) + " seconds ago";
}