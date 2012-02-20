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

  extend : qx.core.Object,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             o;
      var             grid;
      var             vbox;
      var             font;

      //
      // The overall layout if a grid, where the left portion has the
      // application information at the top, and comments at the bottom; and
      // the right (narrow) portion has a list of all apps by this author.
      //
      
      // First, create the grid layout
      grid = new qx.ui.layout.Grid(10, 10);
//      grid.setColumnWidth(0, 500);
      grid.setColumnWidth(1, 310);// Fixed column width for by-author list
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);      // Comments take up remaining space
      canvas.setLayout(grid);
      
      // Put the application detail in the top-left
      this.searchResult = new aiagallery.widget.SearchResult("appInfo");
      canvas.add(this.searchResult, { row : 0, column : 0 });
      
      // Prepare a font for the labels
      font = "bold";

      // Create the comments area
      vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      canvas.add(vbox, { row : 1, column : 0 });

      // FIXME: temporary group box
      o = new qx.ui.basic.Label("Comments");
      o.set(
        {
          font          : font,
          paddingBottom : 6
        });
      vbox.add(o);
      this.comments = new qx.ui.groupbox.GroupBox();
      vbox.add(this.comments, { flex : 1 });
      
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
                "owner",
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

            configureItem : function(item) 
            {
              // Listen for clicks on the title or image, to view the app
              item.addListener("viewApp", fsm.eventListener, fsm);
            }
          }
        });

      vbox.add(this.byAuthor, { flex : 1 });
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

        // Enable or disable the Like It! button, depending on whether they've
        // already Liked this app.
        // FIXME
        
        // Add the Download button
        // FIXME
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
