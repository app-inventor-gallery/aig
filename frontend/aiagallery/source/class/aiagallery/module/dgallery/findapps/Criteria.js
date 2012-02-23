/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.dgallery.findapps.Criteria",
{
  extend : qx.ui.container.Composite,
  
  construct : function()
  {
    var             layout;
    var             grid;

    this.base(arguments);
    
    // Use a vbox layout here
    this.setLayout(new qx.ui.layout.VBox(4));

    // Create the tabview for selecting the types of search
    this.__radioView = new aiagallery.widget.radioview.RadioView();
    this.add(this.__radioView);

    // Use a single row for subtabs
    this.__radioView.setRowCount(1);

    // Allow results section to grow or shrink based on tabview page's needs
    this.__radioView.getChildControl("pane").setDynamic(true);

    // Create the pages
    [
      {
        field  : "__containerTextSearch",
        label  : this.tr("Text search"),
        custom : this._textSearchStaticContent
      },
      {
        field  : "__containerBrowseCategories",
        label  : this.tr("Browse Categories"),
        custom : this._browseCategoriesStaticContent
      },
      {
        field  : "__containerAdvanced",
        label  : this.tr("Advanced")
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
          layout : new qx.ui.layout.Grid(0, 10)
        });
        
        // If there's a function for custom labels, ...
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
    
    // Now create the grid container
    grid = new qx.ui.container.Composite(layout);
    this.add(grid);
    
    // Add the Search and Clear buttons
    this.__butSearch = new qx.ui.form.Button(this.tr("Search"));
    this.__butClear = new qx.ui.form.Button(this.tr("Clear"));
    grid.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 0 });
    grid.add(this.__butSearch,              { row : 0, column : 1 });
    grid.add(this.__butClear,               { row : 0, column : 2 });
    grid.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 3 });

    // Instantiate child controls
    this.getChildControl("txtTextSearch");
    this.getChildControl("browse0");
    this.getChildControl("browse1");
    this.getChildControl("browse2");
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
    _createChildControlImpl : function(id, hash)
    {
      var             control;
      var             column;

      switch(id)
      {
      case "txtTextSearch" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width : 500
          });
        this.__containerTextSearch._add(control, { row : 1, column : 1 });
        break;

      case "browse0" :
      case "browse1":
      case "browse2":
        control = new qx.ui.form.List();
        control.set(
        {
          width  : 130,
          height : 124
        });
        
        // Determine which list this is, so we know the column to place it in
        column = 1 + Number(id.charAt(6));

        // Add the list
        this.__containerBrowseCategories._add(control,
                                              { row : 1, column : column });
        break;
      }
      
      return control || this.base(arguments, id, hash);
    },
    
    /**
     * Create the static content in the Text Search page.
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
      text = this.tr("Search for words found in the title, description, " +
                     "categories, or tags");
      label = new qx.ui.basic.Label(text);
      label.set(
        {
          font : font
        });
      container.add(label, { row : 0, column : 1 });

      // Add a spacer to columns 0 and 2
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 0 });
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 2 });
    },
    
    /**
     * Create the static content in the Text Search page.
     */
    _browseCategoriesStaticContent : function(container)
    {
      var             layout;
      var             font;
      var             text;
      var             label;

      // Center fields in column 1, 2, 3
      layout = container.getLayout();
      layout.setRowAlign(0, "center", "middle");
      layout.setColumnAlign(1, "center", "middle");
      layout.setColumnAlign(2, "center", "middle");
      layout.setColumnAlign(3, "center", "middle");
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(4, 1);

      // Get a bold font reference
      font = qx.theme.manager.Font.getInstance().resolve("bold");

      // Add the labels
      text = this.tr("Browse by apps' categories. Each column further " +
                     "restricts apps to those with all selected categories.");
      label = new qx.ui.basic.Label(text);
      label.set(
        {
          font : font
        });
      container.add(label, { row : 0, column : 0, colSpan : 5 });
    }
  }
});
