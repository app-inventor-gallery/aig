/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.dgallery.findapps.SearchResult",
{
  extend    : qx.ui.container.Composite,
  implement : [qx.ui.form.IModel],
  include   : [qx.ui.form.MModelProperty],

  construct : function()
  {
    var             grid;
    
    this.base(arguments);

    // Use a grid layout to display each of the elements of the result
    grid = new qx.ui.layout.Grid(2, 2);
    this.setLayout(grid);
    
    this.getChildControl("image1");
    this.getChildControl("title");
    this.getChildControl("numLikes");
    this.getChildControl("numDownloads");
    this.getChildControl("numViewed");
    this.getChildControl("numComments");
    this.getChildControl("displayName");
    this.getChildControl("description");
    this.getChildControl("creationTime");
    this.getChildControl("uploadTime");
  },
  
  events:
  {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event"
  },

  properties :
  {
    icon :                      // actually image1
    {
      apply    : "_applyImage1",
      nullable : true,
      check    : "String",
      event    : "changeImage1"
    },
    
    label :                     // actually title
    {
      apply    : "_applyTitle",
      nullable : true,
      check    : "String",
      event    : "changeTitle"
    },
    
    numLikes :
    {
      apply    : "_applyNumLikes",
      nullable : true,
      check    : "Number",
      event    : "changeNumLikes"
    },
    
    numDownloads :
    {
      apply    : "_applyNumDownloads",
      nullable : true,
      check    : "Number",
      event    : "changeNumDownloads"
    },
    
    numViewed :
    {
      apply    : "_applyNumViewed",
      nullable : true,
      check    : "Number",
      event    : "changeNumViewed"
    },
    
    numComments :
    {
      apply    : "_applyNumComments",
      nullable : true,
      check    : "Number",
      event    : "changeNumComments"
    },
    
    displayName :
    {
      apply     : "_applyDisplayName",
      nullable  : true,
      check     : "String",
      event     : "changeDisplayName",
      transform : "_transformDisplayName"
    },
    
    description :
    {
      apply    : "_applyDescription",
      nullable : true,
      check    : "String",
      event    : "changeDescription"
    },
    
    creationTime :
    {
      apply     : "_applyCreationTime",
      nullable  : true,
      check     : "String",
      event     : "changeCreationTime",
      transform : "_transformCreationTime"
    },
    
    uploadTime :
    {
      apply     : "_applyUploadTime",
      nullable  : true,
      check     : "String",
      event     : "changeUploadTime",
      transform : "_transformUploadTime"
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
      case "image1":
        control = new qx.ui.basic.Image();
        control.set(
          {
            source    : "aiagallery/aicg.png",
            focusable : false,
            scale     : true,
            minWidth  : 100,
            maxWidth  : 100,
            minHeight : 100,
            maxHeight : 100
          });
        this._add(control, { row : 0, column : 0, rowSpan : 4 });
        break;
        
      case "title":
        font = qx.bom.Font.fromString("10px sans-serif bold");
        font.setDecoration("underline");
        control = new qx.ui.basic.Label();
        control.set(
          {
            value : "title goes here",
            width : 300,
            font  : font
          });
        this._add(control, { row : 0, column : 1 });
        break;
        
      case "numLikes":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            label     : "0",
            icon      : "aiagallery/thumbs-up.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, { row : 0, column : 2, rowSpan : 2 });
        break;
        
      case "numDownloads":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            label     : "0",
            icon      : "aiagallery/thumbs-up.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, { row : 0, column : 3, rowSpan : 2 });
        break;

        
      case "numViewed":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            label     : "0",
            icon      : "aiagallery/thumbs-up.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, { row : 0, column : 4, rowSpan : 2 });
        break;

        
      case "numComments":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            label     : "0",
            icon      : "aiagallery/thumbs-up.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, { row : 0, column : 5, rowSpan : 2 });
        break;

      case "displayName":
        // The displayName should be displayed android green
        font = qx.bom.Font.fromString("10px sans-serif");
        font.setColor("#75940c");   // android-green-dark
        control = new qx.ui.basic.Label();
        control.set(
          {
            value     : "Joe Blow",
            textColor : null,       // don't let it override font's color
            font      : font
          });

        // Owner clicks initiate a search for apps of that owner
        control.addListener(
          "click",
          function(e)
          {
            // Prevent the default 'click' behavior
            e.preventDefault();
            e.stop();

            // Initiate a search
            alert("Future: initiate search for owner " +
                  this.getDisplayName() + " (" + this.getOwner() + ")");
          },
          this);

        this._add(control, { row : 1, column : 1 });
        break;
        
      case "description":
        control = new qx.ui.form.TextArea();
        control.set(
          {
            appearance : "widget",
            value      : "This is a big long description that will take up a couple of rows. I want to see what happens with it. Hopefully it looks really nice and I can continue along this path.",
//            font       : qx.bom.Font.fromString("bold 10px sans-serif"),
            readOnly   : true,
            autoSize   : true,
            wrap       : true,
            anonymous  : true,
            minHeight  : 50,
            maxHeight  : 50
          });
        this._add(control, { row : 2, column : 1, colSpan : 5 });
        break;

      case "creationTime":
        control = new qx.ui.basic.Label();
        control.set(
          {
            value : "Created: 2012/02/09 3:45pm"
          });
        this._add(control, { row : 3, column : 1 });
        break;
        
      case "uploadTime":
        control = new qx.ui.basic.Label();
        control.set(
          {
            value : "Last Updated: 2012/02/09 3:45pm"
          });
        this._add(control, { row : 3, column : 2, colSpan : 4 });
        break;
      }

      return control || this.base(arguments, id);
    },
    
    // property apply function
    _applyImage1 : function(value, old)
    {
      this.getChildControl("image1").setSource(value);
    },
    
    // property apply function
    _applyTitle : function(value, old)
    {
      this.getChildControl("title").setValue(value);
    },
    
    // property apply function
    _applyNumLikes : function(value, old)
    {
      this.getChildControl("numLikes").setValue(value + "");
    },
    
    // property apply function
    _applyNumDownloads : function(value, old)
    {
      this.getChildControl("numDownloads").setValue(value + "");
    },
    
    // property apply function
    _applyNumViewed : function(value, old)
    {
      this.getChildControl("numViewed").setValue(value + "");
    },
    
    // property apply function
    _applyNumComments : function(value, old)
    {
      this.getChildControl("numComments").setValue(value + "");
    },
    
    // property apply function
    _applyDisplayName : function(value, old)
    {
      this.getChildControl("displayName").setValue(value);
    },
    
    // property transform function
    _transformDisplayName : function(value)
    {
      return "by " + value;
    },

    // property apply function
    _applyDescription : function(value, old)
    {
      this.getChildControl("description").setValue(value);
    },
    
    // property apply function
    _applyCreationTime : function(value, old)
    {
      this.getChildControl("creationTime").setValue(value);
    },
    
    // property transform function
    _transformCreationTime : function(value)
    {
      var dateFormat = new qx.util.format.DateFormat();
      return "Created " + dateFormat.format(new Date(value));
    },
    
    // property apply function
    _applyUploadTime : function(value, old)
    {
      this.getChildControl("uploadTime").setValue(value);
    },
    
    // property transform function
    _transformUploadTime : function(value)
    {
      var dateFormat = new qx.util.format.DateFormat();
      return "Last updated " + dateFormat.format(new Date(value));
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      focused : true,
      hovered : true,
      selected : true,
      dragover : true
    },


    /**
     * Event handler for the mouse over event.
     */
    _onMouseOver : function() 
    {
      this.addState("hovered");
    },


    /**
     * Event handler for the mouse out event.
     */
    _onMouseOut : function() 
    {
      this.removeState("hovered");
    }
  },

  destruct : function() 
  {
    this.removeListener("mouseover", this._onMouseOver, this);
    this.removeListener("mouseout", this._onMouseOut, this);
  }
});
