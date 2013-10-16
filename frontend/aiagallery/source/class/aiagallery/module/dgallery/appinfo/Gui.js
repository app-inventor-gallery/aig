/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#require(aiagallery.module.dgallery.appinfo.Jsqr)
#ignore(JSQR)
*/

/**
 * The graphical user interface for the individual application pages
 */

qx.Class.define("aiagallery.module.dgallery.appinfo.Gui",
{

  // Declares resources to be used for icons

  extend : qx.ui.core.Widget,

  members :
  {
    __likeItListener : null,
    __flagItListener : null,

    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             fsm = module.fsm;
      var             outerCanvas = module.canvas;
      var             canvas; 
      var             o;
      var             grid;
      var             commentsGrid;
      var             vbox;
      var             font;
      var             vBoxComments;
      var             commentBoxAndCountLayout;
      var             scrollContainer; 


      this.fsm = fsm;

      //
      // The overall layout if a grid, where the left portion has the
      // application information at the top, and comments at the bottom; and
      // the right (narrow) portion has a list of all apps by this author.
      // The right portion also has a list of apps by tags.
      //
      
      // Put entire page into a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      scrollContainer = new qx.ui.container.Scroll();
 
      // Align to left of module
      scrollContainer.setAlignX("right"); 

      outerCanvas.add(scrollContainer, { flex : 1 });
      
      // First, create the grid layout
      grid = new qx.ui.layout.Grid(10, 10);
//      grid.setColumnWidth(0, 500);
      grid.setColumnWidth(1, 310);// Fixed column width for by-author list
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);      // Comments take up remaining space
      //canvas.setLayout(grid);
      
      // Finish putting things into the scroller
      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(30));
      canvas.setLayout(grid);
      scrollContainer.add(canvas, { flex : 1 });

      // Put the application detail in the top-left
      this.searchResult = new aiagallery.widget.SearchResult("appInfo");
      fsm.addObject("searchResult", this.searchResult);
      canvas.add(this.searchResult, { row : 0, column : 0 });
      
      // Prepare a font for the labels
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(18);

      // Lay out the comments section in a grid
      grid = new qx.ui.layout.Grid(10, 0);
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);
      commentsGrid = new qx.ui.container.Composite(grid);
      canvas.add(commentsGrid, { row : 1, column : 0 });


      o = new qx.ui.basic.Label(this.tr("Comments"));
      o.set(
        {
          font          : font,
          paddingBottom : 6
        });
      commentsGrid.add(o, { row : 0, column : 0, colSpan : 3 });

      // Create the scroller to hold all of the comments
      o = new qx.ui.container.Scroll();
      commentsGrid.add(o, { row : 1, column : 0, colSpan : 3 });
      
      // The Scroller may contain only one container, so create that container.
      this.commentsScrollContainer = 
        new qx.ui.container.Composite(new qx.ui.layout.VBox());
      o.add(this.commentsScrollContainer);

      // Add a label for adding a new comment
      o = new qx.ui.basic.Atom(this.tr("Add a comment"));
      o.set(
        {
          font          : font,
          marginTop     : 10,
          paddingBottom : 6
        });
      commentsGrid.add(o, { row : 2, column : 0, colSpan : 3 });

      // Add a text field for the new comment
      this.textNewComment = new qx.ui.form.TextArea();
      this.textNewComment.set(
        {
          height        : 60,
          maxLength     : aiagallery.dbif.Constants.FieldLength.Comment,
          placeholder   : this.tr("Talk about this app")
        });
      this.textNewComment.addListener("input",
                                      this._onInputOrChange,
                                      this);
      this.textNewComment.addListener("changeValue", 
                                      this._onInputOrChange, 
                                      this);
      fsm.addObject("textNewComment", this.textNewComment);

      // Implement and add updating label to tell a user how many
      // characters they have left
      this.commentCountLabel = new qx.ui.basic.Label(
		  this.tr("480 Characters Left"));

      // Layout to hold count and text area
      this.commentBoxAndCountLayout = new qx.ui.layout.VBox();
      this.commentBoxAndCountLayout.setSpacing(5);      
      vBoxComments = new qx.ui.container.Composite(
		  this.commentBoxAndCountLayout);

      // Add both count label and comment text area to this layout
      vBoxComments.add(this.textNewComment);
      vBoxComments.add(this.commentCountLabel);   

      commentsGrid.add(vBoxComments,
                       { row : 3, column : 0, colSpan : 3 });
      
      // Add the Add button
      this.butAddComment = new qx.ui.form.Button(this.tr("Add"));
      this.butAddComment.set(
        {
          enabled   : false     // initially disabled
        });
      fsm.addObject("butAddComment", this.butAddComment);
      this.butAddComment.addListener("execute", fsm.eventListener, fsm);
      commentsGrid.add(this.butAddComment, { row : 4, column : 1 });
      
      // Add the Cancel button
      this.butCancelComment = new qx.ui.form.Button(this.tr("Cancel"));
      this.butCancelComment.set(
        {
          enabled   : false     // initially disabled
        });
      this.butCancelComment.addListener(
        "execute",
        function(e)
        {
          this.textNewComment.setValue("");
        },
        this);
      commentsGrid.add(this.butCancelComment, { row : 4, column : 2 });

      // Add a label to tell a user to log in
      // will only be shown if a user is not logged in
      this.logInToCommentLabel = 
        new qx.ui.basic.Label(this.tr("Login to comment"));

      commentsGrid.add(this.logInToCommentLabel, { row : 5, column : 0 });

      // Initialize a tabview for both byAuthor and byTags
      this.tagTabView = new qx.ui.tabview.TabView();
      this.tagTabView.setWidth(350);
      this.tagTabView.setHeight(500);
      this.tagTabView.setMaxHeight(1000);
      this.tagTabView.setContentPadding(0, 0, 0, 0);
      

      // Create the by-this-author area
      vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      canvas.add(vbox, { row : 0, column : 1, rowSpan : 2 });
      
      // A label for reminding users what to do
      this.sidebarLabel = new qx.ui.basic.Label(
		  this.tr("Check out related apps below!"));
      this.sidebarLabel.set(
        {
          font          : font,
          rich         : true,
          width        : 350,
          paddingBottom : 6
        });
      vbox.add(this.sidebarLabel);


      // Create the main layout for tag container
      var mainLayout = new qx.ui.layout.VBox();
      mainLayout.setSpacing(10);

      // A container created specifically for tags
      this.tagContainer = new qx.ui.container.Composite(mainLayout);

      var tagLabel = new qx.ui.basic.Label(
		  this.tr("Select tags below to find out similar apps:"));
      this.tagContainer.add(tagLabel);
      
      vbox.add(this.tagContainer);


      // Android-green line
      o = new qx.ui.container.Composite();
      o.set(
        {
          height    : 4,
          backgroundColor : "#a5c43c"
        });
      vbox.add(o);


      // Add the list for other apps by this author
      this.byAuthor = new qx.ui.list.List();
      this.byAuthor.set(
        {
          itemHeight : 130,
          labelPath  : "title",
          iconPath   : "image1",
          delegate   :
          {
            createItem : function()
            {
              return new aiagallery.widget.SearchResult("byAuthor");
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
                "displayName"
              ].forEach(
                function(name)
                {
                  controller.bindProperty(name, name, null, item, id);
                });
            },

            configureItem : qx.lang.Function.bind(
              function(item) 
              {
                // Listen for clicks on the title or image, to view the app
                item.addListener("viewApp", fsm.eventListener, fsm);
              },
              this)
          }
        });



      vbox.add(this.byAuthor, {flex: 1});
      this.byAuthorModel = {};

    },


    /**
     * Event handler for input or changeValue events. Enables or disables the
     * Add and Cancel buttons depending on whether text has been entered.
     * 
     * @param e {qx.event.type.Event}
     *   Unused
     */
    _onInputOrChange : function(e)
    {
      var             value;
      var             charsLeft;

      // Disable or enable buttons based on how much text is entered
      // into the text area
      value = qx.lang.String.trim(this.textNewComment.getValue());
      this.butAddComment.setEnabled(!!(value && value.length > 0));
      this.butCancelComment.setEnabled(!!(value && value.length > 0));

      // Update label as text is entered
      charsLeft = Math.abs(aiagallery.dbif.Constants.FieldLength.Comment - 
		  value.length);
      this.commentCountLabel.setValue(charsLeft.toString() + 
	  this.tr(" Characters Left"));
    },


    // Tags related event handler
    _onChangeSelection : function(e)
    {
      // Parse the tag name of selected item
      var selectedButton = e.getData()[0];
      var tagName = selectedButton.getLabel();
      // Need to access this piece of data on the fsm
      this.fsm.addObject("selectedButton", selectedButton, 
	  "main.fsmUtils.disable_during_rpc");
      console.log(tagName);
      console.log(this.fsm);
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
      var             canvas = module.canvas;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;
      var             source;
      var             model;
      var             comment;
      var             warningText;
      var             who; 

      if (response.type == "failed")
      {
        // FIXME: Add the failure to someplace reasonable, instead of alert()
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getAppInfo":
        // Get the result data. It's an object with all of the application info.
        // result contains:
        //   app           : requested fields of AppInfo
        //   bAlreadyLiked : boolean to help enable/disable Like It button
        //   comments      : list of comments on this app
        //   byAuthor      : ApppInfo array of other apps by this author

        result = response.data.result;
        

        // Retrieve and save the source file URL... then delete it from the
        // app data. We'll use it for the Download button
        source = result.app.source;
        delete result.app.source;

//        result.app.tagsdesc = "This app is tagged with: ";
//        result.app.tagsline = [result.appTags].join("");

        // Add the app detail
        this.searchResult.set(result.app);
        


        // Generate tagging sidebar(s) based on specific tags of this app
        var tagsHolder = result.appTags;
        // var tlHolder = result.appTagsLists;
        // alert(tlHolder[0].length);

        // Create a manager for tag radio buttons' event binding
        var tagSelect = new qx.ui.form.RadioButtonGroup();
        tagSelect.setLayout(new qx.ui.layout.Flow());

        // Manually add a radio button for "By this author"
        var tagButton = new qx.ui.form.RadioButton(
			this.tr("Apps by this author"));
        tagButton.setMarginRight(5);
        tagSelect.add(tagButton);

        // Create a tag radio button for each of the tags, add to container
        for (var i = 0; i < tagsHolder.length; i++) {
          // Add the tag radio button to the manager
          tagButton = new qx.ui.form.RadioButton(tagsHolder[i]);
          tagButton.setMarginRight(5);
          tagSelect.add(tagButton);
        }
        this.tagContainer.add(tagSelect);
        
        // Add a listener to the "changeSelected" event
//        tagSelect.addListener("changeSelection", this._onChangeSelection, this);
        tagSelect.addListener("changeSelection", 
		this.fsm.eventListener, this.fsm);

        // We'll be receiving events on the object so save its name on fsm
        this.fsm.addObject("tagSelect", tagSelect, 
		"main.fsmUtils.disable_during_rpc");

        // Add the other apps by this author. Build a model for the search
        // results list, then add the model to the list.
        model = qx.data.marshal.Json.createModel(result.byAuthor);
        // console.log("PASSING BYAUTHOR"); 
		// console.log(result.byAuthor);
        // Save this as global variable for later
        this.byAuthorModel = result.byAuthor;
        // this.byAuthor.setModel(byAuthorModel);
        this.byAuthor.setModel(model);


        // By default, load the app list of the first tag into tabview page
        // model = qx.data.marshal.Json.createModel(result.appTagsLists[0]);
        // this.byTag.setModel(model);
        // Also change tabview page's label (name) to the tag's name
        // var tagTabLabel = ["Apps by tag ", tagsHolder[0]].join("");
        // this.byTagTab.setLabel(tagTabLabel);

/*
        var sidebarText = 
        [
          "This app is tagged with ",
          tagsHolder,
          ". Check out the similarly tagged apps in the sidebar below!"
        ].join("");
        this.sidebarLabel.setFont(new qx.bom.Font(16));
        this.sidebarLabel.setValue(sidebarText);


        for (var i = 0; i < tagsHolder.length; i++)
        {
          var tagTabHolder = new qx.ui.tabview.Page(
            tagsHolder[i], "aiagallery/test.png");
          tagTabHolder.setLayout(new qx.ui.layout.VBox());
          tagTabHolder.setShowCloseButton(true);

          // Add the list for other apps by the tags
          var byTagsHolder = new qx.ui.list.List();
          byTagsHolder.set(
            {
              itemHeight : 130,
              labelPath  : "title",
              iconPath   : "image1",
              delegate   :
              {
                createItem : function() {
                  return new aiagallery.widget.SearchResult("byAuthor");
              },
            
              bindItem : function(controller, item, id) {
                [
                  "uid",
                  "image1",
                  "title",
                  "numLikes",
                  "numDownloads",
                  "numViewed",
                  "numComments",
                  "displayName"
                ].forEach(
                  function(name) {
                    controller.bindProperty(name, name, null, item, id);
                  });
              },

              configureItem : qx.lang.Function.bind(
                function(item) 
                {
                  // Listen for clicks on the title or image, to view the app
                  item.addListener("viewApp", fsm.eventListener, fsm);
                },
                this)
            }
          });

          tagTabHolder.add(byTagsHolder, {flex : 1});

          // Add the other apps by tags. Build a model for the search
          // results list, then add the model to the list.
          model = qx.data.marshal.Json.createModel(tlHolder[i]);
          byTagsHolder.setModel(model);

          this.tagTabView.add(tagTabHolder);

        }
*/


        // Display each of the comments
        result.comments.forEach(
          function(commentData)
          {
            var             comment;
            
            // Create a new comment object for this comment
            comment = new aiagallery.module.dgallery.appinfo.Comment
              (null, fsm, commentData.treeId, 
               commentData.app, false, commentData.flaggedByThisUser);
            comment.setText(commentData.text);
            comment.setDisplayName(commentData.displayName);
            comment.setTimestamp(commentData.timestamp);
          
            // Add it to the scroll container
            this.commentsScrollContainer.add(comment);
          },
          this);

        // Enable or disable the Like It! button, depending on whether they've
        // already Liked this app.
        if (result.bAlreadyLiked)
        {
          // He already liked it. Change the label.
          this.searchResult.getChildControl("likeIt").set(
            {
              value : this.tr("You liked it!"),
              font  : "default"
            });
        }
        else
        {
          // He hasn't liked it, so listen for a likeIt event
          this.__likeItListener =
            this.searchResult.addListener("likeIt", fsm.eventListener, fsm);
        }
        
        // Enable or disable the flag button, depending on whether they've
        // already flagged this app.
        if (result.bAlreadyFlagged)
        {
          // He already flagged it. Change the label.
          this.searchResult.getChildControl("flagIt").set(
            {
              value : this.tr("Flagged as inappropriate."),
              font  : "default"
            });
        }
        else
        {
          // He hasn't flagged it, so listen for a flag event
          this.__flagItListener =
            this.searchResult.addListener("flagIt", fsm.eventListener, fsm);
        }
        
        // Arrange to download the source when the download button is clicked
        this.searchResult.addListener(
          "download",
          function(e) 
          {
            var             appId = fsm.getObject("searchResult").getUid();
            var             url;

            if (source && source[0])
            {
              if (qx.core.Environment.get("qx.debug"))
              {
                alert("Would be downloading blob " + source[0]);
              }
              else
              {
                this.searchResult.setNumDownloads(
                  this.searchResult.getNumDownloads() + 1);
                url =
                  location.protocol + "//" +
                  location.host + 
                  location.pathname +
                  "rpc?getblob=" + source[0] + ":" + appId;
                this.debug("Sending to url: " + url);
                
                if (this.iframe)
                {
                  document.body.removeChild(this.iframe);
                  this.iframe = null;
                }
                
                this.iframe = document.createElement("iframe");
                this.iframe.src = url;
                this.iframe.style.display = "none";
                document.body.appendChild(this.iframe);
              }
            }
            else
            {
              alert(this.tr("No source data found!"));
            }
          },
          this);

        // Based on whether the user is logged in or not
        // Disable the add comment button
        who = qx.core.Init.getApplication().getUserData("whoAmI");
        
        if(who.getIsAnonymous())
        {
          // Remove the comment buttons and field
          this.butAddComment.destroy();
          this.butCancelComment.destroy(); 
          this.textNewComment.destroy(); 
          this.commentCountLabel.destroy();

          // Disable flag and likeit buttons
          this.searchResult.getChildControl("likeIt").set(
            {
              value : this.tr("Login to like!"),
              font  : "default"
            });
        
          // Remove the listener.
          if (this.__likeItListener !== null)
          {
            this.searchResult.removeListenerById(this.__likeItListener);
            this.__likeItListener = null;
          }

          // Reset the cursor
          this.searchResult.getChildControl("likeIt").setCursor("default");

          // Replace the label
          this.searchResult.getChildControl("flagIt").set(
            {
              value : this.tr("Login to flag!"),
              font  : "default"
            });
        
          // Remove the listener.
          if (this.__flagItListener !== null)
          {
            this.searchResult.removeListenerById(this.__flagItListener);
            this.__flagItListener = null;
          }

          // Reset the cursor
          this.searchResult.getChildControl("flagIt").setCursor("default");
        } 
        else 
        {
          // Remove the login label (user is logged in)
          this.logInToCommentLabel.destroy(); 
        }

        break;

      case "byAuthorResponse":
        var bAModel = qx.data.marshal.Json.createModel(this.byAuthorModel);
        this.byAuthor.setModel(bAModel);
        break;


      case "tagResponse":
        result = response.data.result;

        /*
        console.log("Captured tagResponse");
        console.log(result);
        console.log("Captured tagName");
        console.log(result[1]);
        */
/*
        // Change the name of the tabview page
        var tagTabLabel = ["Apps by tag ", result[1]].join("");
        this.byTagTab.setLabel(tagTabLabel);
        // Since we cannot do auto-focus, let's change icon to make it obvious
        this.byTagTab.setIcon("aiagallery/search.png");
*/
        // Add the other apps by tags. Build a model for the search
        // results list, then add the model to the list.
        var tagmodel = qx.data.marshal.Json.createModel(result[0]);
        this.byAuthor.setModel(tagmodel);
        break;


      case "addComment":
        // The result contains all of the information about this comment,
        // including the display name of the comment author (the current
        // visitor).
        result = response.data.result;
        
        // Create a new comment object for this comment
        comment = new aiagallery.module.dgallery.appinfo.Comment
          (null, fsm, result.treeId, result.app);
        comment.setText(result.text);
        comment.setDisplayName(result.displayName);
        comment.setTimestamp(result.timestamp);

        // Add it to the scroll container
        this.commentsScrollContainer.addAt(comment, 0);
        
        // Clear the input field
        this.textNewComment.setValue("");
        break;

      case "likesPlusOne":
        // Replace the label
        this.searchResult.getChildControl("likeIt").set(
          {
            value : this.tr("You liked it!"),
            font  : "default"
          });
        
        // Remove the listener.
        if (this.__likeItListener !== null)
        {
          this.searchResult.removeListenerById(this.__likeItListener);
          this.__likeItListener = null;
        }
        
        // Reset the cursor
        this.searchResult.getChildControl("likeIt").setCursor("default");
        
        // Update the count of likes
        this.searchResult.setNumLikes(response.data.result);
        break;
        
      case "flagIt":
        // Replace the label
        this.searchResult.getChildControl("flagIt").set(
          {
            value : this.tr("Flagged as inappropriate."),
            font  : "default"
          });
        
        // Remove the listener.
        if (this.__flagItListener !== null)
        {
          this.searchResult.removeListenerById(this.__flagItListener);

          // Remove click listener from label
          this.searchResult.getChildControl("flagIt")
            .removeListenerById(this.searchResult.eventList); 
          this.__flagItListener = null;
        }
        
        // Reset the cursor
        this.searchResult.getChildControl("flagIt").setCursor("default");

         // Display message that app has been flagged
        warningText = this.tr("This app has been flagged.") +
                      this.tr(" An admin will review it.");
        
        dialog.Dialog.warning(warningText); 

        break;

      case "flagComment" :
         // Display message that comment has been flagged
        warningText = this.tr("This comment has been flagged.") +
                      this.tr(" An admin will review it.");
        
        dialog.Dialog.warning(warningText); 
        break; 
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});


