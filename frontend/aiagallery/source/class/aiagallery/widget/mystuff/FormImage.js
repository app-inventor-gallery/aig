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

  construct : function(label)
  {
    var             layout;

    // Save the label. The button child control will need it
    this.label = label;

    layout = new qx.ui.layout.VBox(10);
    this.base(arguments, layout);
    
    // Create the child controls
    this.getChildControl("button");
    this.getChildControl("image");
    
    // Listen for changes to the 'required' property
    this.addListener("changeRequired", this._onChangeRequired);
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
    "changeValue" : "qx.event.type.Data",
    
    /** Fired when a filename selection is made */
    "changeFileName" : "qx.event.type.Data"
  },

  members :
  {
    // property apply function
    _applyValue : function(value, old)
    {
      this.getChildControl("image").setSource(value);
    },

    /** Called when the 'required' property changes value */
    _onChangeRequired : function(e)
    {
      var required;
        
      // Determine the string to append. (None, if not required)
      required = (e.getData() ? " <span style='color:red'>*</span> " : "");

      // Change the label to add or remove the red asterisk
      this.getChildControl("button").setLabel(this.label + required);
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;

      switch(id)
      {
      case "button":
        // Select image
        control = new uploadwidget.UploadButton("image1", "Select image");
        control.setRich(true);
        this._add(control);
        
        // When this button gets a changeFileName event, pass it along
        control.addListener(
          "changeFileName",
          function(e)
          {
            this.fireDataEvent(e.getData());
          },
          this);
        break;

      case "image":
        control = new qx.ui.basic.Image();
        control.set(
          {
            scale : true
          });
        this._add(control, { flex : 1 });
        break;
      }

      return control || this.base(arguments, id);
    }
  }
});
