(function($, window, undefined) {
	var Zume = function(target, options) {
		var self = this,
			elements = self.elements = {
				target: target,
				image: $('img:first', target)
			},
			cache = {
				width: 0,
				height: 0
			},
			inited = false;

		// Expose properties
		self.options = options;

		$.extend(self, {
			init: function() {
				// Setup cache
				self.recache(false);

				// Setup target
				target.css('position', 'relative')
					.addClass('zume');

				// Create magnifier
				elements.mag = $('<div/>', {
					'class': 'zume-magnifier',
					'css': {
						'width': cache.width * cache.ratio,
						'height': cache.height * cache.ratio
					}
				})
				.appendTo( target );

				// Create zoom element
				elements.zoom = $('<div/>', {
					'class': 'zume-zoom',
					'css': {
						'width': cache.width,
						'height': cache.height
					}
				})
				.appendTo(document.body);

				// Create zoom elements image child
				elements.zoomImage = $('<img/>', {
					'src': elements.image.attr(options.fullsizeAttr)
				})
				.appendTo(elements.zoom);

				// Apply events
				target.bind('mouseenter mouseleave', function(event) {
					self[ event.type === 'mouseenter' ? 'show' : 'hide' ](event);
				})
				.bind('mousemove', function(event) {
					self.move(event);
				});

				// Set inited flag
				inited = true;

				return self;
			},

			recache: function(update) {
				// Cache image dimensions and offset
				cache.width = elements.image.width();
				cache.height = elements.image.height();
				cache.ratio = cache.width / cache.big.width;
				cache.offset = target.offset();

				// Re-calculate ratio
				cache.ratio = cache.width / cache.big.width;

				// If update is enabled
				if(update !== false) {
					// Update magnifier
					elements.mag.css({
						'width': cache.width * cache.ratio,
						'height': cache.height * cache.ratio
					});

					// Update zoo mdimensions
					elements.zoom.css({
						'width': cache.width,
						'height': cache.height
					});

					// Update positions
					self.move(cache.event);
				}
			},

			move: function(event) {
				if(!inited) { return self; }

				var mag = elements.mag[0],
					magWidth = Math.floor(cache.width * cache.ratio),
					magHeight = Math.floor(cache.height * cache.ratio),
					left, top

				// Determine positioning using mouse coordinates
				left = Math.max( 0, Math.min( cache.width - magWidth,
					event.pageX - cache.offset.left - Math.floor(magWidth / 2)
				));
				top = Math.max( 0, Math.min( cache.height - magHeight,
					event.pageY - cache.offset.top - Math.floor(magHeight / 2)
				));

				// Set new positions of magnifier and zoom image
				elements.mag.css({ 'left': left, 'top': top });
				elements.zoomImage.css({ 'left': -left / cache.ratio, 'top': -top / cache.ratio });

				// Cache event
				cache.event = $.extend({}, event);

				return self;
			},

			update: function(src, bigsrc) {
				if(!inited) { return self; }

				// Set
				elements.image[0].src = src;
				elements.zoomImage[0].src = bigsrc || src;

				// When new image is loaded
				cache.big.onload = self.recache;
				cache.big.src = bigsrc || src;
			},

			show: function(event) {
				if(!inited) { return self; }

				// Fade in magnififer
				elements.mag.stop(0,1).fadeIn(200);

				// Position and fade in the zoom
				elements.zoom.css({
					left: cache.offset.left + cache.width,
					top: cache.offset.top
				})
				.stop(0,1).fadeIn(200);

				return self;
			},

			hide: function(event) {
				if(!inited) { return self; }

				// Fade out magnifier and zoom
				elements.mag.add(elements.zoom)
					.stop(0,1).fadeOut(200);

				return self;
			}
		});

		// When big gallery image has loaded...
		cache.big = new Image();
		cache.big.src = elements.image.attr(options.fullsizeAttr);
		cache.big.onload = self.init;
		cache.big.onerror = function() {
			$.error('Could not load main gallery image... aborting');
		}
	}

	$.fn.zume = function(options) {
		var opts = $.extend(true, $.fn.zume.defaults, options);

		return this.each(function() {
			var api = new Zume( $(this), opts );
			$.data(this, 'zume', api);
		});
	};

	$.fn.zume.defaults = {
		fullsizeAttr: 'src'
	};
}(jQuery, this));