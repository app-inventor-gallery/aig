/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.FormImage",
{
  extend    : qx.ui.container.Composite,
  implement :
  [
    qx.ui.form.IForm,
    qx.ui.form.IStringForm
  ],
  include   : 
  [
    qx.ui.form.MForm
  ],

  construct : function()
  {
    var             layout;

    layout = new qx.ui.layout.Canvas();
    this.base(arguments, layout);
    
    // Create the child control
    this.getChildControl("image");
  },

  properties :
  {
    appearance :
    {
      refine   : true,
      init     : "formimage"
    },

    value :
    {
      check    : "String",
      apply    : "_applyValue",
      nullable : false,
      init     : null,
      event    : "changeValue"
    }
  },

  events :
  {
    /** Fired when the value was modified */
    "changeValue" : "qx.event.type.Data"
  },

  members :
  {
    // property apply function
    _applyValue : function(value, old)
    {
      this.getChildControl("image").setSource(value);
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;

      switch(id)
      {
      case "image":
        control = new qx.ui.basic.Image();
        control.set(
          {
            scale : true
          });
        this._add(control, { edge : 2 });
        break;
      }

      return control || this.base(arguments, id);
    }
  }
});
