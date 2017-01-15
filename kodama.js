/**
 * kodama.js (v2.0.0)
 *
 * Copyright (c) 2015 Scott Southworth & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @authors Scott Southworth @DarkMarmot scott.southworth@gmail.com
 *
 */

;(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['d3'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function(d3) {
            d3.kodama = factory(d3);
            return d3.kodama;
        }
    } else {
        root.d3.kodama = root.d3.bamboo = factory(root.d3);
    }

}(this, function (d3) {

    if(d3.kodama) return d3.kodama;

    var kodama = {};

    var validOptions = ['gravity','theme','distance','style','target','by',
        'fadeInDuration', 'fadeOutDuration', 'holdDuration'];

    var initialized = false;
    var bodyNode = null; //d3.select('body').node();
    var baseSel = null;
    var tipSel = null;
    var holderSel = null;


    var fadingState = "none";

    var gravityDefs = {

        northwest: [-1, -1],
        topleft: [-1, -1],
        upperleft: [-1, -1],
        northeast: [1, -1],
        topright: [1, -1],
        upperright: [1, -1],
        southwest: [-1, 1],
        bottomleft: [-1, 1],
        lowerleft: [-1, 1],
        southeast: [1, 1],
        bottomright: [1, 1],
        lowerright: [1, 1],
        north: [0, -1],
        top: [0, -1],
        south: [0, 1],
        bottom: [0, -1],
        west: [-1, 0],
        left: [-1, 0],
        right: [1, 0],
        east: [1, 0],
        center: [0, 0]

    };

    function resolveGravity(name) {
        name = name.split('-').join();
        return gravityDefs[name];
    }

    var themesByName = {};


    var offsetSwitch = [0, 0];
    var offsetKey = "0:0";
    var tipDisplayData = null;

    var activated = false; // to display after delay

    var lastSourceDataShown;
    var lastFormatFuncShown;

    var defaultTarget = null;
    var defaultHoldDuration = 0;
    var defaultFadeInDuration = 0;
    var defaultFadeOutDuration = 500;
    var defaultThemeName = 'kodama';
    var defaultGravityDirection = 'top';
    var defaultByDirection = 'top';
                        //resolveGravity removes '-' from user input, ex: 'lower-right' --> 'lowerright'
    var defaultGravity = resolveGravity(defaultGravityDirection);
    var defaultBy = resolveGravity(defaultByDirection);
    var defaultDistance = 25;

    var defaultTheme = themesByName[defaultThemeName] = {
        frame: {
            padding: '4px',
            background: 'linear-gradient(to top, rgb(16, 74, 105) 0%, rgb(14, 96, 125) 90%)',
            'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
            'border': '1px solid rgb(57, 208, 204)',
            color: 'rgb(245,240,220)',
            'border-radius': '4px',
            'font-size': '12px',
            'box-shadow': '0px 1px 3px rgba(0,20,40,.5)'
        },
        title: {'text-align': 'center', 'padding': '4px'},
        item_title: {'text-align': 'right', 'color': 'rgb(220,200,120)'},
        item_value: {'padding': '1px 2px 1px 10px', 'color': 'rgb(234, 224, 184)'}
    };

    //lets you pass an object with multiple styles to d3 using .call()
    var multiStyles = function (styles) {
      return function(selection) {
        for (var property in styles) {
          selection.style(property, styles[property]);
        }
      };
    }

    kodama.init = function(node){

        bodyNode = node || document.body;

        if(baseSel)
            baseSel.remove();

        // handles activity, delay into being transitions
        baseSel = d3.select(bodyNode)
            .append('div')
            .style('position', 'absolute')
            .style('left', 0)
            .style('top', 0)
            .style('visibility', 'hidden')
            .style('pointer-events', 'none')
            .attr('class','kodama-tooltip')
            .attr('name', 'kodama');

        // handles mouse position placement and fade out transitions
        tipSel = baseSel
            .append('div')
            .attr('name', 'kodamaTip')
            .call(multiStyles({'position': 'relative', 'pointer-events': 'none', 'z-index': 9999}))
            .style('opacity', 0);

        // handles screen gravity offset placement and transitions
        holderSel = tipSel.append('div').style('position', 'relative');

    };

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', function(){ kodama.init(); });
    } else {
        kodama.init();
    }

    kodama.holdDuration = function(duration){
        if(arguments.length === 0) return defaultHoldDuration;
        defaultHoldDuration = duration;
        return kodama;
    };

    kodama.fadeInDuration = function(duration){
        if(arguments.length === 0) return defaultFadeInDuration;
        defaultFadeInDuration = duration;
        return kodama;
    };

    kodama.fadeOutDuration = function(duration){
        if(arguments.length === 0) return defaultFadeOutDuration;
        defaultFadeOutDuration = duration;
        return kodama;
    };

    kodama.distance = function(distance){
        if(arguments.length === 0) return defaultDistance;
        defaultDistance = distance || 25;
        return kodama;
    };

    kodama.gravity = function(direction){
        if(arguments.length === 0) return defaultGravityDirection;
        defaultGravityDirection = direction || 'top';
        defaultGravity = resolveGravity(defaultGravityDirection);
        return kodama;
    };

    kodama.theme = function(name){
        if(arguments.length === 0) return defaultThemeName;
        defaultThemeName = name;
        defaultTheme = themesByName[defaultThemeName];
        return kodama;
    };

    kodama.themeRegistry = function(name, config){
        if(arguments.length === 1) return themesByName[name];
        themesByName[name] = config;
        return kodama;
    };

    kodama.themeRegistry('white_wolf', {
        frame: {
            padding: '5px',
            background: 'linear-gradient(to top, rgba(220, 230, 240, .6) 0%, rgba(235, 240, 245, .9) 90%, rgba(230, 235, 240, .8) 100%)',
            'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
            'border': '1px solid rgb(220, 230, 250)',
            'border-radius': '6px',
            'font-size': '14px',

            'box-shadow': '0px 1px 3px rgba(0,20,70,.5)'
        },
        title: {'text-align': 'center', 'padding': '4px', color: 'rgb(115,130,140)', 'font-size': '15px','text-shadow': '0 -1px 0 rgba(255,255,255,.5)'},
        item_title: {'text-align': 'right', 'color': 'rgb(80,100,110)','font-size': '14px','text-shadow': '0 -1px 0 rgba(255,255,255,.5)'},
        item_value: {'padding': '1px 2px 1px 10px', 'color': 'rgb(90, 95, 85)','font-size': '14px','text-shadow': '0 -1px 0 rgba(255,255,255,.5)'}
    });


    // returns a function/object with a config api and accepting a d3 selection to wire handlers
    kodama.tooltip = function() {

        var _offsets = {};
        var _options = undefined;
        var _sourceKey = undefined;
        var _sourceData = undefined;
        var _formatFunc = null;
        var _distance = defaultDistance;
        //user input gravity direction
        var _gravityDirection = defaultGravityDirection;
        //resolved gravity direction
        var _gravity = defaultGravity;
        var _byDirection = defaultByDirection;
        var _by = defaultBy;
        var _theme = defaultTheme;
        var _holdDuration = defaultHoldDuration;
        var _fadeInDuration = defaultFadeInDuration;
        var _fadeOutDuration = defaultFadeOutDuration;
        var _target = defaultTarget;

        var attrs = {};
        var styles = {};

        var _tooltip = function _tooltip(selection) {

            selection
                .on('mouseover.tooltip', function (d, i) {
                    _tooltip.show(d, i);
                })
                .on('mousedown.tooltip', function () {
                    _tooltip.show(null)
                })
                .on('mouseup.tooltip', function () {
                    _tooltip.show(null)
                })
                .on('mousemove.tooltip', function () {
                    _tooltip._update();
                })
                .on('mouseout.tooltip', function () {
                    _tooltip.show(null)
                });

        };

        _tooltip._build = function _build() {

          //at this point _tooltip.show has been activated... so the tooltip is redrawn on any mouse event on an element
            if (!tipDisplayData) {
                _tooltip.fadeOut();
                return;
            } else {
                _tooltip.activateAfter(_holdDuration);
            }

            holderSel.selectAll('*').remove();

            holderSel
                .append('div')
                // .attr(attrs)
                .call(multiStyles(_theme.frame))
                .datum(tipDisplayData)
                .each(function (d) {

                    var sel = d3.select(this);

                    if (d.title) {
                        sel
                            .append('div')
                            .call(multiStyles(_theme.title))
                            .append('span')
                            .html(d.title);
                    }

                    if (d.items) {

                        var tbody = sel.append('table').append('tbody');

                        tbody.selectAll('tr').data(d.items)
                            .enter()
                            .append('tr')
                            .each(function (item) {

                                var tr = d3.select(this);
                                var titleCell = tr.append('td');
                                var valueCell = tr.append('td');
                                titleCell.html(item.title + ':').style(_theme.item_title);
                                valueCell.html(item.value).style(_theme.item_value);

                            });

                    }

                });

            var xOff = holderSel.node().clientWidth / 2;
            var yOff = holderSel.node().clientHeight / 2;

            /*if there's a new offset, reposition tooltip by resetting _offsets...
            when _tooltip._update(true) is called it sets justRebuilt to true, which
            activates repositioning */
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var k = i + ":" + j;
                    _offsets[k] = {left: i * (xOff + _distance) + 'px', top: j * (yOff + _distance) + 'px'};
                }
            }

            _tooltip._update(true);

        };

        _tooltip._update = function _update(justRebuilt) {

            if (!tipDisplayData) return;

            function getTargetPos(target, by){
                if(!target) return d3.mouse(bodyNode);
                var bounds = target.getBoundingClientRect();
                var xOff = bounds.width / 2;
                var yOff = bounds.height / 2;
                return [bounds.left + (by[0] + 1) * xOff, bounds.top + (by[1] + 1) * yOff];
            }

            //var bounds = _target ? _target.getBoundingClientRect() : null;
            var pos = getTargetPos(_target, _by); //bounds ? [bounds.left, bounds.top] : d3.mouse(bodyNode);

            var x = pos[0];
            var y = pos[1];

            var bw = bodyNode.clientWidth;
            var bh = bodyNode.clientHeight;

            var tw = tipSel.node().clientWidth;
            var th = tipSel.node().clientHeight;

            var bestKey = null;
            var bestDiff = 5;

            var xkMax = (x > bw - tw) ? -1 : (x > bw - tw - _distance * 2 ? 0 : 1);
            var ykMax = (y > bh - th) ? -1 : (y > bh - th - _distance * 2 ? 0 : 1);
            var xkMin = (x < tw) ? 1 : (x < tw + _distance * 2 ? 0 : -1);
            var ykMin = (y < th) ? 1 : (y < th + _distance * 2 ? 0 : -1);

            for(var xk = xkMin; xk <= xkMax; xk++){
                for(var yk = ykMin; yk <= ykMax; yk++){
                    if(xk === 0 && yk === 0 && _gravity[0] !== 0 && _gravity[1] !== 0) continue; // skip center unless specified
                    var diff = Math.abs(xk - _gravity[0]) + Math.abs(yk - _gravity[1]);
                    if(diff < bestDiff) {
                        bestKey = [xk, yk];
                        bestDiff = diff;
                    }
                }
            }

            bestKey = bestKey || [0, 0];

            var left = x - tw / 2;
            var top = y - th / 2;

            tipSel.call(multiStyles({
                left: left + 'px',
                top: top + 'px'
            }))

            var k = bestKey[0] + ':' + bestKey[1];

            var moved = Math.max(Math.abs(offsetSwitch[0] - x), Math.abs(offsetSwitch[1] - y));

            //delayed reposition of tooltip if new offset
            if (justRebuilt || (k !== offsetKey && moved > _distance)) {

                offsetKey = k;
                offsetSwitch = pos;

                var offsetStyle = _offsets[k];

                holderSel
                    .transition().ease(d3.easeCubicOut).duration(250)
                    .call(multiStyles(offsetStyle));
            }
        };

        // deprecated
        _tooltip.attr = function (_x) {
            if (!arguments.length) return attrs;
            attrs = _x;
            return this;
        };

        // deprecated
        _tooltip.style = _tooltip.css = function (_x) {
            if (!arguments.length) return styles;
            styles = _x;
            return this;
        };



        _tooltip.fadeIn = function(){

            if(fadingState === 'in') {
                return;
            }

            fadingState = 'in';
            var progress = tipSel.style('opacity') / 1.0;
            var duration = (1.0 - progress) * _fadeInDuration;
            tipSel.interrupt().transition().duration(duration).style('opacity', 1);

        };

        _tooltip.fadeOut = function(){

            if(fadingState === 'out') {
                return;
            }

            fadingState = 'out';
            var progress = tipSel.style('opacity') / 1.0;
            var duration = progress * _fadeOutDuration;
            tipSel.transition().delay(50).duration(duration).style('opacity', 0);

        };

        _tooltip.activate = function(){

            activated = true;
            _tooltip.fadeIn();

        };

        _tooltip.deactivate = function(){

            lastSourceDataShown = null;
            activated = false;
            _tooltip.fadeOut();

        };

        _tooltip.activateAfter = function(){

            baseSel.interrupt().transition();

            if(!activated) {

                baseSel.transition()
                    .delay(_holdDuration)
                    .duration(0)
                    .on('start', _tooltip.activate)
                    .style('visibility','visible');

            } else {
                _tooltip.fadeIn();
            }

        };

        _tooltip.theme = function(name){
            if(arguments.length === 0) return _theme;
            _theme = themesByName[name];
            return this;
        };

        _tooltip.target = function(target){
            if(arguments.length === 0) return _target;
            var node = target;
            while(node && node.length > 0){
                node = node[0];
            }
            _target = node;
            return this;
        };

        _tooltip.holdDuration = function(duration){
            if(arguments.length === 0) return _holdDuration;
            _holdDuration = duration;
            return this;
        };

        _tooltip.fadeInDuration = function(duration){
            if(arguments.length === 0) return _fadeInDuration;
            _fadeInDuration = duration;
            return this;
        };

        _tooltip.fadeOutDuration = function(duration){
            if(arguments.length === 0) return _fadeOutDuration;
            _fadeOutDuration = duration;
            return this;
        };

        _tooltip.distance = function (distance) {
            if(arguments.length === 0) return _distance;
            _distance =  distance;
            return this;
        };

        _tooltip.gravity = function (direction) {
            if(arguments.length === 0) return _gravity;
            _gravityDirection = direction;
            _gravity = resolveGravity(_gravityDirection);
            return this;
        };

        _tooltip.by = function (direction) {
            if(arguments.length === 0) return _by;
            _byDirection = direction;
            _by = resolveGravity(_byDirection);
            return this;
        };

        _tooltip.options = function(options) {

            if(arguments.length === 0) return _options;

            if(!options) return this;

            if(options.theme){ // if a theme is specified
                _tooltip.theme(options.theme);
                if(_theme.options){ // apply any options in the theme as defaults if not specified in the options argument
                    for(var prop2 in _theme.options){
                        if(!options.hasOwnProperty(prop2))
                            options[prop2] = _theme.options[prop2];
                    }
                }
            }

            for(var prop in options){
                if(validOptions.indexOf(prop)===-1) continue;
                _tooltip[prop](options[prop]);
            }
            _options = options;
            return this;

        };

        _tooltip.format =  _tooltip.prep = _tooltip.data = function(formatFunc) {
            _formatFunc = formatFunc;
            return this;
        };

        //_tooltip.show is called for all mouse events on each selection (in & out)
        _tooltip.show = function(sourceData, sourceKey){

            _sourceData = sourceData;
            _sourceKey = sourceKey;

            //if new sourceData or new format
            if(_sourceData !== lastSourceDataShown || _formatFunc !== lastFormatFuncShown){

                lastFormatFuncShown = _formatFunc;
                lastSourceDataShown = _sourceData;

                tipDisplayData = (_formatFunc && _sourceData) ? _formatFunc(_sourceData, _sourceKey) : _sourceData;

                _tooltip.options(tipDisplayData);
                _tooltip._build();

            }

            _tooltip._update();

        };

        return _tooltip;

    };

    var selector = typeof jQuery !== 'undefined' && jQuery !== null ? jQuery : null;
    selector = selector || (typeof Zepto !== 'undefined' && Zepto !== null ? Zepto : null);
    if(selector) {
        selector.fn.kodama = $.fn.kodama_tooltip = $.fn.bamboo = $.fn.kodama || function(tooltipData){

            var self = this;
            var els = self.toArray();
            var arr = d3.range(els.length).map(function(){return tooltipData;});
            d3.selectAll(els).data(arr).call(d3.kodama.tooltip());

            return this;

        };
    }
    return kodama;

}));
