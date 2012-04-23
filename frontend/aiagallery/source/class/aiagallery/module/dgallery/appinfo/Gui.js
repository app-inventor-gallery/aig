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
      var             canvas
      var             o;
      var             grid;
      var             commentsGrid;
      var             vbox;
      var             font;

      //
      // The overall layout if a grid, where the left portion has the
      // application information at the top, and comments at the bottom; and
      // the right (narrow) portion has a list of all apps by this author.
      //
      
      // Put entire page into a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });
      
      // First, create the grid layout
      grid = new qx.ui.layout.Grid(10, 10);
//      grid.setColumnWidth(0, 500);
      grid.setColumnWidth(1, 310);// Fixed column width for by-author list
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);      // Comments take up remaining space
      
      // Finish putting things into the scroller
      var canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(30));
      canvas.setLayout(grid);
      scrollContainer.add(canvas, { flex : 1 });
      
      // Put the application detail in the top-left
      this.searchResult = new aiagallery.widget.SearchResult("appInfo");
      this.__flagItListener =
        this.searchResult.addListener("flagIt", fsm.eventListener, fsm);
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

      o = new qx.ui.basic.Label("Comments");
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
      o = new qx.ui.basic.Atom("Add a comment");
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
          height    : 60,
          maxLength : 1000
        });
      this.textNewComment.addListener("input",
                                      this._onInputOrChange,
                                      this);
      this.textNewComment.addListener("changeValue", 
                                      this._onInputOrChange, 
                                      this);
      fsm.addObject("textNewComment", this.textNewComment);
      commentsGrid.add(this.textNewComment,
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
      
      // Create the by-this-author area
      vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      canvas.add(vbox, { row : 0, column : 1, rowSpan : 2 });

      // Android-green line
      o = new qx.ui.container.Composite();
      o.set(
        {
          height    : 4,
          backgroundColor : "#a5c43c"
        });
      vbox.add(o);

      // Spacer before the label
      vbox.add(new qx.ui.core.Spacer(10, 10));

      o = new qx.ui.basic.Label("By this author");
      o.set(
        {
          font          : font,
          paddingBottom : 6
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

      vbox.add(this.byAuthor, { flex : 1 });
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

      value = qx.lang.String.trim(this.textNewComment.getValue());
      this.butAddComment.setEnabled(!!(value && value.length > 0));
      this.butCancelComment.setEnabled(!!(value && value.length > 0));
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

        // Add the app detail
        this.searchResult.set(result.app);
        
        // Add the other apps by this author. Build a model for the search
        // results list, then add the model to the list.
        model = qx.data.marshal.Json.createModel(result.byAuthor);
        this.byAuthor.setModel(model);

        // Display each of the comments
        result.comments.forEach(
          function(commentData)
          {
            var             comment;
            
            // Create a new comment object for this comment
            comment = new aiagallery.module.dgallery.appinfo.Comment();
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
              alert("No source data found!");
            }
          },
          this);
        break;

      case "addComment":
        // The result contains all of the information about this comment,
        // including the display name of the comment author (the current
        // visitor).
        result = response.data.result;
        
        // Create a new comment object for this comment
        comment = new aiagallery.module.dgallery.appinfo.Comment();
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
          this.__flagItListener = null;
        }
        
        // Reset the cursor
        this.searchResult.getChildControl("flagIt").setCursor("default");
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
