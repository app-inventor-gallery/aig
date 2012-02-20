/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.SearchResult",
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
   *   "searchResults", "homeRibbon", "featured", or "byAuthor", indicating,
   *   respectively, whether to lay out all of the information as in a search
   *   result on the Find Apps page, vertically as in the home page ribbons,
   *   or horizontally as in the By This Author box on the App Info page.
   *
   * @param data {Map?}
   *   Data to display in this instance
   */
  construct : function(format, data)
  {
    var             grid;
    var             size;
    
    this.base(arguments);

    // Save the format
    this.format = format;

    // Default minimum width is huge. Allow this to be only as large as needed
    this.setMinWidth(10);

    // Use a grid layout to display each of the elements of the result
    grid = new qx.ui.layout.Grid(2, 2);
    
    // Do format-specific processing
    switch(format)
    {
    case "searchResults":
      // Describe the configuration for this widget
      this.gridConfig =
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
          uploadTime   : { row : 3, column : 2, colSpan : 4 },
          
          spacer       : { row : 0, column : 100 }
        };
      break;
      
    case "homeRibbon":
    case "featured":
      // Add grid layout characteristics
      grid.setColumnAlign(0, "center", "middle");
      grid.setRowFlex(1, 1);

      size = format == "homeRibbon" ? 220 : 320;

      // This one needs a background color to separate the slidebar items
      this.set(
        {
          width           : size,
          marginRight     : 20,
          padding         : 10,
          backgroundColor : "#eee9e9"
        });
      
      // Describe the configuration for this widget
      this.gridConfig =
        {
          image1       : { row : 0, column : 0 },
          spacer       : { row : 1, column : 0 },
          title        : { row : 2, column : 0 },
          displayName  : { row : 3, column : 0 },

          numLikes     : { row : 0, column : 100 },
          numDownloads : { row : 0, column : 101 },
          numViewed    : { row : 0, column : 102 },
          numComments  : { row : 0, column : 103 },
          description  : { row : 0, column : 104 },
          creationTime : { row : 0, column : 105 },
          uploadTime   : { row : 0, column : 106 }
        };
      break;
      
    case "byAuthor":
      // Allow the image to be large without affecting other
      // layout. Counts take up the excess space
      grid.setRowFlex(2, 1);

      // Describe the configuration for this widget
      this.gridConfig =
        {
          image1       : { row : 0, column : 0, rowSpan : 4 },
          title        : { row : 0, column : 1, colSpan : 4 },
          displayName  : { row : 1, column : 1, colSpan : 4 },
          numLikes     : { row : 3, column : 2 },
          numDownloads : { row : 3, column : 3 },
          numViewed    : { row : 3, column : 4 },
          numComments  : { row : 3, column : 5 },
          
          description  : { row : 0, column : 100 },
          creationTime : { row : 0, column : 101 },
          uploadTime   : { row : 0, column : 102 },
          spacer       : { row : 0, column : 100 }
        };
      break;

    case "appInfo":
      grid.setColumnAlign(0, "center", "middle");
      grid.setColumnAlign(1, "center", "middle");
      grid.setColumnAlign(2, "center", "middle");
      grid.setColumnAlign(3, "center", "middle");

      // Allow the image to be large without affecting other
      // layout. Description takes up the excess space.
      grid.setRowFlex(2, 1);

      // Describe the configuration for this widget
      this.gridConfig =
        {
          image1       : { row : 0, column : 0, rowSpan : 3, colSpan : 4 },
          title        : { row : 0, column : 4, colSpan : 3 },
          displayName  : { row : 1, column : 4, colSpan : 3 },
          description  : { row : 2, column : 4, colSpan : 3 },
          numLikes     : { row : 3, column : 0 },
          numDownloads : { row : 3, column : 1 },
          numViewed    : { row : 3, column : 2 },
          numComments  : { row : 3, column : 3 },
          creationTime : { row : 3, column : 4 },
          spacer       : { row : 3, column : 5 },
          uploadTime   : { row : 3, column : 6 }
        };
      break;
      
      break;
    }

    this.setLayout(grid);
    
    // Specify the format of date output
    this.dateFormat = aiagallery.Application.getDateFormat();

    // If there's data, add it now
    if (data)
    {
      this.set(data);
    }

    // Pre-create each of the child controls
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
    this.getChildControl("spacer");
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

    owner :
    {
      check    : "String",
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
      var             textAlign;
      var             size;

      switch(id)
      {
      case "image1":
        control = new qx.ui.basic.Image();
        switch(this.format)
        {
        case "searchResults":
        case "homeRibbon":
        case "byAuthor":
          size = 100;
          break;
          
        case "featured":
          size = 300;
          break;

        case "appInfo":
          size = 200;
          break;
        }
        control.set(
          {
            source    : null,
            focusable : false,
            scale     : true,
            minWidth  : size,
            maxWidth  : size,
            minHeight : size,
            maxHeight : size
          });
        control.addListener("mousedown", this._onViewApp, this);
        this._add(control, this.gridConfig.image1);
        break;
        
      case "title":
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.setDecoration("underline");
        
        // Display the title single-line in searchResults format; possibly
        // wrapping on multiple lines in the other formats.
        control = new qx.ui.basic.Label();
        switch(this.format)
        {
        case "homeRibbon":
        case "featured":
          textAlign = "center";
          size = 200;
          break;

        case "searchResults":
        case "byAuthor":
        case "appInfo":
          textAlign = "left";
          size = 300;
          break;
        }
        control.set(
          {
            width     : size,
            font      : font,
            textAlign : textAlign
          });
        control.addListener("mousedown", this._onViewApp, this);
        this._add(control, this.gridConfig.title);
        break;
        
      case "numLikes":
        control = new qx.ui.basic.Atom();
        switch(this.format)
        {
        case "searchResults":
        case "appInfo":
          size = 60;
          break;

        case "homeRibbon":
        case "featured":
          size = 0;
          break;

        case "byAuthor":
          size = 40;
          break;
        }
        control.set(
          {
            icon         : "aiagallery/thumbs-up.png",
            iconPosition : "top",
            minWidth     : size
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
        switch(this.format)
        {
        case "searchResults":
        case "appInfo":
          size = 60;
          break;

        case "homeRibbon":
        case "featured":
          size = 0;
          break;

        case "byAuthor":
          size = 40;
          break;
        }
        control.set(
          {
            icon         : "aiagallery/downloads.png",
            iconPosition : "top",
            minWidth     : size
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
        switch(this.format)
        {
        case "searchResults":
        case "appInfo":
          size = 60;
          break;

        case "homeRibbon":
        case "featured":
          size = 0;
          break;

        case "byAuthor":
          size = 40;
          break;
        }
        control.set(
          {
            icon         : "aiagallery/viewed.png",
            iconPosition : "top",
            minWidth     : size
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
        switch(this.format)
        {
        case "searchResults":
        case "appInfo":
          size = 60;
          break;

        case "homeRibbon":
        case "featured":
          size = 0;
          break;

        case "byAuthor":
          size = 40;
          break;
        }
        control.set(
          {
            icon         : "aiagallery/comments.png",
            iconPosition : "top",
            minWidth     : size
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
        switch(this.format)
        {
        case "homeRibbon":
        case "featured":
          size = 0;
          break;

        case "searchResults":
        case "byAuthor":
          size = 50;
          break;

        case "appInfo":
          size = 160;
          break;
        }
        control.set(
          {
            appearance : "widget",
            readOnly   : true,
            wrap       : true,
            anonymous  : true,
            minHeight  : size,
            maxHeight  : size
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
        
      case "spacer":
        control = new qx.ui.core.Spacer(10, 10);
        this._add(control, this.gridConfig.spacer);
        break;
      }

      // Column number >= 100 means the control should not be displayed
      if (this.gridConfig[id].column >= 100 && id != "spacer")
      {
        control.setVisibility("excluded");
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
