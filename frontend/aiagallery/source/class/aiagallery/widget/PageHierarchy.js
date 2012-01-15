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
      var             stripEphemeral = [];
      
      // Scan each element of the hierarchy and strip off the '-' at the
      // beginning of any ephemeral entry.
      value.forEach(
        function(name)
        {
          stripEphemeral.push(name.charAt(0) == "-" 
                              ? name.substring(1)
                              : name);
        });
      
      // Now join the names together to meaningfully display the hierarchy
      this.setValue("&raquo; " + stripEphemeral.join(" &raquo; "));
    }
  }
});
