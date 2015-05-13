
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

    var offsets = {};
    var offsetSwitch = [0, 0];
    var offsetKey = "0:0";
    var dispTipData = null;
    var rawTipData = null;
    var lastPrep = null;

    // returns a function/object with a config api and accepting a d3 selection to wire handlers
    kodama.tooltip = function() {


        var _prep = function (d) { return d; }; // identity function default

        var attrs = {};
        var styles = {};

        var shift = 25;


        var _buildMethod = function build(tipData) {


            if (!tipData) return;

            holderSel.selectAll('*').remove();

            holderSel
                .attr(attrs)
                .style(styles)
                .datum(tipData)
                .each(function (d) {

                    var sel = d3.select(this);

                    if (d.title) {
                        sel
                            .append('div')

                            .style({'text-align': 'center', 'padding': '4px'})
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
                                titleCell.html(item.title + ':').style({
                                    'text-align': 'right',
                                    'color': 'rgb(220,200,120)'
                                });
                                valueCell.html(item.value).style({
                                    'padding': '1px 2px 1px 10px',
                                    'color': 'rgb(234, 224, 184)'
                                });
                            });

                    }

                });

            var xOff = holderSel.node().clientWidth / 2;
            var yOff = holderSel.node().clientHeight / 2;

            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var k = i + ":" + j;
                    offsets[k] = {left: i * (xOff + shift) + 'px', top: j * (yOff + shift) + 'px'};
                }
            }

            _updateMethod(true);

        };

        var _updateMethod = function update(justRebuilt) {

            if (!dispTipData) return;

            var pos = d3.mouse(bodyNode);

            var x = pos[0];
            var y = pos[1];

            var bw = bodyNode.clientWidth;
            var bh = bodyNode.clientHeight;

            var tw = tipSel.node().clientWidth;
            var th = tipSel.node().clientHeight;

            var xk = (x < tw * .5 + shift) ? 1 : ((x > bw - tw * .5 - shift) ? -1 : 0);
            var yk = (y < th * .5 + shift) ? 1 : ((y > bh - th * .5 - shift) ? -1 : 0);

            if (xk === 0 && yk === 0)
                yk = -1;

            var left = x - tw / 2;
            var top = y - th / 2;

            tipSel.interrupt().transition();

            tipSel.style({
                left: left + 'px',
                top: top + 'px',
                opacity: 1
            });

            if(justRebuilt){
                //baseSel.interrupt().transition();
                //baseSel.style('visibility','hidden').transition().delay(300).style('visibility','visible');
            }

            var k = xk + ":" + yk;
            var moved = Math.max(Math.abs(offsetSwitch[0] - x), Math.abs(offsetSwitch[1] - y));

            if (justRebuilt || (k !== offsetKey && moved > shift * 2)) {

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
                    rawTipData = null;
                    tipSel.transition().duration(500).style('opacity', 0);

                })
                .on('mouseup.tooltip', function () {

                    rawTipData = null;
                    tipSel.transition().duration(500).style('opacity', 0);

                })
                .on('mousemove.tooltip', function () {
                    _updateMethod();

                })
                .on('mouseout.tooltip', function () {
                    rawTipData = null;
                    tipSel.transition().duration(500).style('opacity', 0);

                });

        };

        _tooltip.attr = function (_x) {
            if (!arguments.length) return attrs;
            attrs = _x;
            return this;
        };

        _tooltip.style = _tooltip.css = function (_x) {
            if (!arguments.length) return styles;
            styles = _x;
            return this;
        };

        _tooltip.prep = _tooltip.data = function (prepDataFunction) {
            if (!arguments.length) return _prep;
            _prep = d3.functor(prepDataFunction);
            return this;
        };

        _tooltip.show = function (d, i) {

            // format and build if base data or prep function has changed
            if(d !== rawTipData || _prep !== lastPrep) {

                lastPrep = _prep;
                rawTipData = d;
                dispTipData = _prep(rawTipData, i);
                _buildMethod(dispTipData);

            }

            _updateMethod();

        };


        return _tooltip;

    };

    return kodama;

}));

$.fn.kodama = $.fn.bamboo = $.fn.kodama || function(tooltipData){

    var self = this;
    d3.selectAll(self.toArray())
        .call(d3.kodama.tooltip()
            .attr({class: 'katana_tooltip'})
            .data(function(){ return tooltipData;}));
    return this;

};




