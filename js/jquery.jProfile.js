;
(function($) {
    $.jProfile = function(element, options) {

        var defaults = {
            width: 1024,
            height: 557,
            center: true,
            draggable: true,
            zoom: true,
            animate: false,
            duration: 50
        }

        var plugin = this , $img = $(element)
        plugin.settings = {}

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options)

            if ($img.width() != 0 && $img.height() != 0) build()
            else $img.load(function() {
                build()
            })
        }

        plugin.coords = function() {
            var pos = $img.position()
            var w = $img.width()
            var h = $img.height()
            var x = w > plugin.settings.width ? pos.left - (w - plugin.settings.width) : pos.left
            var y = h > plugin.settings.height ? pos.top - (h - plugin.settings.height) : pos.top
            return {
                top: y,
                left: x
            }
        }

        plugin.destroy = function() {
            var coords = plugin.coords()
            // TODO Refactor
            $('.jProfile').first().before($img).remove()
            $img.draggable("destroy").css({ top: coords.top , left: coords.left })
            $.removeData($img, 'jProfile')
        }

        var wrap = function($wrapper, w, h, anim) {
            var wrapW = 2*(w - plugin.settings.width) + plugin.settings.width,
                wrapH = 2*(h - plugin.settings.height) + plugin.settings.height,
                wrapX = (plugin.settings.width - w),
                wrapY = (plugin.settings.height - h)

            // normalization step
            if (w<plugin.settings.width) wrapX = 0 , wrapW=plugin.settings.width
            if (h<plugin.settings.height) wrapY = 0 , wrapH=plugin.settings.height
            
            var res = {
                width: wrapW,
                height: wrapH,
                top: wrapY,
                left: wrapX
            }

            if (anim) $wrapper.animate(res, plugin.settings.duration)
            else $wrapper.css(res)
            return res
        }

        var build = function() {

            var w = $img.width(),
                h = $img.height(),
                pos = $img.position()

            var $jProfile = $('<div class="jProfile" />'),
                $wrapper = $('<div class="wrapper" />')

            var wrapper = wrap($wrapper, w, h)

            $jProfile.css({
                width: plugin.settings.width,
                height: plugin.settings.height,
                overflow: 'hidden'
            })

            var x = (wrapper.width - w)/2,
                y = (wrapper.height - h)/2

            if (!plugin.settings.center) {
                x = w > plugin.settings.width ? w - plugin.settings.width + pos.left : pos.left
                y = h > plugin.settings.height ? h - plugin.settings.height + pos.top : pos.top
            }

            $img.wrap($jProfile).wrap($wrapper)
            $jProfile = $img.closest('.jProfile')
            $wrapper = $img.closest('.wrapper')
            $img.css({
                left: x,
                top: y,
                position: 'relative'
            })

            function zoom(dir) {
                width = $img.width()

                // stop all animations
                //$img.stop()
                var wrapper

                if (dir == 'Up') {
                    var scW = Math.abs(width-w*scalingFactor),
                        scH = Math.abs(h*scW/w)

                    // Normalize new dimensions
                    if (scW > w || scH > h) scW = w
                    if (scW < plugin.settings.width || scH < plugin.settings.height)
                        scW = plugin.settings.width

                    // do nothing if no width change
                    if ($img.width() == scW) return false

                    var scX = $img.position().left + ($img.width() - scW)/2,
                        scY = $img.position().top + ($img.height() - scH)/2

                    // compute new wrapper
                    var wrapW = $wrapper.width(),
                        wrapH = $wrapper.height()

                    wrapper = wrap($wrapper, scW, scH, true)
                    scX -= (wrapW-wrapper.width)/2
                    scY -= (wrapH-wrapper.height)/2
                } else {
                    var scW = Math.abs(width+w*scalingFactor),
                        scH = Math.abs(h*scW/w)

                    // Normalize new dimensions
                    if (scW > w || scH > h) scW = w
                    if (scW < plugin.settings.width || scH < plugin.settings.height)
                        scW = plugin.settings.width

                    // do nothing if no width change
                    if ($img.width() == scW) return false

                    var scX = $img.position().left - (scW - $img.width())/2,
                        scY = $img.position().top - (scH - $img.height())/2

                    // compute new wrapper
                    var wrapW = $wrapper.width(),
                        wrapH = $wrapper.height()

                    wrapper = wrap($wrapper, scW, scH, true)
                    scX += (wrapper.width-wrapW)/2
                    scY += (wrapper.height-wrapH)/2
                }

                // normalization after wrapping resize
                console.log(scX)
                console.log(scY)
                var dX = wrapper.width-plugin.settings.width/2
                var dY = wrapper.height-plugin.settings.height/2
                if (scX < 0) scX = 0
                else if (scX > dX) scX = dX
                if (scY < 0) scY = 0
                else if (scY > dY) scY = dY

                console.log(scX)
                console.log(scY)

                $img.animate({
                    width: scW,
                    top: scY,
                    left: scX
                }, plugin.settings.duration)

                return false                
            }

            if (plugin.settings.zoom) {
                var scalingFactor = 0.1
                $img.bind('mousewheel', function(event, delta) {
                    var dir = delta > 0 ? 'Up' : 'Down'
                    if ($img.is(':animated') || $wrapper.is(':animated')) {
                        setTimeout(function() {
                            zoom(dir)
                        }, plugin.settings.duration)
                    } else {
                        zoom(dir)
                    }
                })
            }

            if (plugin.settings.draggable) {
                
                var opts = {
                    containment: 'parent',
                    scroll: false,
                    distance: 10
                }

                if (plugin.settings.animate) {
                    var points, steps, counter
                    
                    opts.start = function() {
                        $img.stop()
                        points = []
                        steps = 0
                        counter = setInterval(function() {
                            steps = 0
                        }, plugin.settings.duration)
                    },
                    opts.drag = function(event,ui) {
                        steps++
                        if (points.push(ui) == 6) points.shift()
                    },
                    opts.stop = function(event,ui) {

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
                    }
                }

                $img.draggable(opts)
            }
        }

        plugin.init()
    }

    $.fn.jProfile = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('jProfile')) {
                var type = $(this).attr('type')
                if (this.nodeName.toLowerCase() === 'img') {
                    var plugin = new $.jProfile(this, options)
                    $(this).data('jProfile', plugin)
                } else {
                    console.log('ERROR: you can customize only <img /> elements')
                }
            } else {
                console.log('ERROR: this image is already customized')
            }
        })
    }

})(jQuery);