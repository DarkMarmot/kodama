/**
 * kodama.js (v1.0.3)
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
    var validOptions = ['gravity','theme','distance','style'];

    var bodyNode = d3.select('body').node();

    // handles activity, delay into being transitions
    var baseSel = d3.select(bodyNode)
        .append('div')
        .style('position', 'absolute')
        .style('left', 0)
        .style('top', 0)
        .attr('name', 'kodama');

    // handles mouse position placement and fade out transitions
    var tipSel = baseSel
        .append('div')
        .attr('name', 'kodamaTip')
        .style({'position': 'relative', 'pointer-events': 'none', 'z-index': 9999})
        .style('opacity', 0);

    // handles screen gravity offset placement and transitions
    var holderSel = tipSel.append('div').style('position', 'relative');


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

    var offsets = {};
    var offsetSwitch = [0, 0];
    var offsetKey = "0:0";
    var tipDisplayData = null;

    var lastSourceDataShown;
    var lastFormatFuncShown;

    var defaultThemeName = 'kodama_small';
    var defaultGravityDirection = 'top';
    var defaultGravity = resolveGravity(defaultGravityDirection);
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
        pane: {},
        title: {'text-align': 'center', 'padding': '4px'},
        item_title: {'text-align': 'right', 'color': 'rgb(220,200,120)'},
        item_value: {'padding': '1px 2px 1px 10px', 'color': 'rgb(234, 224, 184)'}
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

    // returns a function/object with a config api and accepting a d3 selection to wire handlers
    kodama.tooltip = function() {

        var _options = undefined;
        var _sourceKey = undefined;
        var _sourceData = undefined;
        var _formatFunc = null;
        var _distance = defaultDistance;
        var _gravityDirection = defaultGravityDirection;
        var _gravity = defaultGravity;
        var _theme = defaultTheme;

        var attrs = {};
        var styles = {};

        var _buildMethod = function build() {

            if (!tipDisplayData) return;

            holderSel.selectAll('*').remove();

            holderSel
                .attr(attrs)
                .style(_theme.frame)
                .datum(tipDisplayData)
                .each(function (d) {

                    var sel = d3.select(this);

                    if (d.title) {
                        sel
                            .append('div')
                            .style(_theme.title)
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

            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var k = i + ":" + j;
                    offsets[k] = {left: i * (xOff + _distance) + 'px', top: j * (yOff + _distance) + 'px'};
                }
            }

            _updateMethod(true);

        };

        var _updateMethod = function update(justRebuilt) {

            if (!tipDisplayData) return;

            var pos = d3.mouse(bodyNode);

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
                    if(xk === 0 && yk === 0) continue;
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

            tipSel.interrupt().transition();

            tipSel.style({
                left: left + 'px',
                top: top + 'px',
                opacity: 1
            });

            var k = bestKey[0] + ':' + bestKey[1];

            var moved = Math.max(Math.abs(offsetSwitch[0] - x), Math.abs(offsetSwitch[1] - y));

            if (justRebuilt || (k !== offsetKey && moved > _distance)) {

                offsetKey = k;
                offsetSwitch = pos;

                var offsetStyle = offsets[k];

                holderSel
                    .transition().ease('cubic-out').duration(250)
                    .style(offsetStyle);
            }
        };


        var _tooltip = function _tooltip(selection) {

            selection
                .on('mouseover.tooltip', function (d, i) {

                    _tooltip.show(d, i);

                })
                .on('mousedown.tooltip', function () {
                    lastSourceDataShown = null;
                    tipSel.transition().duration(500).style('opacity', 0);

                })
                .on('mouseup.tooltip', function () {

                    lastSourceDataShown = null;
                    tipSel.transition().duration(500).style('opacity', 0);

                })
                .on('mousemove.tooltip', function () {
                    _updateMethod();

                })
                .on('mouseout.tooltip', function () {
                    lastSourceDataShown = null;
                    tipSel.transition().duration(500).style('opacity', 0);

                });

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

        _tooltip.distance = function (distance) {
            _distance = distance || 25;
            return this;
        };

        _tooltip.gravity = function (direction) {
            _gravityDirection = direction || defaultGravityDirection;
            _gravity = resolveGravity(_gravityDirection);
            return this;
        };

        //_tooltip.source = function (sourceData) {
        //    _sourceData = d3.functor(sourceData);
        //    return this;
        //};

        _tooltip.options = function(options) {

            if(arguments.length === 0) return _options;
            if(typeof options !== 'object') return this;

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

        _tooltip.show = function(sourceData, sourceKey){

            _sourceData = sourceData;
            _sourceKey = sourceKey;

            if(_sourceData !== lastSourceDataShown || _formatFunc !== lastFormatFuncShown){

                lastFormatFuncShown = _formatFunc;
                lastSourceDataShown = _sourceData;

                tipDisplayData = _formatFunc ? _formatFunc(_sourceData, _sourceKey) : _sourceData;
                _tooltip.options(tipDisplayData);
                _buildMethod();

            }

            _updateMethod();

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
