/*!
 Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE.
 */
(function ($, window, undefined) {
    var hooks = $.event.fixHooks,
        hookProps = ['dataTransfer', 'pageX', 'pageY'];

    /**
     * @private
     * @param elem
     * @return {Object}
     */
    function getStyleAttribute(elem){
        var cssObj,
            props = {},
            i;

        if ('getComputedStyle' in window) {
            cssObj = getComputedStyle(elem, '');

            for (i = 0; i < cssObj.length; i++) {
                props[cssObj.item(i)] = cssObj.getPropertyValue(cssObj.item(i)); 
            }
        } else if ('currentStyle' in element) {
            cssObj= elem.currentStyle;
            for (i in cssObj) {
                props[i] = cssObj[i];
            }
        }

        return props;
    }

    /**
     * @private
     * @param props
     * @return {String}
     */
    function stylePropertiesToText(props) {
        var cssTxt = "";

        $.each(props, function (prop, val) {
            cssTxt += prop + ":" + val + "; ";
        });

        return cssTxt;
    }

    /**
     * @private
     * @param elem
     * @param additionalStyle
     * @return {Image}
     * @constructor
     */
    function GhostImage(elem, additionalStyle) {
        var data, url, img,
            $elem = $(elem),
            ghost = $elem.clone().get(0),
            imageStyle = {
                'position': 'static'
            },
            css = $.extend(getStyleAttribute(elem), additionalStyle, imageStyle);

        ghost.setAttribute('style', stylePropertiesToText(css));
        ghost.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

        data = '<svg xmlns="http://www.w3.org/2000/svg" width="'+ $elem.outerWidth() +'" height="'+ $elem.outerHeight() +'">' +
                    '<foreignObject width="100%" height="100%">'+ ghost.outerHTML +'</foreignObject>' +
                   '</svg>';

        url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);

        img = new Image();
        img.src = url;

        return img; 
    }

    /**
     *
     * @param {DOMElement} [options.elem] element used as a source for the ghost
     * @param {Object} [options.style] additional map of css directives
     * @param {Object} [options.pos] contains a x and y property used as an offset to the cursor
     */
    function GhostBuilder(options) {
        var img,
            event = this,
            cfg = $.extend({
                elem: event.target
            }, options),
            $elem = $(cfg.elem);

        cfg.pos = cfg.pos || {
            x: Math.round($elem.width() / 2),
            y: Math.round($elem.height() / 2)
        };

        // options: style
        // elem:
        // pos: (x|y) default is center
        img = GhostImage(cfg.elem, cfg.style);

        if (event.dataTransfer && event.dataTransfer.setDragImage) {
            event.dataTransfer.setDragImage(img, cfg.pos.x, cfg.pos.y);
        }
    }

    /**
     * @private
     * @param chain
     * @return {Function}
     */
    function dragstartFilter (chain) {
        return function (event) { // add ghost object for configuration to event object
            event.attachGhost = GhostBuilder.bind(event);

            return chain ? chain.apply(this, arguments) : event;
        }    
    }

    /**
     * @private
     * @param chain
     * @return {Function}
     */
    function dragendFilter (chain) {
        return function (event) { // add ghost object for configuration to event object
            var $doc = $(document),
                origEv = event.originalEvent;

            event.pageX = origEv.screenX + $doc.scrollLeft();
            event.pageY = origEv.screenY + $doc.scrollTop();

            return chain ? chain.apply(this, arguments) : event;
        };
    }

    // chaining to make sure existing filters are executed
    hooks.dragstart = hooks.dragstart || {};
    hooks.dragstart.props = (hooks.dragstart.props || []).concat(hookProps);
    hooks.dragstart.filter = dragstartFilter(hooks.dragstart.filter);
    hooks.dragstart.attachGhost = GhostBuilder

    hooks.dragover = hooks.dragover || {};
    hooks.dragover.props = (hooks.dragover.props || []).concat(hookProps);

}(jQuery, this));