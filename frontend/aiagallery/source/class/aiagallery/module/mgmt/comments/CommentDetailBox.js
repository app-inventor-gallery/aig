/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.mgmt.comment.CommentDetailBox",
{
  extend    : qx.ui.container.Composite,
  implement : [qx.ui.form.IModel],
  include   : [qx.ui.form.MModelProperty],
  
  construct : function(data)
  {
    var             layout;
    
    // Call the superclass constructor
    this.base(arguments);

    // Don't let the objects be near its container edges
    this.set(
    {
      marginLeft  : 20,
      marginRight : 20
    });

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
    this.getChildControl("displayName");
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
    visitor :
    {
      check    : "String",
      nullable : false
    },

    text :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyText"
    },
    
    displayName :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyDisplayName"
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
      var             font;

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

      case "displayName":
        // The displayName should be displayed android green
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.set(
          {
            color      : "#75940c",     // android-green-dark
            decoration : "underline"
          });
        control = new qx.ui.basic.Label();
        control.set(
          {
            textColor : null,       // don't let it override font's color
            font      : font,
            cursor    : "pointer"
          });

        // Visitor clicks initiate a search for apps of that owner
        control.addListener(
          "click",
          function(e)
          {
            // Prevent the default 'click' behavior
            e.preventDefault();
            e.stop();

            // Initiate a search
            alert("Future: initiate search for visitor " +
                  this.getDisplayName() + " (" + this.getVisitor() + ")");
          },
          this);

        this._add(control, { row : 1, column : 1 });
        break;
        
      case "timestamp":
        control = new qx.ui.basic.Label();
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
    _applyDisplayName : function(value, old)
    {
      this.getChildControl("displayName").setValue(value);
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