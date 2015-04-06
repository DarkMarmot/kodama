
d3.kodama = d3.kodama || {};

d3.kodama.tooltip = function(){

    var state = d3.kodama;
    var bodyNode = state._bodyNode = state._bodyNode || d3.select('body').node();
    var tipSel = state._tipNode = state._tipNode ||
    d3.select(bodyNode)
        .append('div')
        .style('position','absolute')
        .style('left', 0)
        .style('top', 0)
        .attr('name','kodama')
        .append('div')
        .attr('name','kodamaTip')
        .style({'position':'relative','pointer-events':'none', 'z-index': 9999})
        .style('opacity',0);

    var holderSel = state._holderNode = state._holderNode ||
    tipSel.append('div').style('position','relative');

    var offsets = state._offsets = state._offsets || {};
    var offsetSwitch = state._offsetSwitch = state._offsetSwitch || [0,0];
    var offsetKey = state._offsetKey = state._offsetKey || "0:0";

    var _prep = function(d,i){ return d;};

    var currTipData = state._currTipData = state._currTipData || {};

    var attrs = {};
    var styles = {};

    var shift = 25;

    function tooltip(selection){


        function build(tipData){


            holderSel.selectAll('*').remove();

            holderSel
                .attr(attrs)
                .style(styles)
                .datum(tipData)
                .each(function(d){

                    var sel = d3.select(this);

                    if(d.title){
                        sel
                            .append('div')

                            .style({'text-align':'center','padding':'4px'})
                            .append('span')
                            .html(d.title);
                    }

                    if(d.items) {

                        var tbody = sel.append('table').append('tbody');

                        tbody.selectAll('tr').data(d.items)
                            .enter()
                            .append('tr')
                            .each(function (item) {

                                var tr = d3.select(this);
                                var titleCell = tr.append('td');
                                var valueCell = tr.append('td');
                                titleCell.html(item.title + ':').style({'text-align': 'right', 'color': 'rgb(220,200,120)'});
                                valueCell.html(item.value).style({'padding': '1px 2px 1px 10px', 'color': 'rgb(234, 224, 184)'});
                            });

                    }

                });

            var xOff = holderSel.node().clientWidth / 2;
            var yOff = holderSel.node().clientHeight / 2;

            for(var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var k = i + ":" + j;
                    offsets[k] = {left: i * (xOff + shift) + 'px',top: j * (yOff + shift) + 'px'};
                }
            }

            update(true);

        }

        function update(justRebuilt){

            //if(!currTipData) return;

            var pos = d3.mouse(bodyNode);

            var x = pos[0];
            var y = pos[1];

            var bw = bodyNode.clientWidth;
            var bh = bodyNode.clientHeight;

            var tw = tipSel.node().clientWidth;
            var th = tipSel.node().clientHeight;

            var xk = (x < tw *.5 + shift) ? 1 : ((x > bw - tw *.5 - shift) ? -1 : 0);
            var yk = (y < th *.5 + shift) ? 1 : ((y > bh - th *.5 - shift) ? -1 : 0);

            if (xk === 0 && yk === 0)
                yk = -1;

            var left = x - tw / 2;
            var top = y  - th / 2;

            tipSel.transition().duration(1).style('opacity',1).style({
                left: left + 'px',
                top: top + 'px'
            });

            var k = xk + ":" + yk;
            var moved = Math.max(Math.abs(offsetSwitch[0] - x),Math.abs(offsetSwitch[1] - y));

            if(justRebuilt || (k !== offsetKey && moved > shift * 2)){

                offsetKey = k;
                offsetSwitch = pos;

                var offsetStyle = offsets[k];

                holderSel
                    .transition().ease('cubic-out').duration(250)
                    .style(offsetStyle);

            }
        }



        selection
            .on('mouseover.tooltip', function(d, i) {

                var tipData = _prep(d);
                if(tipData && tipData !== currTipData)
                    build(tipData);

                currTipData = tipData;

                update();
                //console.log("****OVERRR");
            })
            .on('mousedown.tooltip', function(){
                currTipData = {};
                tipSel.transition().duration(500).style('opacity', 0);
                //console.log('***DOWN!');
            })
            .on('mouseup.tooltip', function(){

                currTipData = {};
                tipSel.transition().duration(500).style('opacity', 0);

                //console.log('***UP!');
            })
            .on('mousemove.tooltip', function(){
                update();
                //console.log('***MOVE!');
            })
            .on('mouseout.tooltip', function(){
                currTipData = {};
                tipSel.transition().duration(500).style('opacity', 0);
                //console.log('***OUT!');
            });

    }


    tooltip.attr = function(_x){
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = tooltip.css = function(_x){
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    tooltip.data = tooltip.prep = function(data){
        if (!arguments.length) return _prep;
        _prep = d3.functor(data);
        return this;
    };

    return tooltip;
};

$.fn.kodama = $.fn.kodama || function(tooltipData){

    var self = this;
    d3.selectAll(self.toArray())
        .call(d3.kodama.tooltip()
            .attr({class: 'katana_tooltip'})
            .data(function(){ return tooltipData;}));
    return this;

};




