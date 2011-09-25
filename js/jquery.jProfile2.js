;
(function($) {
    $.jProfile = function(element, options) {

        var TOP_LEFT = 0,
            TOP_RIGHT = 1,
            BOTTOM_RIGHT = 2,
            BOTTOM_LEFT = 3,
            viewport, mouseX, mouseY

        var defaults = {
            width: 768,
            height: 457,
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

        var contain = function(w, h, x, y) {
            var minX = -(w-plugin.settings.width),
                minY = -(h-plugin.settings.height),
                maxX = 0, maxY = 0

            var res = {
                left: x,
                top: y
            }

            if (x < minX) res.left = minX
            if (x > maxX) res.left = maxX
            if (y < minY) res.top = minY
            if (y > maxY) res.top = maxY

            //console.log(minX + '-' + maxX + ' ' + minY + '-' + maxY)
            //console.log('left: ' + res.left + ' top: ' + res.top)
            return res
        }

        var build = function() {

            var w = $img.width(),
                h = $img.height(),
                pos = $img.position()

            var $jProfile = $('<div class="jProfile" />')

            $jProfile.css({
                width: plugin.settings.width,
                height: plugin.settings.height,
                overflow: 'hidden'
            })

            var pos = contain(w, h, -(w-plugin.settings.width)/2, -(h-plugin.settings.height)/2)

            $img.wrap($jProfile)
            $jProfile = $img.closest('.jProfile')

            $img.css(pos)

            function zoom(dir) {
                var scalingFactor = 0.1,
                    //scaleStep = w*scalingFactor
                    scaleStep = 50
                var width = $img.width()

                if (mouseX < plugin.settings.width/2) {
                    if (mouseY < plugin.settings.height/2) viewport = TOP_LEFT
                    else viewport = BOTTOM_LEFT
                } else {
                    if (mouseY < plugin.settings.height/2) viewport = TOP_RIGHT
                    else viewport = BOTTOM_RIGHT
                }

                if (dir == 'Up') {
                    var scW = Math.abs(width-scaleStep),
                        scH = Math.abs(h*scW/w)

                    // Normalize new dimensions
                    if (scW < plugin.settings.width || scH < plugin.settings.height)
                        scW = plugin.settings.width

                    // do nothing if no width change
                    if ($img.width() == scW) return false

                    var scX = $img.position().left + (scW - $img.width())/2,
                        scY = $img.position().top + (scH - $img.height())/2

                    var dX = ($img.width() - scW),
                        dY = ($img.height() - scH),
                        vpW = plugin.settings.width/2,
                        vpH = plugin.settings.height/2

                    if (viewport == TOP_LEFT) {
                        var percX = 100-100*mouseX/vpW,
                            percY = 100-100*mouseY/vpH,
                            offsetX = dX/2/100*percX + dX/2,
                            offsetY = dY/2/100*percY + dY/2
                        var scX = $img.position().left + dX - offsetX,
                            scY = $img.position().top + dY - offsetY
                    } else if (viewport == TOP_RIGHT) {
                        var percX = 100-100*(mouseX-vpW)/vpW,
                            percY = 100-100*mouseY/vpH,
                            offsetX = dX/2/100*percX + dX/2,
                            offsetY = dY/2/100*percY + dY/2
                        var scX = $img.position().left - dX + offsetX,
                            scY = $img.position().top + dY - offsetY
                    } else if (viewport == BOTTOM_RIGHT) {
                        var scX = $img.position().left + ($img.width() - scW),
                            scY = $img.position().top + ($img.height() - scH)
                    } else {
                        var scX = $img.position().left + ($img.width() - scW),
                            scY = $img.position().top - ($img.height() - scH)
                    }
                    
                } else {
                    var scW = Math.abs(width+scaleStep),
                        scH = Math.abs(h*scW/w)

                    // Normalize new dimensions
                    if (scW > w || scH > h) scW = w

                    // do nothing if no width change
                    if ($img.width() == scW) return false

                    var scX = $img.position().left - (scW - $img.width())/2,
                        scY = $img.position().top - (scH - $img.height())/2

                    if (viewport == TOP_LEFT) {
                        var scX = $img.position().left - ($img.width() - scW),
                            scY = $img.position().top - ($img.height() - scH)
                    } else if (viewport == TOP_RIGHT) {
                        var scX = $img.position().left + ($img.width() - scW),
                            scY = $img.position().top - ($img.height() - scH)
                    } else if (viewport == BOTTOM_RIGHT) {
                        var scX = $img.position().left + ($img.width() - scW),
                            scY = $img.position().top + ($img.height() - scH)
                    } else {
                        var scX = $img.position().left - ($img.width() - scW),
                            scY = $img.position().top + ($img.height() - scH)
                    }
                }

                var pos = contain(scW, scH, scX, scY)
                
                $img.animate({
                    width: scW,
                    top: pos.top,
                    left: pos.left
                }, plugin.settings.duration, 'swing')

                return false                
            }

            if (plugin.settings.zoom) {
                $img.bind('mousewheel', function(event, delta) {
                    var dir = delta > 0 ? 'Up' : 'Down'
                    $img.stop()
                    zoom(dir)
                })
                $jProfile.mousemove(function(e) {
                    mouseX = e.pageX - this.offsetLeft;
                    mouseY = e.pageY - this.offsetTop;
                })
            }

            if (plugin.settings.draggable) {
                
                var opts = {
                    scroll: false,
                    distance: 10,
                    drag: function(e, ui) {
                        var pos = contain($img.width(), $img.height(), ui.position.left, ui.position.top)
                        ui.position.left = pos.left
                        ui.position.top = pos.top
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
                }
            } else return $(this).data('jProfile')
        })
    }

})(jQuery);