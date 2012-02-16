/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "find apps"" page
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

  members :
  {
    /** Whether FSM events should be temporarily prevented */
    __bPreventFsmEvent : false,

    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             canvas = module.canvas;
      var             vBox;
      var             tabView;
      var             searchResults;
      var             font;
      var             _this;

      // Save the finite state machine reference
      this.__fsm = module.fsm;

      // Make it easy to provide some space around the edges
      canvas.setLayout(new qx.ui.layout.Canvas());

      // The canvas is composed of search and results area, vertically aligned
      vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
      canvas.add(vBox, { edge : 10 });
      
      // The search area is a tabview, for selecting the type of search
      tabView = new aiagallery.widget.radioview.RadioView();
      tabView.addListener(
        "changeSelection",
        function(e)
        {
          // Determine which page was selected
          if (e.getTarget().getSelection()[0] == this.pageTextSearch)
          {
            // It's the text search page, so clear the advanced page
            this._clearAdvanced();
          }
          else
          {
            // The advanced page was selected, so clear text search field
            this.txtTextSearch.setValue("");
          }
          
          // Clear out the search results with an empty model
          if (this.searchResults)
          {
            this.searchResults.setModel(qx.data.marshal.Json.createModel([]));
          }
        },
        this);

      // Use a single row for subtabs
      tabView.setRowCount(1);
      
      // Allow results section to grow or shrink based on tabview page's needs
      tabView.getChildControl("pane").setDynamic(true);
      
      // Add the search option pages
      this.pageTextSearch =
        new aiagallery.widget.radioview.Page(this.tr("Text search"));
      this.pageTextSearch.set(
        {
          layout    : new qx.ui.layout.VBox()
        });
      this._addTextSearch(this.pageTextSearch);
      tabView.add(this.pageTextSearch);
      
      this.pageAdvanced =
        new aiagallery.widget.radioview.Page(this.tr("Advanced"));
      this.pageAdvanced.set(
        {
          layout    : new qx.ui.layout.VBox()
        });
      this._addAdvancedSearch(this.pageAdvanced);
      tabView.add(this.pageAdvanced);
      
      // Add the tabView to the top of the vBox
      vBox.add(tabView);
      
      // Add a bit of space before the search results
      vBox.add(new qx.ui.core.Spacer(10, 10));

      // Add the search results label
      font = qx.bom.Font.fromString("10px sans-serif bold");
      o = new qx.ui.basic.Label("Search Results");
      o.set(
        {
          font : font
        });
      vBox.add(o);

      // Allow access to our GUI from within the delegate functions
      _this = this;

      // Add the list for all of the search results
      this.searchResults = new qx.ui.list.List();
      this.searchResults.set(
        {
          itemHeight : 120,
          labelPath  : "title",
          iconPath   : "image1",
          delegate   :
          {
            createItem : function()
            {
              var             FindApps = aiagallery.module.dgallery.findapps;
              return new FindApps.SearchResult("searchResult");
            },
            
            bindItem : function(controller, item, id) 
            {
              [
                "uid",
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

            configureItem : function(item) 
            {
              // Listen for clicks on the title or image, to view the app
              item.addListener("viewApp",
                               _this.__fsm.eventListener,
                               _this.__fsm);
            }
          }
        });

      vBox.add(this.searchResults, { flex : 1 });
    },

    _clearAdvanced : function()
    {
      // Remove all selections from the category browser
      [
        "browse0",
        "browse1",
        "browse2"
      ].forEach(
        function(listName)
        {
          var             list;
          
          // Do not cause searches to occur while clearing the lists
          this.__bPreventFsmEvent = true;

          list = this.__fsm.getObject(listName);
          if (list)
          {
            list.setSelection( [] );
          }
          
          // Allow normal FSM events again
          this.__bPreventFsmEvent = false;
        },
        this);

      // Clear out the search criteria too
      if (this.butClear)
      {
        this.butClear.execute();
      }
    },

    _addTextSearch : function(container)
    {
      var             hBox;
      var             description;
      var             font;

      container.setLayout(new qx.ui.layout.VBox(10));
      
      // Indent the text using an HBox and spacer
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      container.add(hBox);

      // Describe what this search does
      hBox.add(new qx.ui.core.Spacer(16, 10));
      font = qx.bom.Font.fromString("10px sans-serif bold");
      description = 
        new qx.ui.basic.Label(this.tr("Search for words found in the title, " +
                                      "description, categories, or tags."));
      description.set(
        {
          font : font
        });
      hBox.add(description);
      
      // Create a horizontal box for the simple text search fields
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      container.add(hBox);

      // Indent the search fields a bit
      hBox.add(new qx.ui.core.Spacer(16, 10));

      // Create the text input field
      this.txtTextSearch = new qx.ui.form.TextField();
      this.txtTextSearch.set(
        {
          width : 300
        });
      this.txtTextSearch.addListener("input", this._clearAdvanced, this);
      this.__fsm.addObject("txtTextSearch", this.txtTextSearch);
      hBox.add(this.txtTextSearch);
      
      // Create the button for initiating the search
      this.butTextSearch = new qx.ui.form.Button(this.tr("Search"));
      this.butTextSearch.set(
        {
          maxHeight : 20
        });
      hBox.add(this.butTextSearch);
      this.__fsm.addObject("butTextSearch", this.butTextSearch);
      this.butTextSearch.addListener("execute",
                                     this.__fsm.eventListener,
                                     this.__fsm);
    },

    _addAdvancedSearch : function(container)
    {
      var             vBox;
      var             hBox;
      var             font;
      var             label;
      var             searchCriteriaArr = [];

      // Put the three lists into a horizontal box
      container.setLayout(new qx.ui.layout.HBox(0));

      // Create a vBox to hold the category browser label and lists
      vBox = new qx.ui.container.Composite();
      vBox.setLayout(new qx.ui.layout.VBox());
      container.add(vBox);
      
      // Add the label. Indent the text using an HBox and spacer.
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      vBox.add(hBox);

      // Add the label
      hBox.add(new qx.ui.core.Spacer(16, 10));
      font = qx.bom.Font.fromString("10px sans-serif bold");
      label = 
        new qx.ui.basic.Label(this.tr("Browse categories"));
      label.set(
        {
          font : font
        });
      hBox.add(label);

      // Create the hbox for the browser lists. Indent those lists.
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      hBox.add(new qx.ui.core.Spacer(24, 10));
      vBox.add(hBox);

      // create and add the lists.
      [
        "browse0",
        "browse1",
        "browse2"
      ].forEach(
        function(listName)
        {
          var             list;

          list = new qx.ui.form.List();
          list.set(
            {
              width  : 130,
              height : 124
            });
          
          list.addListener(
            "changeSelection",
            function(e)
            {
              // If we got here from a different event handler...
              if (this.__bPreventFsmEvent)
              {
                // then do nothing
                return;
              }

              // Make a change to the search criteria without generating an
              // FSM event. The event will be generated afterwards
              this.__bPreventFsmEvent = true;

              // Add a new criterion
              this.butClear.execute();
//              butAddCriterion.execute();

              // Ok, allow FSM events from the search criteria again
              this.__bPreventFsmEvent = false;

              qx.lang.Function.bind(
                this.__fsm.eventListener, this.__fsm)(e);
            },
            this);

          hBox.add(list);
          this.__fsm.addObject(listName, list);
        },
        this);

      // Add a spacer to take up the remaining space in the hbox
      container.add(new qx.ui.core.Spacer(20, 10));

      // Begin creating the search gui
      // vbox contains the whole rest of the shabang
      vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());

      // Add the label
      font = qx.bom.Font.fromString("10px sans-serif bold");
      label = 
        new qx.ui.basic.Label(this.tr("Search Criteria"));
      label.set(
        {
          font : font
        });
      vBox.add(label);

      // criteria will house all of the "lines of refinement"
      var criteria = new qx.ui.container.Composite();
      criteria.setLayout( new qx.ui.layout.VBox());
  
      // criteria VBox gets wrapped by Scroll for functionality
      var criteriascroll = new qx.ui.container.Scroll();
      criteriascroll.set(
        {
//          height    : 30,
//          minHeight : 30,
          maxHeight : 90
        });
      criteriascroll.add(criteria, { flex : 1 });
       
      // Start with a single line of refinement
      var myRefineLine = this.buildSearchRefineLine(this.__fsm);
      
      // Store the criteria object in the criteria container
      searchCriteriaArr.push(myRefineLine.criteria);
     
      // Wrapping all stuff relevant to search in one object
      var searchWrapper = new qx.core.Object();
      searchWrapper.setUserData("array", searchCriteriaArr);
      searchWrapper.setUserData("widget",criteria);
      searchWrapper.setUserData(
        "buildRefineFunc", 
        qx.lang.Function.bind(this.buildSearchRefineLine, this));
      
      // Going to need access in reset function to this object by the criteria
      criteria.setUserData("searchObject", searchWrapper);
      
      // Store the search object in the FSM so everyone has access to the data
      this.__fsm.addObject("searchCriteria", searchWrapper);
      
      // And install the container widget
      criteria.add(myRefineLine.widget);
      
      // buttonbar is where the search, reset, and possibly more buttons go
      var buttonbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
      
      var butSearch = new qx.ui.form.Button(this.tr("Search"));
      butSearch.set(
        {
          width : 100
        });
      this.__fsm.addObject("butAdvSearch", butSearch);
      butSearch.addListener(
        "execute",
        function(e)
        {
          // If we got here from a different event handler...
          if (this.__bPreventFsmEvent)
          {
            // then do nothing
            return;
          }

          // Make a change to the search criteria without generating an
          // FSM event. The event will be generated afterwards
          this.__bPreventFsmEvent = true;

          qx.lang.Function.bind(
            this.__fsm.eventListener, this.__fsm)(e);

          // Ok, allow FSM events from the search criteria again
          this.__bPreventFsmEvent = false;
        },
        this);
      buttonbar.add(butSearch);
      
      // Separate the Search button from the others
      buttonbar.add(new qx.ui.core.Spacer(40, 10));

      this.butClear = new qx.ui.form.Button(this.tr("Clear"));
      this.butClear.set(
        {
          width : 100
        });
      this.butClear.addListener(
        "execute",
        function() 
        {
          var searchObj = this.getUserData("searchObject");
          var newLine   = searchObj.getUserData("buildRefineFunc")();

          // Set the Search Criteria Array to an empty array and clean the
          // widget
          searchObj.setUserData("array", []);
          this.removeAll();

          // Add a brand new first line
          this.add(newLine.widget);
          searchObj.getUserData("array").push(newLine.criteria);

        },
        // Pass criteria widget as context so we can access (and clean) it.  
        criteria);
      buttonbar.add(this.butClear);
      
      var butAddCriterion =
        new qx.ui.form.Button(this.tr("Add Criterion"));
      butAddCriterion.set(
        {
          width : 100
        });
      
      // When the button is hit, create a new refinement line
      butAddCriterion.addListener(
        "execute",
        function() 
        {
          // Gather everything we'll need, mostly unpacking the searchObject
          var         searchObject   = this.__fsm.getObject("searchCriteria");
          var         criteriaWidget = searchObject.getUserData("widget");
          var         array          = searchObject.getUserData("array");
          var         newRefineLine  = 
            searchObject.getUserData("buildRefineFunc")();

          // Add the widget to the GUI, and the data to the data array
          criteriaWidget.add(newRefineLine.widget);
          array.push(newRefineLine.criteria);

        }, 
        this);
      buttonbar.add(butAddCriterion);
      
      // Add the Scroll-wrapped criteria on top of the buttonbar
      vBox.add(criteriascroll, { flex : 1 });

      // Add some space before the button bar
      vBox.add(new qx.ui.core.Spacer(10, 10));

      // Add the button bar
      vBox.add(buttonbar);

      container.add(vBox);
    },

/*
    _old_buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             splitpane;
      var             hBox;
      var             vBox;
      var             groupbox;
      var             list;
      var             browse;
      var             gallery;
      var             searchCriteriaArr = [];

      // Create a splitpane. Top: browse and search; bottom: results
      splitpane = new qx.ui.splitpane.Pane("vertical");
      canvas.add(splitpane, { flex : 1 });

      // Create a horizontal box layout for the top pane
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      splitpane.add(hBox, 1);
      
      // Provide a bit of space at the left
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a set of finder-style multi-level browsing lists
      groupbox = new qx.ui.groupbox.GroupBox("Browse by Category");
      groupbox.setLayout(new qx.ui.layout.HBox());
      groupbox.setContentPadding(0);
      hBox.add(groupbox);

      // create and add the lists. Store them in an array.
      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse0", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse1", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse2", list);
      // Finished with the finder-style browser
       
      // Begin creating the search gui
      // groupbox contains the whole rest of the shabang
      groupbox = new qx.ui.groupbox.GroupBox("Search Apps") ;
      groupbox.setLayout( new qx.ui.layout.VBox()) ;

      // criteria will house all of the "lines of refinement"
      var criteria = new qx.ui.groupbox.GroupBox();
      criteria.setLayout( new qx.ui.layout.VBox());
  
      // criteria VBox gets wrapped by Scroll for functionality
      var criteriascroll = new qx.ui.container.Scroll().set(
        {
          height : 330,
          width : 1000
        });
      criteriascroll.add(criteria);
       
      // Start with a single line of refinement
      var myRefineLine = this.buildSearchRefineLine(fsm);
      
      // Store the criteria object in the criteria container
      searchCriteriaArr.push(myRefineLine.criteria);
     
      // Wrapping all stuff relevant to search in one object
      var searchWrapper = new qx.core.Object();
      searchWrapper.setUserData("array", searchCriteriaArr);
      searchWrapper.setUserData("widget",criteria);
      searchWrapper.setUserData("buildRefineFunc", this.buildSearchRefineLine);
      
      // Going to need access in reset function to this object by the criteria
      criteria.setUserData("searchObject", searchWrapper);
      
      // Store the search object in the FSM so everyone has access to the data
      fsm.addObject("searchCriteria", searchWrapper);
      
      // And install the container widget
      criteria.add(myRefineLine.widget);
      
      
      
      // buttonbar is where the search, reset, and possibly more buttons go
      var buttonbar = new qx.ui.groupbox.GroupBox();
      buttonbar.set(
        {
          layout         : new qx.ui.layout.HBox(),
          contentPadding : 3
        });
      
      
      
      var searchbtn = new qx.ui.form.Button("Search On This");
      fsm.addObject("searchBtn", searchbtn);
      searchbtn.addListener("execute", fsm.eventListener, fsm);
      
      var resetbtn = new qx.ui.form.Button("Reset All Fields");
      resetbtn.addListener("execute", function() {
        
        var searchObj = this.getUserData("searchObject");
        var newLine   = searchObj.getUserData("buildRefineFunc")();
        
        // Set the Search Criteria Array to an empty array and clean the widget
        searchObj.setUserData("array", [] );
        this.removeAll();
        
        // Add a brand new first line
        this.add(newLine.widget);
        searchObj.getUserData("array").push(newLine.criteria);
        
      // Pass criteria widget as context so we can access (and clean) it.  
      }, criteria);
      
      var addcriteriabtn = new qx.ui.form.Button("Add Search Criteria");
      
      // When the button is hit, create a new refinement line
      addcriteriabtn.addListener("execute", function() {
        
        // Gather everything we'll need, mostly unpacking the searchObject
        var         searchObject   = this.getObject("searchCriteria");
        var         criteriaWidget = searchObject.getUserData("widget");
        var         array          = searchObject.getUserData("array");
        var         newRefineLine  = 
          searchObject.getUserData("buildRefineFunc")();
        
        // Add the widget to the GUI, and the data to the data array
        criteriaWidget.add(newRefineLine.widget);
        array.push(newRefineLine.criteria);
        
      // Pass the listener the FSM, no other way to get it in there!
      }, fsm);
      
      // Add buttons onto button bar, with a little space
      buttonbar.add(resetbtn);
      buttonbar.add(new qx.ui.core.Spacer(5));
      buttonbar.add(searchbtn);
      buttonbar.add(new qx.ui.core.Spacer(5));
      buttonbar.add(addcriteriabtn);
      
      // Finally, add the Scroll-wrapped criteria on top of the buttonbar
      groupbox.add(criteriascroll, { flex : 1 });
      groupbox.add(buttonbar);

      groupbox.getChildControl("frame").setBackgroundColor("white");

      // End search gui by adding it to hBox
      hBox.add(groupbox, {flex : 1});

      // Provide a bit of space at the right
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a vertical box layout for the bottom pane
      vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      splitpane.add(vBox, 2);
      
      // Display 
      gallery = new aiagallery.widget.virtual.Gallery();
      gallery.addListener("changeSelection", fsm.eventListener, fsm);
      fsm.addObject("gallery", gallery);
      vBox.add(gallery, { flex : 1 });
    },
*/

    /**
     * Construct and return a search refining line
     * 
     * @param FSM object
     * 
     * @return new container with the empty search refining form
     */
    
    buildSearchRefineLine : function() {
      
      var       lineHBox;
      var       attrSelect;
      var       qualSelect;
      var       valueField;
      var       deletebtn;
      var       criteriaObject;
      
      // This HBox will contain an entire line of refinement
      lineHBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
      
      // Create the Attribute Select Box
      attrSelect = new qx.ui.form.SelectBox();
      
      // Store some attributes in it, using the model for a switch in the FSM
      attrSelect.add(new qx.ui.form.ListItem(this.tr("All Text Fields"),
                                             null,
                                             "alltext"));      
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Category or Tag"),
                                             null,
                                             "tags"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Title"),
                                             null,
                                             "title"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Description"),
                                             null,
                                             "description"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Likes >"),
                                             null,
                                             "likesGT"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Likes <"),
                                             null,
                                             "likesLT"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Likes ="),
                                             null,
                                             "likesEQ"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Downloads >"),
                                             null,
                                             "downloadsGT"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Downloads <"),
                                             null,
                                             "downloadsLT"));
      attrSelect.add(new qx.ui.form.ListItem(this.tr("Downloads ="),
                                             null,
                                             "downloadsEQ"));
      
      //attrSelect.add(new qx.ui.form.ListItem("Date Created", null,
      //"creationTime"));
      
/*      
      // Change qualifier choices when attribute is selected
      attrSelect.addListener("changeSelection",
        function()
        {
          var qualMap = {};
          var qualifier;
          
          // Remove all existing qualifiers first                      
          qualSelect.removeAll();

          // Supply appropriate qualifiers, depending on the attribute selected
          // Mapping qualifier label to model, for clarity
          switch (attrSelect.getSelection()[0].getModel())
          {
          case "tags":
          case "title":
          case "description":
            qualMap = 
              {
                "contains"   : "~",
                "is exactly" : "="
              };
            break;

          case "numLikes":
          case "numDownloads":
            qualMap = 
              {
                "greater than" : ">",
                "less than"    : "<",
                "is exactly"   : "="
              };
            break;

          }
         
          // Add the qualifiers as described in the map
          for (qualifier in qualMap)
          {
            qualSelect.add(new qx.ui.form.ListItem(qualifier,
                                                   null,
                                                  qualMap[qualifier]));
          }
          
        });
*/
      
      // Create the Qualifier Select Box
      qualSelect = new qx.ui.form.SelectBox();
      
      // Store some qualifiers in it
      // NOTE: Attempting to use the model as a switch for which OP to use
      qualSelect.add(new qx.ui.form.ListItem("is exactly", null, "="));
      qualSelect.add(new qx.ui.form.ListItem("contains", null, "~"));
      
      // Create the field for the value to compare against
      valueField = new qx.ui.form.TextField();
      
      // Create a button to delete this line
      deletebtn = new qx.ui.form.Button("-");
      deletebtn.addListener("execute", function() {
        
        // Hit the "deleted" switch, to make sure this isn't part of the query
        this.getUserData("myCriteria").deleted = true;
        // Remove this from the GUI
        this.destroy();
        
      // Add lineHBox as the context, so we can manipulate it.
      }, lineHBox);
      
      // Add boxes in the correct order, with a little space separating them.
      lineHBox.add(attrSelect);
//      lineHBox.add(qualSelect);
      lineHBox.add(valueField, { flex : 1 });
      lineHBox.add(deletebtn);
      
      // Create an object to easily access all of the selections
      criteriaObject = 
      {
        attributeBox  : attrSelect,
        qualifierBox  : qualSelect,
        valueBox      : valueField,
        deleted       : false
      };
     
      // Give a reference to the groupbox so that it can deal with a delete.
      lineHBox.setUserData("myCriteria", criteriaObject);
     
      // Finally give'm what they came for.
      return {
        "widget"   : lineHBox,
        "criteria" : criteriaObject
      };
      
    },
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             apps;
      var             categories;
      var             tagMap;
      var             tagList;
      var             excludeTags;
      var             browse0 = fsm.getObject("browse0");
      var             browse1 = fsm.getObject("browse1");
      var             browse2 = fsm.getObject("browse2");
      var             querySource = rpcRequest.getUserData("querySource");
      var             model;
      var             nextList;
      var             selection;
      var             parent;

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getCategoryTags":
        response.data.result.forEach(
          function(tag)
          {
            // Add this tag to the list.
            browse0.add(new qx.ui.form.ListItem(tag));
          });
        break;
      
      case "intersectKeywordAndQuery":
        // Retrieve the app list and list of categories
        apps = response.data.result;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.searchResults.setModel(model);
        break;
        
        
      case "appQuery":
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;
        categories = response.data.result.categories;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.searchResults.setModel(model);
        
        if (querySource != "searchBtn")
        {
          // Create a list of tags to exclude from this next level
          excludeTags = [];

          // Get the previous selections
          switch(querySource)
          {          
          case "browse1":
            selection = browse1.getSelection();
            if (selection.length > 0)
            {
              excludeTags.push(selection[0].getLabel());
            }
            // fall through

          case "browse0":
            selection = browse0.getSelection();
            if (selection.length > 0)
            {
              excludeTags.push(selection[0].getLabel());
            }
            // fall through
            
          case "browse2":
            // nothing to do
            break;
          }
          
          // Set up tags to be inserted in the list one to the right
          switch(querySource)
          {
          case "browse0":
            nextList = browse1;
            break;
            
          case "browse1":
            nextList = browse2;
            break;
          
          case "browse2":
            // nothing to do
            break;
          }
          // Create a single list of all of the resulting tags
          tagMap = {};
          for (var app = 0; app < apps.length; app++)
          {
            apps[app].tags.forEach(
              function(tag)
              {
                // If this tag is not a category
                tagMap[tag] = true;
              });
          }
          
          // Remove any items from the tag list that are already selected
          excludeTags.forEach(
            function(tag)
            {
              delete tagMap[tag];
            });

          // Convert the map into a tag list, and sort it.
          tagList = qx.lang.Object.getKeys(tagMap).sort();
          
          if (nextList)
          {
            // Add each tag to the next list
            tagList.forEach(
              function(tag)
              {
                nextList.add(new qx.ui.form.ListItem(tag));
              });
          }
        }
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
