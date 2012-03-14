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
    
    // When the radioview selection changes, copy fields or clear entry
    this.__radioView.addListener(
      "changeSelection",
      function(e)
      {
        var             page;

        // Find out which page we're switching to
        page = e.getTarget().getSelection()[0];
        
        // If we're switching to the Specific Fields page
        if (page == this["__containerAdvanced"])
        {
          var             words;

          // Are there words entered in the All Text Fields box? Get its value.
          words = this.getChildControl("txtTextSearch").getValue();
          
          // Trim any surrounding whitespace
          words = qx.lang.String.trim(words || "");
          
          // Check for content. Anything there?
          if (words.length > 0)
          {
            // Yup. Copy them to all three fields in 'advanced'
            this.getChildControl("txtTitle").setValue(words);
            this.getChildControl("txtDescription").setValue(words);
            this.getChildControl("txtTags").setValue(words);
          }
        }
        else
        {
          // We're switching to the All Text Fields page. Clear the input field.
          this.getChildControl("txtTextSearch").setValue("");
        }
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
    
    // Add the Search button
    this.__butSearch = new qx.ui.form.Button(this.tr("Search"));
    this.__butSearch.set(
      {
        tabIndex : 100
      });
    
    // Fire a data event with the current query when search button is pressed
    this.__butSearch.addListener("execute", this._fireQueryChangedEvent, this);
    
    // Add the Clear button
    this.__butClear = new qx.ui.form.Button(this.tr("Clear"));
    this.__butClear.set(
      {
        tabIndex : 101
      });
    
    // Arrange for the clear button to clear all fields
    this.__butClear.addListener("execute", this._clearFields, this);

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
        itemHeight : 136,
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
              item.addListener(
                "viewApp",
                function(e)
                {
                  this.fireDataEvent("viewApp", e.getData());
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
    /** A click on an app in the Search Results list */
    "viewApp" : "qx.event.type.Data",
    
    /** A new search is requested */
    "queryChanged" : "qx.event.type.Data"
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
      // Initialize the lower-case category list
      this.__lcCategories = [];

      // Add each tag to the category list. At the same time, build a list of
      // category names in lower case, to compare against when we receive a
      // query map.
      categories.forEach(
        function(tag)
        {
          // Add this category as a list item
          this.getChildControl("lstCategories").add(
            new qx.ui.form.ListItem(tag));
          
          // Convert the category to lower case and save it for later use
          this.__lcCategories.push(tag.toLowerCase());
        },
        this);
    },

    /**
     * Specify a query.
     *
     * @param json {String}
     *   The input is expected to be JSON representing a map which contains
     *   any or all of the following fields:
     *
     *   text {Array}
     *     An array of words for the basic search of all text fields. This
     *     field is ignored if any others are provided.
     *
     *   title {Array}
     *     An array of words for the Title field
     *
     *   description {Array}
     *     An array of words for the Description field
     *
     *   tags {Array}
     *     An array of words that are tags and categories.
     *
     *   authorId {String}
     *     The unique ID of a particular visitor
     *
     *   likes {Array}
     *     The array contains two elements: an operator ("<", "<=", "=", ">",
     *     ">=") and a number.
     *
     *   downloads {Array}
     *     The array contains two elements: an operator ("<", "<=", "=", ">",
     *     ">=") and a number.
     *
     *   views {Array}
     *     The array contains two elements: an operator ("<", "<=", "=", ">",
     *     ">=") and a number.
     */
    setQuery : function(json)
    {
      var             data;
      var             field;
      var             bFoundNonBasic = false;
      var             tags = [];
      var             categories = [];
      var             selection = [];

      var selectByValue = function(list, value)
      {
        var             i;
        var             children = list.getChildren();
        
        // Loop through each list item
        for (i = 0; i < children.length; i++)
        {
          // Is this the one we're loking for?
          if (children[i].getLabel() == value)
          {
            // Yup. Set it as the selection
            list.setSelection([ children[i] ]);
            
            // No need to search farther. These are single-seleciton lists.
            break;
          }
        }
      };

      // Parse the JSON
      try
      {
        data = qx.lang.Json.parse(json);
      }
      catch (e)
      {
        // If we couldn't parse, then just display an empty query
        data = {};
      }
      
      // Clear the query fields
      this._clearFields();
      
      // For each field...
      for (field in data)
      {
        // Track if we see a field other than the all-text-fields basic search
        if (field != "text")
        {
          bFoundNonBasic = true;
        }
        
        // Add the query data
        switch(field)
        {
        case "text":
          if (! bFoundNonBasic)
          {
            this.getChildControl("txtTextSearch").
              setValue(data[field].join(" "));
          }
          break;
          
        case "title":
          this.getChildControl("txtTitle").
            setValue(data[field].join(" "));
          break;
          
        case "description":
          this.getChildControl("txtDescription").
            setValue(data[field].join(" "));
          break;
          
        case "tags":
          // Separate tags and categories, putting each into its own list
          data[field].forEach(
            function(tag)
            {
              // Is this tag actually a category?
              if (qx.lang.Array.contains(this.__lcCategories, 
                                         tag.toLowerCase()))
              {
                // Yup. Ignore it.
              }
              else
              {
                // It's an ordinary tag
                tags.push(tag);
              }
            },
            this);
          
          // Tags are simply added as space-separated text
          this.getChildControl("txtTags").setValue(tags.join(" "));
          break;
          
        case "categories" :
          // Categories need to be selected. In the list, they're not
          // lower-case, so we'll need to convert to lower case as we search
          selection = [];
          this.getChildControl("lstCategories").getChildren().forEach(
            function(listItem)
            {
              // Is this one of the categories that was specified?
              if (qx.lang.Array.contains(data[field].categories, 
                                         listItem.getLabel().toLowerCase()))
              {
                // ... then save this list item as part of the selection
                selection.push(listItem);
              }
            },
            this);
          
          // Now we can set the category list's selection
          this.getChildControl("lstCategories").setSelection(selection);
          break;

        case "authorId":
          this.getChildControl("txtAuthorId").setValue(data[field]);
          break;
          
        case "likes":
          // The first element of the value array is the operator
          selectByValue(this.getChildControl("lstLikesOp"), data[field][0]);
          
          // The second element of the value array is the number
          this.getChildControl("spnLikes").setValue(data[field][1]);
          break;
          
        case "downloads":
          // The first element of the value array is the operator
          selectByValue(this.getChildControl("lstDownloadsOp"), data[field][0]);
          
          // The second element of the value array is the number
          this.getChildControl("spnDownloads").setValue(data[field][1]);
          break;
          
        case "views":
          // The first element of the value array is the operator
          selectByValue(this.getChildControl("lstViewsOp"), data[field][0]);
          
          // The second element of the value array is the number
          this.getChildControl("spnViews").setValue(data[field][1]);
          break;
        }
      }
      
      // Ensure that we're switched to the Specific Fields search page
      this.__radioView.setSelection(
        [
          this.__radioView.getChildren()[bFoundNonBasic ? 1 : 0]
        ] );

      // Initiate the search
      this.__butSearch.execute();
    },

    /**
     * Get a map that corresponds to the current search
     */
    _fireQueryChangedEvent : function(e)
    {
      var             getValue;
      var             fields;
      var             field;
      var             fieldData = {};
      var             data = {};
      var             json;
      var             selectedPage;
      
      // Functions to retrieve each of the types of controls
      getValue =
        {
          "textField" : function(o)
          {
            var ret = o.getValue();
            return ret === null || ret.length == 0 ? null : ret;
          },
          
          "list" : function(o)
          {
            var sel = o.getSelection();
            var ret = sel.length == 0 ? null : sel[0].getLabel();
            return ret === null || ret.length == 0 ? null : ret;
          },
          
          "listMulti" : function(o)
          {
            var ret = o.getSelection().map(
              function(item)
              {
                return item.getLabel();
              });
            return ret.length == 0 ? null : ret;
          },
          
          "spinner" : function(o)
          {
            return o.getValue();
          }
        };

      // If we're doing a basic search, ...
      selectedPage = this.__radioView.getSelection();
      if (selectedPage[0] == this.__radioView.getChildren()[0])
      {
        // ... then retrieve only basic text search field, mapped to the
        // function to retrieve it.
        fields =
          {
            txtTextSearch  : getValue.textField
          };
      }
      else
      {
        // Retrieve all advance fields,, mapped to the function to retrieve them
        fields =
          {
            txtTitle       : getValue.textField,
            txtDescription : getValue.textField,
            txtTags        : getValue.textField,
            txtAuthorId    : getValue.textField,

            lstLikesOp     : getValue.list,
            spnLikes       : getValue.spinner,
            lstDownloadsOp : getValue.list,
            spnDownloads   : getValue.spinner,
            lstViewsOp     : getValue.list,
            spnViews       : getValue.spinner,

            lstCategories  : getValue.listMulti
          };      
      }
      
      // Now do it! For each field...
      for (field in fields)
      {
        // ... call its getValue function with the appropriate control
        fieldData[field] = fields[field](this.getChildControl(field));
      }
      
      // Exclude fields that had null return values, and map to the format we
      // want to return data in.
      qx.lang.Object.getKeys(fieldData).forEach(
        function(field)
        {
          // Is this field null?
          if (fieldData[field] !== null)
          {
            switch(field)
            {
            case "txtTextSearch" :
              // Retrieve the data, convert it to lower case, and remove
              // embedded extra spaces.
              data.text =
                qx.lang.String.trim(fieldData.txtTextSearch.toLowerCase());
              
              // Split into an array of words
              data.text = data.text.split(" ");
              
              // Remove non-unique elements, and then sort
              data.text = qx.lang.Array.unique(data.text).sort();
              break;

            case "txtTitle" :
              // Retrieve the data, convert it to lower case, remove embedded
              // extra spaces, and then split at spaces.
              data.title =
                qx.lang.String.trim(fieldData.txtTitle.toLowerCase());
              
              // Split into an array of words
              data.title = data.title.split(" ");
              
              // Remove non-unique elements, and then sort
              data.title = qx.lang.Array.unique(data.title).sort();
              break;

            case "txtDescription" :
              // Retrieve the data, convert it to lower case, remove embedded
              // extra spaces, and then split at spaces.
              data.description =
                qx.lang.String.trim(fieldData.txtDescription.toLowerCase());
              
              // Split into an array of words
              data.description = data.description.split(" ");
              
              // Remove non-unique elements, and then sort
              data.description = qx.lang.Array.unique(data.description).sort();
              break;
              
            case "txtTags" :
              // Retrieve the data, convert it to lower case, remove embedded
              // extra spaces, and then split at spaces.
              data.tags =
                qx.lang.String.trim(fieldData.txtTags.toLowerCase());
              
              
              // Split into an array of words
              data.tags = data.tags.split(" ");

              // Append any selected categories, convert them to lower case
              if (fieldData.lstCategories !== null)
              {
                fieldData.lstCategories.forEach(
                  function(category)
                  {
                    data.tags.push(category.toLowerCase());
                  });
              }
              
              // Remove non-unique elements, and then sort
              data.tags = qx.lang.Array.unique(data.tags).sort();
              break;
              
            case "txtAuthorId" :
              // Retrieve the data, convert it to lower case, remove embedded
              // extra spaces, and then split at spaces.
              data.authorId =
                qx.lang.String.trim(fieldData.txtAuthorId.toLowerCase());
              break;
              
            case "lstLikesOp" :
              data.likes = 
                [
                  fieldData.lstLikesOp,
                  fieldData.spnLikes 
                ];
              break;
              
            case "lstDownloadsOp" :
              data.downloads =
                [
                  fieldData.lstDownloadsOp, 
                  fieldData.spnDownloads 
                ];
              break;
              
            case "lstViewsOp" :
              data.views =
                [
                  fieldData.lstViewsOp, 
                  fieldData.spnViews 
                ];
              break;
              
            case "lstCategories" :
              // Append any selected categories, convert them to lower case
              if (fieldData.lstCategories !== null)
              {
                data.categories = [];
                fieldData.lstCategories.forEach(
                  function(category)
                  {
                    data.categories.push(category.toLowerCase());
                  });
              }
              break;
            }
          }
        });

      // Convert the return data to JSON
      json = qx.lang.Json.stringify(data);

      // Is there anything here to query with?
      if (json == "{}")
      {
        // Nope. Show an alert and do not fire the event
        dialog.Dialog.alert("No search criteria have been provided.");
      }
      else
      {
        // Fire the event. Pass both the map and the JSON since we know we'll
        // have two listeners, one requring each format.
        this.fireDataEvent("queryChanged", 
                           {
                             data : data,
                             json : json
                           });
      }
    },

    /**
     * Clear all fields
     * 
     * @param bExcludeBasicSearch {Boolean}
     *   If true, do not clear the "all text fields" basic search field
     */
    _clearFields : function(bExcludeBasicSearch)
    {
      var             clear;
      var             fields;
      var             field;
      
      // Functions to clear values from each type of control
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
        // Exclude clearing all-text-fields basic search field, if so requested
        if (bExcludeBasicSearch && field == "txtTextSearch")
        {
          continue;
        }

        // Call its clear function with the appropriate control
        fields[field](this.getChildControl(field));
      }
      
      // Also clear the search results
      this.__searchResults.setModel(null);
    },

    _createChildControlImpl : function(id, hash)
    {
      var             f;
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
            placeholder : "Please enter search words",
            tabIndex    : 1
          });
        
        // Give this field the focus when it appears
        control.addListener(
          "appear",
          function(e)
          {
            this.focus();
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
            placeholder : "Words in apps' title",
            tabIndex    : 2
          });

        f = function(e)
        {
          this.getChildControl("imgTitle").setVisibility(
            e.getTarget().getValue().length > 0 ? "visible" : "hidden");

          // Clear the all-text-fields search
          this.getChildControl("txtTextSearch").setValue("");
        };
        
        control.addListener("input", f, this);
        control.addListener("changeValue", f, this);
        
        // Set the focus to this field when it appears
        control.addListener(
          "appear",
          function(e)
          {
            this.focus();
          });

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
            placeholder : "Words in apps' description",
            tabIndex    : 3
          });

        f = function(e)
        {
          this.getChildControl("imgDescription").setVisibility(
            e.getTarget().getValue().length > 0 ? "visible" : "hidden");

          // Clear the all-text-fields search
          this.getChildControl("txtTextSearch").setValue("");
        };

        control.addListener("input", f, this);
        control.addListener("changeValue", f, this);

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
            placeholder : "Words in apps' tags",
            tabIndex    : 4
          });

        f = function(e)
        {
          this.getChildControl("imgTags").setVisibility(
            e.getTarget().getValue().length > 0 ? "visible" : "hidden");

          // Clear the all-text-fields search
          this.getChildControl("txtTextSearch").setValue("");
        };

        control.addListener("input", f, this);
        control.addListener("changeValue", f, this);

        this.__containerAdvanced._add(control, this.__advConfig.txtTags);
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

      case "txtAuthorId" :
        control = new qx.ui.form.TextField();
        control.set(
          {
            width       : 100,
            placeholder : "Author's unique ID",
            tabIndex    : 5
          });

        f = function(e)
        {
          this.getChildControl("imgAuthorId").setVisibility(
            e.getTarget().getValue().length > 0 ? "visible" : "hidden");

          // Clear the all-text-fields search
          this.getChildControl("txtTextSearch").setValue("");
        };

        control.addListener("input", f, this);
        control.addListener("changeValue", f, this);

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
            width    : 46,
            tabIndex : 6
          });
        
        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgLikes").setVisibility(
              e.getTarget().getSelection()[0].getLabel().length > 0
                ? "visible"
                : "hidden");
            
            // Clear the all-text-fields search
            this.getChildControl("txtTextSearch").setValue("");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstLikesOp);
        break;
        
      case "spnLikes" :
        control = new qx.ui.form.Spinner();
        control.set(
          {
            width    : 100,
            maximum  : 1000000,
            tabIndex : 7
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
            width    : 46,
            tabIndex : 8
          });

        //
        // TEMPORARILY DISABLE until index work is complete
        //
        control.setEnabled(false);

        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgDownloads").setVisibility(
              e.getTarget().getSelection()[0].getLabel().length > 0
                ? "visible"
                : "hidden");
            
            // Clear the all-text-fields search
            this.getChildControl("txtTextSearch").setValue("");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstDownloadsOp);
        break;
        
      case "spnDownloads" :
        control = new qx.ui.form.Spinner();
        control.set(
          {
            width    : 100,
            maximum  : 1000000,
            tabIndex : 9
          });

        //
        // TEMPORARILY DISABLE until index work is complete
        //
        control.setEnabled(false);

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
            width    : 46,
            tabIndex : 10
          });
        
        //
        // TEMPORARILY DISABLE until index work is complete
        //
        control.setEnabled(false);
        
        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgViews").setVisibility(
              e.getTarget().getSelection()[0].getLabel().length > 0
                ? "visible"
                : "hidden");
            
            // Clear the all-text-fields search
            this.getChildControl("txtTextSearch").setValue("");
          },
          this);

        this.__containerAdvanced._add(control, this.__advConfig.lstViewsOp);
        break;
        
      case "spnViews" :
        control = new qx.ui.form.Spinner();
        control.set(
          {
            width    : 100,
            maximum  : 1000000,
            tabIndex : 11
          });

        //
        // TEMPORARILY DISABLE until index work is complete
        //
        control.setEnabled(false);

        this.__containerAdvanced._add(control, this.__advConfig.spnViews);
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
            selectionMode : "multi",
            tabIndex      : 12
          });

        control.addListener(
          "changeSelection",
          function(e)
          {
            this.getChildControl("imgCategories").setVisibility(
              e.getTarget().getSelection().length > 0
                ? "visible"
                : "hidden");
            
            // Clear the all-text-fields search
            this.getChildControl("txtTextSearch").setValue("");
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
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();

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
      layout.setRowAlign(0, "center", "middle");
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
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(18);

      // Add a left spacer to center the other fields
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 0 });

      // Add a right spacer to center the other fields
      container.add(new qx.ui.core.Spacer(10, 10), { row : 0, column : 10 });

      // Add the header
      o = new qx.ui.basic.Label(this.tr("Find apps in which..."));
      o.set(
        {
          font      : font,
          textAlign : "center"
        });
      container.add(o, this.__advConfig.header);
      
      // Add the title label
      o = new qx.ui.basic.Label(this.tr("Title contains"));
      container.add(o, this.__advConfig.lblTitle);

      // Add the description label
      o = new qx.ui.basic.Label(this.tr("Description contains"));
      container.add(o, this.__advConfig.lblDescription);

      // Add the tags label
      o = new qx.ui.basic.Label(this.tr("Tags include"));
      container.add(o, this.__advConfig.lblTags);

      // Add the categories label
      o = new qx.ui.basic.Label(this.tr("Selected categories"));
      container.add(o, this.__advConfig.lblCategories);
      
      // Add the likes label
      o = new qx.ui.basic.Label(this.tr("Likes"));
      container.add(o, this.__advConfig.lblLikes);
      
      // Add the downloads label
      o = new qx.ui.basic.Label(this.tr("Downloads"));

      //
      // TEMPORARILY DISABLE until index work is complete
      //
      o.setEnabled(false);

      container.add(o, this.__advConfig.lblDownloads);
      
      // Add the views label
      o = new qx.ui.basic.Label(this.tr("Views"));

      //
      // TEMPORARILY DISABLE until index work is complete
      //
      o.setEnabled(false);

      container.add(o, this.__advConfig.lblViews);
      
      // Add the author id label
      o = new qx.ui.basic.Label(this.tr("Author ID"));
      container.add(o, this.__advConfig.lblAuthorId);
    }
  }
});
