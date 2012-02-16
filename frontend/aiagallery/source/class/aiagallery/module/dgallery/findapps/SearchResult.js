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

  /**
   * Information about an App
   *
   * @param format {String}
   *   A keyword indicating the format in which to display the App
   *   information. This string may be any one of the generic terms:
   *   "searchResult", "homeRibbon", or "byAuthor", indicating, respectively,
   *   whether to lay out all of the information as in a search result on the
   *   Find Apps page, vertically as in the home page ribbons, or horizontally
   *   as in the By This Author box on the App Info page.
   */
  construct : function(format)
  {
    var             grid;
    
    this.base(arguments);

    // Use a grid layout to display each of the elements of the result
    grid = new qx.ui.layout.Grid(2, 2);
    this.setLayout(grid);
    
    // Specify the format of date output
    this.dateFormat = aiagallery.Application.getDateFormat();
    
    // Select the appropriate grid layout
    this.gridConfig =
      {
        searchResult :
        {
          image1       : { row : 0, column : 0, rowSpan : 4 },
          title        : { row : 0, column : 1 },
          numLikes     : { row : 0, column : 2, rowSpan : 2 },
          numDownloads : { row : 0, column : 3, rowSpan : 2 },
          numViewed    : { row : 0, column : 4, rowSpan : 2 },
          numComments  : { row : 0, column : 5, rowSpan : 2 },
          displayName  : { row : 1, column : 1 },
          description  : { row : 2, column : 1, colSpan : 5 },
          creationTime : { row : 3, column : 1 },
          uploadTime   : { row : 3, column : 2, colSpan : 4 }
        },

        homeRibbon :
        {
        },
        
        byAuthor :
        {
        }
      }[format];

    // Pre-create each of the child controls
    this.gridConfig.image1       && this.getChildControl("image1");
    this.gridConfig.title        && this.getChildControl("title");
    this.gridConfig.numLikes     && this.getChildControl("numLikes");
    this.gridConfig.numDownloads && this.getChildControl("numDownloads");
    this.gridConfig.numViewed    && this.getChildControl("numViewed");
    this.gridConfig.numComments  && this.getChildControl("numComments");
    this.gridConfig.displayName  && this.getChildControl("displayName");
    this.gridConfig.description  && this.getChildControl("description");
    this.gridConfig.creationTime && this.getChildControl("creationTime");
    this.gridConfig.uploadTime   && this.getChildControl("uploadTime");
  },
  
  events:
  {
    /** Fired by {@link qx.ui.form.List} */
    "action" : "qx.event.type.Event",
    
    /** Fired by click on app title or image */
    "viewApp" : "qx.event.type.Data",
    
    /** Fired when the numLikes property is changed */
    "changeNumLikes" : "qx.event.type.Data",
    
    /** Fired when the numViewed property is changed */
    "changeNumViewed" : "qx.event.type.Data",
    
    /** Fired when the numDownloads property is changed */
    "changeNumDownloads" : "qx.event.type.Data",
    
    /** Fired when the numComments property is changed */
    "changeNumComments" : "qx.event.type.Data",
    
    /** Fired when the displayName property is changed */
    "changeDisplayName" : "qx.event.type.Data",
    
    /** Fired when the description property is changed */
    "changeDescription" : "qx.event.type.Data",
    
    /** Fired when the creationTime property is changed */
    "changeCreationTime" : "qx.event.type.Data",
    
    /** Fired when the uploadTime property is changed */
    "changeUploadTime" : "qx.event.type.Data"
  },

  properties :
  {
    appearance :
    {
      refine   : true,
      init     : "searchResult"
    },

    uid :
    {
      check    : "Number",
      nullable : false
    },

    image1 :
    {
      apply    : "_applyImage1",
      nullable : true,
      check    : "String",
      event    : "changeImage1"
    },
    
    title :
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
    /** Event handler for click on app title or image */
    _onViewApp : function(e)
    {
      var             searchResult = e.getTarget().getLayoutParent();

      this.fireDataEvent(
        "viewApp",
        {
          uid   : searchResult.getUid(),
          title : searchResult.getTitle()
        });
    },

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
        control.addListener("mousedown", this._onViewApp, this);
        this._add(control, this.gridConfig.image1);
        break;
        
      case "title":
        font = qx.bom.Font.fromString("10px sans-serif bold");
        font.setDecoration("underline");
        control = new qx.ui.basic.Label();
        control.set(
          {
            width : 300,
            font  : font
          });
        control.addListener("mousedown", this._onViewApp, this);
        this._add(control, this.gridConfig.title);
        break;
        
      case "numLikes":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            icon      : "aiagallery/thumbs-up.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, this.gridConfig.numLikes);
        break;
        
      case "numDownloads":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            icon      : "aiagallery/downloads.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, this.gridConfig.numDownloads);
        break;

      case "numViewed":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            icon      : "aiagallery/viewed.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, this.gridConfig.numViewed);
        break;

      case "numComments":
        control = new qx.ui.basic.Atom();
        control.set(
          {
            icon      : "aiagallery/comments.png",
            minWidth  : 60
          });
        control.getChildControl("icon").set(
          {
            maxWidth  : 20,
            maxHeight : 20,
            scale     : true
          });
        this._add(control, this.gridConfig.numComments);
        break;

      case "displayName":
        // The displayName should be displayed android green
        font = qx.bom.Font.fromString("10px sans-serif");
        font.setColor("#75940c");   // android-green-dark
        control = new qx.ui.basic.Label();
        control.set(
          {
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

        this._add(control, this.gridConfig.displayName);
        break;
        
      case "description":
        control = new qx.ui.form.TextArea();
        control.set(
          {
            appearance : "widget",
            readOnly   : true,
            wrap       : true,
            anonymous  : true,
            minHeight  : 50,
            maxHeight  : 50
          });
        this._add(control, this.gridConfig.description);
        break;

      case "creationTime":
        control = new qx.ui.basic.Label();
        control.set(
          {
            rich : true
          });
        this._add(control, this.gridConfig.creationTime);
        break;
        
      case "uploadTime":
        control = new qx.ui.basic.Label();
        control.set(
          {
            rich : true
          });
        this._add(control, this.gridConfig.uploadTime);
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
      this.getChildControl("numLikes").setLabel(value + "");
    },
    
    // property apply function
    _applyNumDownloads : function(value, old)
    {
      this.getChildControl("numDownloads").setLabel(value + "");
    },
    
    // property apply function
    _applyNumViewed : function(value, old)
    {
      this.getChildControl("numViewed").setLabel(value + "");
    },
    
    // property apply function
    _applyNumComments : function(value, old)
    {
      this.getChildControl("numComments").setLabel(value + "");
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
      return("Created&nbsp;&nbsp" +
             this.dateFormat.format(new Date(Number(value))));
    },
    
    // property apply function
    _applyUploadTime : function(value, old)
    {
      this.getChildControl("uploadTime").setValue(value);
    },
    
    // property transform function
    _transformUploadTime : function(value)
    {
      return("Last updated&nbsp;&nbsp" +
             this.dateFormat.format(new Date(Number(value))));
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
