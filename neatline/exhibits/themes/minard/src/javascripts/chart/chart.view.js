
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
     *
     * @param {Object} options
     */
    initialize: function(options) {

      this.slug = options.slug;
      this.records = options.records;

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
      this.height = 300 - this.margin.top - this.margin.bottom;

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
          return self.xScale(d.date);
        })
        .y(function(d) {
          return self.yScale(d.troops);
        });

      // ISO8601 parser.
      var parseDate = d3.time.format('%Y-%m-%d').parse;

      // Parse the dates.
      this.data = _.map(Chart.data, function(d) {
        d.date = parseDate(d.date);
        return d;
      });

      // X-axis bounds.
      this.xScale.domain(d3.extent(this.data, function(d) {
        return d.date;
      }));

      // Y-axis bounds.
      this.yScale.domain(d3.extent(this.data, function(d) {
        return d.troops;
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
      this.circle = this.focus.append('circle')
        .attr('r', 4);

      this.xLine = this.svg.append('line')
        .attr('class', 'cursor')
        .style('display', 'none')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', this.height);

      this.yLine = this.svg.append('line')
        .attr('class', 'cursor')
        .style('display', 'none')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', this.width)
        .attr('y2', 0);

      // Cursor events target.
      this.rect = this.svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', this.width)
        .attr('height', this.height);

      // Show on hover.
      this.rect.on('mouseover', function() {
        self.showFocus();
      });

      // Hide on blur.
      this.rect.on('mouseout', function() {
        self.hideFocus();
        Neatline.execute('EVENTS:unhighlightCurrent');
      });

      // Bisect on the X-axis.
      var bisect = d3.bisector(function(d) {
        return d.date;
      });

      // Get the nearest data point.
      var getNearest = function() {
        var x0 = self.xScale.invert(d3.mouse(this)[0]);
        var i = bisect.left(self.data, x0, 1);
        var d0 = self.data[i-1];
        var d1 = self.data[i];
        return x0 - d0.date > d1.date - x0 ? d1 : d0;
      };

      // Hover.
      this.rect.on('mousemove', function() {

        // Set the focus.
        var d = getNearest.call(this);
        self.setFocus(d);

        // Highlight the record.
        self.publish('highlight', d.slug);

      });

      // Click.
      this.rect.on('click', function() {
        var d = getNearest.call(this);
        self.publish('select', d.slug);
      });

    },


    /**
     * Display the focus container.
     */
    showFocus: function() {
      this.focus.style('display', null);
      this.xLine.style('display', null);
      this.yLine.style('display', null);
    },


    /**
     * Hide the focus container.
     */
    hideFocus: function() {
      this.focus.style('display', 'none');
      this.xLine.style('display', 'none');
      this.yLine.style('display', 'none');
    },


    /**
     * Set the position of the focus dot/line.
     *
     * @param {Object} d
     */
    setFocus: function(d) {

      // Get the coordinates.
      var x = this.xScale(d.date);
      var y = this.yScale(d.troops);

      // Render the dot.
      this.focus.attr('transform', 'translate('+x+','+y+')');
      this.xLine.attr('transform', 'translate('+x+',0)');
      this.yLine.attr('transform', 'translate(0,'+y+')');

    },


    /**
     * Construct axes and time-series line.
     *
     * @param {String} event
     * @param {String} slug
     */
    publish: function(event, slug) {

      // Pop out the record.
      var record = this.records.findWhere({ slug: slug });
      if (!record) return;

      // Publish the event.
      Neatline.vent.trigger(event, {
        model: record, source: this.slug
      });

    }


  });


});
