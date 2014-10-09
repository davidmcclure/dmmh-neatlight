
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
     * Build the graph.
     */
    initialize: function() {
      this._initGraph();
      this._initFocus();
    },


    /**
     * Construct axes and time-series line.
     */
    _initGraph: function() {

      var self = this;

      this.margin = {
        top:    20,
        right:  30,
        bottom: 30,
        left:   50
      };

      // Dimensions.
      this.width = 300 - this.margin.left - this.margin.right;
      this.height = 400 - this.margin.top - this.margin.bottom;

      // Vertical/horizontal margins.
      var vMargin = this.margin.top + this.margin.bottom;
      var hMargin = this.margin.right + this.margin.left;

      // Inject the SVG container.
      this.svg = d3.select(this.el)
        .append('svg')
        .attr('width', this.width + hMargin)
        .attr('height', this.height + vMargin)
        .append('g')
        .attr('transform', 'translate('+
          this.margin.left+','+this.margin.top+
        ')');

      // X-axis scale.
      this.xScale = d3.time.scale()
        .range([0, this.width]);

      // Y-axis scale.
      this.yScale = d3.scale.linear()
        .range([this.height, 0]);

      // X-axis.
      this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient('bottom')
        .tickFormat(d3.time.format('%b'));

      // Y-axis.
      this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient('left')
        .tickFormat(function(t) {
          return (t/1000)+'k';
        });

      // Line builder.
      this.line = d3.svg.line()
        .x(function(d) {
          return self.xScale(d[0]);
        })
        .y(function(d) {
          return self.yScale(d[1]);
        });

      // ISO8601 parser.
      var parseDate = d3.time.format('%Y-%m-%d').parse;

      // Parse the dates.
      this.data = _.map(Chart.data, function(d) {
        return [parseDate(d[0]), d[1]];
      });

      // X-axis bounds.
      this.xScale.domain(d3.extent(this.data, function(d) {
        return d[0];
      }));

      // Y-axis bounds.
      this.yScale.domain(d3.extent(this.data, function(d) {
        return d[1];
      }));

      // Render the X-axis.
      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,'+this.height+')')
        .call(this.xAxis)

      // Render the Y-axis.
      this.svg.append('g')
        .attr('class', 'y axis')
        .call(this.yAxis);

      // Render the line.
      this.svg.append('path')
        .datum(this.data)
        .attr('class', 'line')
        .attr('d', this.line);

    },


    /**
     * Construct axes and time-series line.
     */
    _initFocus: function() {

      var self = this;

      // Focus group.
      this.focus = this.svg.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

      // Focus circle.
      this.focus.append('circle')
        .attr('r', 4);

      // Cursor events target.
      this.rect = this.svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', this.width)
        .attr('height', this.height);

      // Show on hover.
      this.rect.on('mouseover', function() {
        self.focus.style('display', null);
      });

      // Hide on blur.
      this.rect.on('mouseout', function() {
        self.focus.style('display', 'none');
      });

      // Bisect on the X-axis.
      var bisect = d3.bisector(function(d) {
        return d[0];
      });

      // Focus.
      this.rect.on('mousemove', function(e) {

        // Get the nearest data point.
        var x0 = self.xScale.invert(d3.mouse(this)[0]);
        var i = bisect.left(self.data, x0, 1);
        var d0 = self.data[i-1];
        var d1 = self.data[i];
        var d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;

        // Get the coordinates.
        var x = self.xScale(d[0]);
        var y = self.yScale(d[1]);

        // Render the focus.
        self.focus.attr('transform', 'translate('+x+','+y+')');

      });

    }


  });


});
