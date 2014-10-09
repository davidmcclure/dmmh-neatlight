
/**
 * @package     omeka
 * @subpackage  neatline-NeatLight
 * @copyright   2014 Rector and Board of Visitors, University of Virginia
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

Neatline.module('Chart', function(Chart) {


  Chart.Controller = Neatline.Shared.Controller.extend({


    slug: 'CHART',

    events: [{
      highlight:    'focus',
      select:       'focus',
      unhighlight:  'unfocus',
      unselect:     'unfocus'
    }],


    /**
     * Create the view.
     *
     * @param {Object} records
     */
    init: function(records) {
      this.view = new Neatline.Chart.View({
        slug: this.slug,
        records: records
      });
    },


    /**
     * Set the focus.
     *
     * @param {Object} args
     */
    focus: function(args) {

      var slug = args.model.get('slug');

      // Get the datum, render the focus.
      if (args.source == 'MAP' && slug) {
        var i = Number(slug.slice(1))-1;
        this.view.setFocus(Chart.data[i]);
        this.view.showFocus();
      }

    },


    /**
     * Hide the focus.
     *
     * @param {Object} args
     */
    unfocus: function(args) {
      if (args.source == 'MAP') {
        this.view.hideFocus();
      }
    }


  });


});
