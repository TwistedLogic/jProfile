(function($) {
    $.fn.crover = function(options) {
	
        var conf = jQuery.extend({
        	width: 1280,
        	height: 557,
        	center: false,
            zoom: false,
            animation: false
        }, options)
		
        return this.each(function() {
            var crover = new Crover(this)
            $(this).data("crover", crover)
        })
    
        function Crover(el) {
			
            var singleton = this
            var $img = $(el)
			
            this.coords = function() {
                var pos = $img.position()
                var w = $img.width()
                var h = $img.height()
                var x = w > conf.width ? pos.left - (w - conf.width) : pos.left
                var y = h > conf.height ? pos.top - (h - conf.height) : pos.top
                return {
                    top: y ,
                    left: x
                }
            }

            this.destroy = function() {
            	var coords = this.coords()
                $('.crover-box').first().before($img).remove()
                $img.draggable("destroy").css({ top: coords.top , left: coords.left , cursor: 'default' })
                $.removeData($img,'crover')
            }

            if ($img.width() != 0 && $img.height() != 0) apply()
            else $img.load(function() { apply() })

            function apply() {
                var w = $img.width()
                var h = $img.height()
                var pos = $img.position()

                var wrapW = 2*(w - conf.width) + conf.width
                var wrapH = 2*(h - conf.height) + conf.height
                var wrapX = (conf.width - w)
                var wrapY = (conf.height - h)

                if (w<conf.width) wrapX = 0 , wrapW=conf.width
                if (h<conf.height) wrapY = 0 , wrapH=conf.height

                $wrapper = $('<div />')
                $wrapper.css({
                    position: 'relative' ,
                    width: wrapW ,
                    height: wrapH ,
                    top: wrapY ,
                    left: wrapX
                })

                $crover = $('<div class="crover-box" />')
                $crover.css({
                    width: conf.width ,
                    height: conf.height,
                    overflow: 'hidden'
                })

                var x = (wrapW - w)/2
                var y = (wrapH - h)/2

                if (!conf.center) {
                	x = w > conf.width ? w - conf.width + pos.left : pos.left
                    y = h > conf.height ? h - conf.height + pos.top : pos.top
                }

                $img.wrap($crover).wrap($wrapper)
                $img.css({ position: 'relative', top: y , left: x , cursor: 'move' })

                if (conf.zoom) {
                    var scalingFactor = 0.2
                    $img.bind('mousewheel', function(event, delta) {
                        var dir = delta > 0 ? 'Up' : 'Down',
                        vel = Math.abs(delta);
                        if (dir == 'Up') {
                            $img.stop()
                            var width = $img.width()
                            var scW =  width - width*scalingFactor
                            var scH = h*scW/w
                            var scX = $img.position().left + ($img.width() - scW)/2
                            var scY = $img.position().top + ($img.height() - scH)/2
                            $img.animate({
                                width: scW ,
                                top: scY ,
                                left: scX
                            }, 200, 'swing', function() {
                                })
                        } else {
                            $img.stop()
                            var width = $img.width()
                            var scW =  width + width*scalingFactor
                            var scH = h*scW/w
                            var scX = $img.position().left - (scW - $img.width())/2
                            var scY = $img.position().top - (scH - $img.height())/2
                            $img.animate({
                                width: scW ,
                                top: scY ,
                                left: scX
                            }, 200, 'swing', function() {
                                })
                        }
                        return false;
                    });

                }

                var points
                var steps
                var counter

                $img.draggable({
                    containment: 'parent',
                    scroll: false ,
                    distance: 10,
                /*start: function() {
                        $img.stop()
                        points = []
                        steps = 0
                        counter = setInterval(function() {
                            steps = 0
                        },100)
                    },
                    drag: function(event,ui) {
                        steps++
                        if (points.push(ui) == 6) points.shift()
                    },
                    stop: function(event,ui) {

                        clearInterval(counter)
                        console.log('steps: ' + steps)
                        if (steps == 0) return

                        if (points.length < 5) {
                            console.log('too few points recorded: ' + points.length)
                            return
                        }

                        var p0 = {
                            x: points[0].position.left ,
                            y: points[0].position.top
                        }
                        var p1 = {
                            x: points[2].position.left ,
                            y: points[2].position.top
                        }
                        var p2 = {
                            x: points[4].position.left ,
                            y: points[4].position.top
                        }

                        console.log(p0)
                        console.log(p1)
                        console.log(p2)

                        var C = 5
                        var dx = Math.sqrt(Math.pow(p1.x-p0.x,2) + Math.pow(p1.y-p0.y,2))
                        var dy = Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2))
                        var cX = C*dx
                        var cY = C*dy

                        console.log(dx)
                        console.log(dy)

                        if (p1.x <= p0.x && p2.x <= p0.x && p2.y >= p0.y) {
                            var x = p2.x - cX
                            var y = p2.y + cY
                        } else if (p1.x >= p0.x && p2.x >= p0.x && p2.y >= p0.y) {
                            var x = p2.x + cX
                            var y = p2.y + cY
                        } else if (p1.x >= p0.x && p2.x >= p0.x && p2.y <= p0.y) {
                            var x = p2.x + cX
                            var y = p2.y - cY
                        } else if (p1.x <= p0.x && p2.x <= p0.x && p2.y <= p0.y) {
                            var x = p2.x - cX
                            var y = p2.y - cY
                        } else {
                            console.log('error, none of those cases')
                            return
                        }

                        $img.animate({
                            left: x ,
                            top: y
                        },1000,'swing')

                    }*/
                })

            }
			
        }
		
    }
})(jQuery);