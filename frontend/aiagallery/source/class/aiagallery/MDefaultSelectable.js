/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Change the default value of the 'selectable' property to true, allowing
 * copy/paste from widgets where this has been applied. The most typical
 * use for this is to make qx.ui.basic.Label objects selectable by
 * default.
 */
qx.Mixin.define("aiagallery.MDefaultSelectable",
{
  properties :
  {
    // overridden
    selectable :
    {
      refine : true,
      init   : true
    }
  }
});
