/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.dgallery.appinfo.Comment",
{
  extend    : qx.ui.container.Composite,
  implement : [qx.ui.form.IModel],
  include   : [qx.ui.form.MModelProperty],
  
  construct : function(data)
  {
    var             layout;
    
    // Call the superclass constructor
    this.base(arguments);

    layout = new qx.ui.layout.Grid(6, 0);
    layout.setRowFlex(0, 1);    // comment text takes up space as needed
    layout.setColumnWidth(0, 40);
    layout.setColumnFlex(2, 1);
    layout.setColumnAlign(0, "right", "middle");
    layout.setRowAlign(0, "left", "bottom");
    layout.setRowAlign(1, "left", "top");
    this.setLayout(layout);
    
    // Specify the format of date output
    this.dateFormat = aiagallery.Application.getDateFormat();
    
    // Create each of the child controls
    this.getChildControl("text");
    this.getChildControl("pointer");
    this.getChildControl("author");
    this.getChildControl("timestamp");
    this.getChildControl("spacer");
    
    // If we were given the initial data to display...
    if (data)
    {
      // ... then display it now
      this.set(data);
    }
  },

  properties :
  {
    text :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyText"
    },
    
    author :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyAuthor"
    },
    
    timestamp :
    {
      nullable  : false,
      transform : "_transformTimestamp",
      apply     : "_applyTimestamp"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;

      switch(id)
      {
      case "text":
        control = new qx.ui.form.TextArea("hello world");
        control.set(
          {
//            appearance        : "widget",
            decorator         : "app-comment",
            readOnly          : true,
            wrap              : true,
            anonymous         : true,
            autoSize          : true,
            minimalLineHeight : 1
          });
        this._add(control, { row : 0, column : 0, colSpan : 3 });
        break;
        
      case "pointer":
        control = new qx.ui.basic.Image("aiagallery/comment-pointer.png");
        this._add(control, { row : 1, column : 0 });
        break;

      case "author":
        control = new qx.ui.basic.Label("Derrell Lipman");
        this._add(control, { row : 1, column : 1 });
        break;
        
      case "timestamp":
        control = new qx.ui.basic.Label("some time stamp");
        this._add(control, { row : 1, column : 2 });
        break;
        
      case "spacer":
        control = new qx.ui.core.Spacer(10, 10);
        this.add(control, { row : 2, column : 0 });
        break;
      }

      return control || this.base(arguments, id);
    },

    // Property apply.
    _applyText : function(value, old)
    {
      this.getChildControl("text").setValue(value);
    },

    // Property apply.
    _applyAuthor : function(value, old)
    {
      this.getChildControl("author").setValue(value);
    },

    // Property apply.
    _applyTimestamp : function(value, old)
    {
      this.getChildControl("timestamp").setValue(value);
    },

    // Property transform. Convert from numeric timestamp to formatted string
    _transformTimestamp : function(value)
    {
      return(this.dateFormat.format(new Date(Number(value))));      
    }
  }
});
