/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.PageHierarchy",
{
  extend : qx.ui.basic.Label,

  construct : function(value)
  {
    this.base(arguments);

    // Set default properties for the page hierarchy widget
    this.set(
      {
        height : 20,
        alignY : "bottom",
        rich   : true
      });
    
    // Set the initial value, if specified
    if (value)
    {
      this.setHierarchy(value);
    }
    else
    {
      this.setHierarchy([]);
    }
  },
  
  properties :
  {
    hierarchy :
    {
      check  : "Array",
      apply  : "_applyHierarchy"
    }
  },

  members :
  {
    _applyHierarchy : function(value, old)
    {
      this.setValue("&raquo; " + value.join(" &raquo; "));
    }
  }
});
