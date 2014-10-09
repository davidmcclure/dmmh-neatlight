
/**
 * @package     omeka
 * @subpackage  neatline-NeatLight
 * @copyright   2014 Rector and Board of Visitors, University of Virginia
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

Neatline.module('Chart', function(Chart) {


  Chart.Controller = Neatline.Shared.Controller.extend({


    slug: 'CHART',


    /**
     * Create the view.
     */
    init: function() {
      this.view = new Neatline.Chart.View();
    }


  });


});
