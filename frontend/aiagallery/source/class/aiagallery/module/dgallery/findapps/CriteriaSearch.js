/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#asset(qx/icon/Tango/16/actions/dialog-apply.png)
 */

qx.Class.define("aiagallery.module.dgallery.findapps.CriteriaSearch",
{
  extend : qx.ui.container.Composite,
  
  construct : function()
  {
    var             layout;
    var             grid;
    var             label;
    var             font;

    this.base(arguments);
    
    // Use a vbox layout here
    this.setLayout(new qx.ui.layout.VBox(4));

    // Create the tabview for selecting the types of search
    this.__radioView = 
      new aiagallery.widget.radioview.RadioView(this.tr("Search in: "));
    this.add(this.__radioView);

    // Use a single row for subtabs
    this.__radioView.setRowCount(1);

    // Allow results section to grow or shrink based on tabview page's needs
    this.__radioView.getChildControl("pane").setDynamic(true);

    // Create the pages
    [
      {
        field  : "__containerTextSearch",
        label  : this.tr("All text fields"),
        custom : this._textSearchStaticContent
      },
      {
        field  : "__containerAdvanced",
        label  : this.tr("Specific fields"),
        custom : this._advancedSearchStaticContent
      }
    ].forEach(
      function(pageInfo)
      {
        var             layout;

        // Create the page
        this[pageInfo.field] =
          new aiagallery.widget.radioview.Page(pageInfo.label);
        
        // Set its properties
        this[pageInfo.field].set(
        {
          layout       : new qx.ui.layout.Grid(0, 10),
          padding      : 20,
          decorator    : "criteria-box"
        });
        
        // If there's a function for customizing this page, ...
        if (pageInfo.custom)
        {
          // ... then call it now. It's called in our own context, with the
          // page container as the parameter.
          qx.lang.Function.bind(pageInfo.custom, this)(this[pageInfo.field]);
        }
        
        // Add this page to the radio view
        this.__radioView.add(this[pageInfo.field]);
      },
      this);
    
    // Create a grid layout for the button bar, with centered buttons
    layout = new qx.ui.layout.Grid(10, 10);
    layout.setColumnFlex(0, 1);
    layout.setColumnFlex(3, 1);
    
    // Now create the button bar's grid container
    grid = new qx.ui.container.Composite(layout);
    grid.set(
      {
        marginTop : 10
      });
    this.add(grid);
    
    // Add the Search and Clear buttons
    this.__butSearch = new qx.ui.form.Button(this.tr("Search"));
    this.__butClear = new qx.ui.form.Button(this.tr("Clear"));
    
    // Arrange for the clear button to clear all fields
    this.__butClear.addListener("execute", this._clearAllFields, this);

    grid.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 0 });
    grid.add(this.__butSearch,              { row : 0, column : 1 });
    grid.add(this.__butClear,               { row : 0, column : 2 });
    grid.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 3 });

    // Add the search results label
    font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
    font.setSize(18);
    label = new qx.ui.basic.Label("Search Results");
    label.set(
      {
        font : font
      });
    this.add(label);

    // Add the list for all of the search results
    this.__searchResults = new qx.ui.list.List();
    this.__searchResults.set(
      {
        itemHeight : 130,
        labelPath  : "title",
        iconPath   : "image1",
        delegate   :
        {
          createItem : qx.lang.Function.bind(
            function()
            {
              return new aiagallery.widget.SearchResult("searchResults");
            },
            this),

          bindItem : qx.lang.Function.bind(
            function(controller, item, id) 
            {
              [
                "uid",
                "owner",
                "image1",
                "title",
                "numLikes",
                "numDownloads",
                "numViewed",
                "numComments",
                "displayName",
                "description",
                "creationTime",
                "uploadTime"
              ].forEach(
                function(name)
                {
                  controller.bindProperty(name, name, null, item, id);
                });
            },
            this),

          configureItem : qx.lang.Function.bind(
            function(item) 
            {
              // Listen for clicks on the title or image, to view the app
              item.addListener("viewApp",
                               function(e)
                               {
                                 this.fireDataEvent(e.getData());
                               },
                               this);
            },
            this)
        }
      });

    this.add(this.__searchResults, { flex : 1 });

    // Instantiate child controls
    this.getChildControl("txtTextSearch");
    this.getChildControl("imgTitle");
    this.getChildControl("txtTitle");
    this.getChildControl("imgDescription");
    this.getChildControl("txtDescription");
    this.getChildControl("imgTags");
    this.getChildControl("txtTags");
    this.getChildControl("txtAuthorId");
    this.getChildControl("lblAuthorName");

    this.getChildControl("imgLikes");
    this.getChildControl("lstLikesOp");
    this.getChildControl("spnLikes");
    this.getChildControl("imgDownloads");
    this.getChildControl("lstDownloadsOp");
    this.getChildControl("spnDownloads");
    this.getChildControl("imgViews");
    this.getChildControl("lstViewsOp");
    this.getChildControl("spnViews");
    this.getChildControl("imgAuthorId");
    this.getChildControl("txtAuthorId");

    this.getChildControl("imgCategories");
    this.getChildControl("lstCategories");
  },
  
  events :
  {
    "viewApp" : "qx.event.Type.Data"
  },

  properties :
  {
    textInTitle :
    {
      check    : "String",
      init     : null,
      nullable : true,
      apply    : "_applyTextInTitle"
    },
    
    textInDescription :
    {
      check    : "String",
      init     : null,
      nullable : true,
      apply    : "_applyTextInDescription"
    },

    textInTags :
    {
      check    : "String",
      init     : null,
      nullable : true,
      apply    : "_applyTextInTags"
    },
    
    categories :
    {
      check    : "Array",
      init     : null,
      nullable : true,
      apply    : "_applyCategories"
    },
    
    likesOperator :
    {
      check    : "String",
      init     : null,
      nullable : true,
      apply    : "_applyLikesOperator"
    },
    
    likesCount :
    {
      check    : "Number",
      init     : null,
      nullable : true,
      apply    : "_applyLikesCount"
    },
    
    downloadsOperator :
    {
      check    : "String",
      init     : null,
      nullable : true,
      apply    : "_applyDownloadsOperator"
    },
    
    downloadsCount :
    {
      check    : "Number",
      init     : null,
      nullable : true,
      apply    : "_applyDownloadsCount"
    }
  },

  members :
  {
    /**
     * Retrieve the search results list object
     */
    getSearchResultsList : function()
    {
      return this.__searchResults;
    },

    /**
     * Add the list of categories to the first browse list
     */
    setCategoryList : function(categories)
    {
      categories.forEach(
        function(tag)
        {
          this.getChildControl("lstCategories").add(
            new qx.ui.form.ListItem(tag));
        },
        this);
    },

    /**
     * Clear all fields
     */
    _clearAllFields : function()
    {
      var             clear;
      var             fields;
      var             field;
      
      // Functions to clear each of the types of controls
      clear =
        {
          "textField" : function(o)
          {
            o.setValue("");
          },
          
          "list" : function(o)
          {
            o.resetSelection();
          },
          
          "spinner" : function(o)
          {
            o.setValue(0);
          }
        };

      // Fields to be cleared, mapped to the function to clear them
      fields =
        {
          txtTextSearch  : clear.textField,
          txtTitle       : clear.textField,
          txtDescription : clear.textField,
          txtTags        : clear.textField,
          txtAuthorId    : clear.textField,

          lstLikesOp     : clear.list,
          spnLikes       : clear.spinner,
          lstDownloadsOp : clear.list,
          spnDownloads   : clear.spinner,
          lstViewsOp     : clear.list,
          spnViews       : clear.spinner,

          lstCategories  : clear.list
        };      
      
      // Now do it! For each field...
      for (field in fields)
      {
        // ... call its clear function with the appropriate control
        fields[field](this.getChildControl(field));
      }
    },

    _createChildControlImpl : function(id, hash)
    {
      var             control;
      var             column;
      var             font;

      switch(id)
      {
      case "txtTextSearch" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width       : 500,
            placeholder : "Please enter search words"
          });
        this.__containerTextSearch._add(control, { row : 1, column : 1 });
        break;

      case "imgTitle" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgTitle);
        break;

      case "txtTitle" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width       : 200,
            placeholder : "Words in apps' title"
          });

        control.addListener(
          "input",
          function(e)
          {
            this.getChildControl("imgTitle").setVisibility(
              e.getTarget().getValue().length > 0 ? "visible" : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.txtTitle);
        break;
        
      case "imgDescription" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgDescription);
        break;

      case "txtDescription" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width       : 200,
            placeholder : "Words in apps' description"
          });

        control.addListener(
          "input",
          function(e)
          {
            this.getChildControl("imgDescription").setVisibility(
              e.getTarget().getValue().length > 0 ? "visible" : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.txtDescription);
        break;
        
      case "imgTags" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgTags);
        break;

      case "txtTags" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width : 200,
            placeholder : "Words in apps' tags"
          });

        control.addListener(
          "input",
          function(e)
          {
            this.getChildControl("imgTags").setVisibility(
              e.getTarget().getValue().length > 0 ? "visible" : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.txtTags);
        break;
        
      case "txtAuthorId" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width       : 100,
            placeholder : "Author's unique ID"
          });
        control.addListener(
          "input",
          function(e)
          {
            this.getChildControl("imgAuthorId").setVisibility(
              e.getTarget().getValue().length > 0 ? "visible" : "hidden");
          },
          this);
        this.__containerAdvanced._add(control, this.__advConfig.txtAuthorId);
        break;

      case "lblAuthorName" :
        // The author's displayName should be displayed android green
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.set(
          {
            color      : "#75940c"      // android-green-dark
          });
        control = new qx.ui.basic.Label();
        control.set(
          {
            textColor   : null,       // don't let it override font's color
            width       : 100,
            font        : font
          });
        this.__containerAdvanced._add(control, this.__advConfig.lblAuthorName);
        break;
        
      case "imgLikes" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgLikes);
        break;

      case "lstLikesOp" :
        control = new qx.ui.form.SelectBox();
        [
          "",
          "<",
          "<=",
          "=",
          ">",
          ">="
        ].forEach(
          function(choice)
          {
            control.add(new qx.ui.form.ListItem(choice));
          });

        control.set(
          {
            width : 46
          });
        
        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgLikes").setVisibility(
              e.getTarget().getSelection()[0].getLabel().length > 0
                ? "visible"
                : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstLikesOp);
        break;
        
      case "spnLikes" :
        control = new qx.ui.form.Spinner();
        control.set(
          {
            width   : 100,
            maximum : 1000000
          });
        this.__containerAdvanced._add(control, this.__advConfig.spnLikes);
        break;
        
      case "imgDownloads" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgDownloads);
        break;

      case "lstDownloadsOp" :
        control = new qx.ui.form.SelectBox();
        [
          "",
          "<",
          "<=",
          "=",
          ">",
          ">="
        ].forEach(
          function(choice)
          {
            control.add(new qx.ui.form.ListItem(choice));
          });

        control.set(
          {
            width : 46
          });
        
        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgDownloads").setVisibility(
              e.getTarget().getSelection()[0].getLabel().length > 0
                ? "visible"
                : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstDownloadsOp);
        break;
        
      case "spnDownloads" :
        control = new qx.ui.form.Spinner();
        control.set(
          {
            width   : 100,
            maximum : 1000000
          });
        this.__containerAdvanced._add(control, this.__advConfig.spnDownloads);
        break;
        
      case "imgViews" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgViews);
        break;

      case "lstViewsOp" :
        control = new qx.ui.form.SelectBox();
        [
          "",
          "<",
          "<=",
          "=",
          ">",
          ">="
        ].forEach(
          function(choice)
          {
            control.add(new qx.ui.form.ListItem(choice));
          });

        control.set(
          {
            width : 46
          });
        
        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgViews").setVisibility(
              e.getTarget().getSelection()[0].getLabel().length > 0
                ? "visible"
                : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstViewsOp);
        break;
        
      case "spnViews" :
        control = new qx.ui.form.Spinner();
        control.set(
          {
            width   : 100,
            maximum : 1000000
          });
        this.__containerAdvanced._add(control, this.__advConfig.spnViews);
        break;

      case "imgAuthorId" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgAuthorId);
        break;

      case "imgCategories" :
        control =
          new qx.ui.basic.Image("qx/icon/Tango/16/actions/dialog-apply.png");
        control.set(
          {
            visibility : "hidden"
          });
        this.__containerAdvanced._add(control, this.__advConfig.imgCategories);
        break;

      case "lstCategories" :
        control = new qx.ui.form.List();
        control.set(
          {
            height        : 80,
            selectionMode : "multi"
          });

        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgCategories").setVisibility(
              e.getTarget().getSelection().length > 0
                ? "visible"
                : "hidden");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstCategories);
        break;
      }
      
      return control || this.base(arguments, id, hash);
    },
    
    /**
     * Create the static content in the Text Search page.
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. The container's
     *   layout is a {@link qx.ui.layout.Grid} but it is this method's
     *   responsibility to specify the grid parameters as required.
     */
    _textSearchStaticContent : function(container)
    {
      var             layout;
      var             font;
      var             text;
      var             label;

      // Center fields in column 1
      layout = container.getLayout();
      layout.setColumnAlign(1, "center", "middle");
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(2, 1);

      // Get a bold font reference
      font = qx.theme.manager.Font.getInstance().resolve("bold");

      // Add the labels
      text = this.tr("Search for words found in apps' title, description, " +
                     "categories, or tags");
      label = new qx.ui.basic.Label(text);
      label.set(
        {
          font      : font,
          textAlign : "center"
        });
      container.add(label, { row : 0, column : 1 });

      // Add a spacer to columns 0 and 2
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 0 });
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 2 });
    },
    
    /**
     * Create the static content in the Advanced Search page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. The container's
     *   layout is a {@link qx.ui.layout.Grid} but it is this method's
     *   responsibility to specify the grid parameters as required.
     */
    _advancedSearchStaticContent : function(container)
    {
      var             o;
      var             font;
      var             layout;

      // Configure the layout
      layout = container.getLayout();
      layout.setSpacingX(20);
      
      // Center the form
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(10, 1);
      
      // Right-align the label columns
      layout.setColumnAlign(2, "right", "middle");
      layout.setColumnAlign(5, "right", "middle");
      
      // Generally left align everything else
      layout.setRowAlign(0, "left", "middle");
      layout.setRowAlign(1, "left", "middle");
      layout.setRowAlign(2, "left", "middle");
      layout.setRowAlign(3, "left", "middle");
      layout.setRowAlign(4, "left", "middle");

      // Build the grid configuration
      this.__advConfig =
        {
          header         : { row : 0, column : 1, colSpan : 5 },
          imgTitle       : { row : 1, column : 1 },
          lblTitle       : { row : 1, column : 2 },
          txtTitle       : { row : 1, column : 3 },
          imgDescription : { row : 2, column : 1 },
          lblDescription : { row : 2, column : 2 },
          txtDescription : { row : 2, column : 3 },
          imgTags        : { row : 3, column : 1 },
          lblTags        : { row : 3, column : 2 },
          txtTags        : { row : 3, column : 3 },
          imgAuthorId    : { row : 4, column : 1 },
          lblAuthorId    : { row : 4, column : 2 },
          txtAuthorId    : { row : 4, column : 3 },
          lblAuthorName  : { row : 4, column : 4, colSpan : 3 },

          imgLikes       : { row : 1, column : 4 },
          lblLikes       : { row : 1, column : 5 },
          lstLikesOp     : { row : 1, column : 6 },
          spnLikes       : { row : 1, column : 7 },
          imgDownloads   : { row : 2, column : 4 },
          lblDownloads   : { row : 2, column : 5 },
          lstDownloadsOp : { row : 2, column : 6 },
          spnDownloads   : { row : 2, column : 7 },
          imgViews       : { row : 3, column : 4 },
          lblViews       : { row : 3, column : 5 },
          lstViewsOp     : { row : 3, column : 6 },
          spnViews       : { row : 3, column : 7 },

          imgCategories  : { row : 0, column : 8 },
          lblCategories  : { row : 0, column : 9 },
          lstCategories  : { row : 1, column : 8, colSpan : 2, rowSpan : 4 }
        };
      
      // Get a bold font reference
      font = qx.theme.manager.Font.getInstance().resolve("bold");

      // Add a left spacer to center the other fields
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 0 });

      // Add a right spacer to center the other fields
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 10 });

      // Add the header
      o = new qx.ui.basic.Label(this.tr("Find all apps in which all of:"));
      o.set(
        {
          font : font
        });
      container.add(o, this.__advConfig.header);
      
      // Add the title label
      o = new qx.ui.basic.Label(this.tr("Title contains"));
      this.assertMap(this.__advConfig.lblTitle);
      container.add(o, this.__advConfig.lblTitle);

      // Add the description label
      o = new qx.ui.basic.Label(this.tr("Description contains"));
      this.assertMap(this.__advConfig.lblDescription);
      container.add(o, this.__advConfig.lblDescription);

      // Add the tags label
      o = new qx.ui.basic.Label(this.tr("Tags provided"));
      this.assertMap(this.__advConfig.lblTags);
      container.add(o, this.__advConfig.lblTags);

      // Add the categories label
      o = new qx.ui.basic.Label(this.tr("Selected categories"));
      this.assertMap(this.__advConfig.lblCategories);
      container.add(o, this.__advConfig.lblCategories);
      
      // Add the likes label
      o = new qx.ui.basic.Label(this.tr("Likes"));
      this.assertMap(this.__advConfig.lblLikes);
      container.add(o, this.__advConfig.lblLikes);
      
      // Add the downloads label
      o = new qx.ui.basic.Label(this.tr("Downloads"));
      this.assertMap(this.__advConfig.lblDownloads);
      container.add(o, this.__advConfig.lblDownloads);
      
      // Add the views label
      o = new qx.ui.basic.Label(this.tr("Views"));
      this.assertMap(this.__advConfig.lblViews);
      container.add(o, this.__advConfig.lblViews);
      
      // Add the author id label
      o = new qx.ui.basic.Label(this.tr("Author ID"));
      this.assertMap(this.__advConfig.lblAuthorId);
      container.add(o, this.__advConfig.lblAuthorId);
    }
  }
});
