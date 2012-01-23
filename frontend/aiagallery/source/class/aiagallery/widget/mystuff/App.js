/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.App",
{
  extend : collapsablepanel.Panel,

  construct : function()
  {
    // Don't pass label to superclass constructor. It's unused here.
    this.base(arguments);
  },
  
  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
      case "bar":
        control = new aiagallery.widget.mystuff.Summary();
        control.addListener("click", this.toggleValue, this);
        this._add(control, {flex : 1});
        break;

      case "container":
        control = new aiagallery.widget.mystuff.Detail();
        this._add(control, {flex : 1});
        break;
      }

      return control || this.base(arguments, id);
    }
  }
});
