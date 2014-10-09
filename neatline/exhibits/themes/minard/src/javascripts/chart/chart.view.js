
/**
 * @package     omeka
 * @subpackage  neatline-NeatLight
 * @copyright   2014 Rector and Board of Visitors, University of Virginia
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

Neatline.module('Chart', function(Chart) {


  Chart.View = Backbone.View.extend({


    el: '#chart',


    /**
     * Construct the SVG container.
     */
    initialize: function() {

      var margin = {
        top:    20,
        right:  30,
        bottom: 30,
        left:   50
      };

      var w = 300 - margin.left - margin.right;
      var h = 400 - margin.top - margin.bottom;

      // Inject the SVG container.
      this.svg = d3.select(this.el)
        .append('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

      // X-axis scale.
      var x = d3.time.scale()
        .range([0, w]);

      // Y-axis scale.
      var y = d3.scale.linear()
        .range([h, 0]);

      // X-axis.
      var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%b'));

      // Y-axis.
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickFormat(function(t) {
          return (t/1000)+'k';
        });

      // Line builder.
      var line = d3.svg.line()
        .x(function(d) {
          return x(d[0]);
        })
        .y(function(d) {
          return y(d[1]);
        })

      // ISO8601 parser.
      var parseDate = d3.time.format('%Y-%m-%d').parse;

      // Parse the dates.
      var data = _.map(Chart.data, function(d) {
        return [parseDate(d[0]), d[1]];
      });

      // X-axis bounds.
      x.domain(d3.extent(data, function(d) {
        return d[0];
      }));

      // Y-axis bounds.
      y.domain(d3.extent(data, function(d) {
        return d[1];
      }));

      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,'+h+')')
        .call(xAxis)

      this.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      this.svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line);

    }


  });


});
