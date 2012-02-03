/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the temporary testing page
 */
qx.Class.define("aiagallery.module.dgallery.myapps.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

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
      var             o;
      var             app;
      var             hBox;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             header;

      this.group = new qx.ui.form.RadioGroup();
      this.group.setAllowEmptySelection(true);

      canvas.setLayout(new qx.ui.layout.VBox());

      // Add an Add New Apps button, left-justified
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      o = new qx.ui.form.Button("Add New Application");
      o.addListener(
        "execute",
        function(e)
        {
          var             app = null;
          var             children;

          // Obtain the first app (if there is one) to see if it's our one and
          // only new app editor
          children = this.scrollCanvas.getChildren();
          if (children.length != 0 && children[0].getUid() === null)
          {
            // Found an existing new app editor. Retrieve it.
            app = children[0];
          }
          else
          {
            // No existing new app editor. Instantiate a new one.
            app = new aiagallery.widget.mystuff.App(fsm);
            app.setGroup(this.group);
            app.set(
              {
                numLikes     : 0,
                numDownloads : 0,
                numViewed    : 0,
                numComments  : 0,
                status       : aiagallery.dbif.Constants.Status.Editing
              });
          }

          // Scroll the app editor into view
          this.scrollCanvas.addAt(app, 0);

          // Be sure it's open
          app.setValue(true);
        },
        this);
      hBox.add(o);
      hBox.add(new qx.ui.core.Spacer(), { flex : 1 });
      canvas.add(hBox);

      // Leave a bit of space
      canvas.add(new qx.ui.core.Spacer(12, 12));

      // Create a header
      header = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      
      function setAttrs(o, width, otherOptions)
      {
        var             text;

        // Set the exact width
        o.set(
          {
            width    : width,
            minWidth : width,
            maxWidth : width
          });
        
        // Add other attributes
        if (otherOptions)
        {
          o.set(otherOptions);
        }
        
        // Make the label bold
        if (o instanceof qx.ui.basic.Label)
        {
          text = o.getValue();
          o.set(
            {
              rich  : true,
              value : "<span style='font-weight:bold;'>" + text + "</span>"
            });
        }
      }

      // Create the header based on the widths of the summary fields
      o = new qx.ui.core.Spacer(); // no label for icon
      setAttrs(o, aiagallery.widget.mystuff.Summary.Width.icon);
      header.add(o);

      o = new qx.ui.core.Spacer(); // no label for image
      setAttrs(o, aiagallery.widget.mystuff.Summary.Width.image1);
      header.add(o);

      o = new qx.ui.basic.Label("Title");
      setAttrs(o, aiagallery.widget.mystuff.Summary.Width.title);
      header.add(o);

      o = new qx.ui.basic.Label("Status");
      setAttrs(o, aiagallery.widget.mystuff.Summary.Width.status);
      header.add(o);

      o = new qx.ui.basic.Label("Likes");
      setAttrs(o,
               aiagallery.widget.mystuff.Summary.Width.numLikes,
               { textAlign : "right" });
      header.add(o);

      o = new qx.ui.basic.Label("Downloads");
      setAttrs(o,
               aiagallery.widget.mystuff.Summary.Width.numDownloads,
               { textAlign : "right" });
      header.add(o);

      o = new qx.ui.basic.Label("Views");
      setAttrs(o,
               aiagallery.widget.mystuff.Summary.Width.numViewed,
               { textAlign : "right" });
      header.add(o);

      o = new qx.ui.basic.Label("Comments");
      setAttrs(o,
               aiagallery.widget.mystuff.Summary.Width.numComments,
               { textAlign : "right" });
      header.add(o);
      
      canvas.add(header);
      
      // Initially the header should be invisible, until adding apps
      // (children) causes it to become visible
      header.setVisibility("excluded");

      // Create a scroll container for all of the apps' collapsable panels
      o = new qx.ui.container.Scroll();
      canvas.add(o, { flex : 1 });
      
      // The scroll container can only have a single widget as its content, so
      // create a scroll canvas to which we'll add each of the apps.
      this.scrollCanvas =
        new qx.ui.container.Composite(new qx.ui.layout.VBox());
      o.add(this.scrollCanvas);
      
      // Make the header visible or not depending on whether there are any
      // applications in the scroll canvas.
      function setHeaderVisibility(e)
      {
        header.setVisibility(this.scrollCanvas.getChildren().length > 0
                             ? "visible"
                             : "excluded");
      }

      this.scrollCanvas.addListener(
        "addChildWidget",
        setHeaderVisibility, 
        this);

      this.scrollCanvas.addListener(
        "removeChildWidget",
        setHeaderVisibility, 
        this);
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
      var             app;
      var             data;
      var             prop;
      var             availableProperties;

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
      case "getAppList":
        // Remove everything that's already in the scroll canvas
        this.scrollCanvas.removeAll();

        // Save the category list in a known place, for later access
        this.getApplicationRoot().setUserData("categories",
                                              response.data.result.categories);

/*
        // Add a test entry with no image or source file name
        (qx.lang.Function.bind(
           function()
           {
             var             app;

             app = new aiagallery.widget.mystuff.App(fsm);
             app.setGroup(this.group);
             app.set(
               {
                 title        : "The original Adventure game",
                 description  : "'You are in a twisty maze of passages, all alike.' This is an Android version of the 1970's Adventure game. Use the Android keyboard or voice recognition to navigate through the caves.",
                 status       : aiagallery.dbif.Constants.Status.Incomplete,
                 tags         : 
                 [
                   "Games",
                   "Internet",
                   "adventure",
                   "old-school" 
                 ],
                 numLikes     : 42,
                 numDownloads : 675,
                 numViewed    : 78923,
                 numComments  : 8
               });
             this.scrollCanvas.add(app);
           },
           this))();
*/

        // Add each of the apps
        response.data.result.apps.forEach(
          function(appData)
          {
            var             app;
            var             usefulAppData = {};
            var             usefulFields =
              [
                "uid",
                "image1", 
                "title", 
                "description", 
                "status", 
                "numLikes", 
                "numDownloads", 
                "numViewed", 
                "numComments", 
                "tags", 
                "sourceFileName"
              ];
            
            // Get a new app element to display this app's data
            app = new aiagallery.widget.mystuff.App(fsm);
            
            // Ensure only one app is open at a time. Add to the radio group.
            app.setGroup(this.group);
            
            // Copy all of the useful fields of app data
            usefulFields.forEach(
              function(field)
              {
                usefulAppData[field] = appData[field];
              });

            // Set this app's data
            app.set(usefulAppData);
            
            // Add it to the scrolling canvas
            this.scrollCanvas.add(app);

            // Leave the app in the closed state
            app.setValue(false);
          },
          this);
        break;
        
      case "addOrEditApp":
        // Retrieve the App object to which this request applied
        app = rpcRequest.getUserData("App");
        
        // Strip out fields that we don't have properties for in the GUI
        data = response.data.result;
        availableProperties = qx.Class.getProperties(app.constructor);
        for (prop in data)
        {
          if (! qx.lang.Array.contains(availableProperties, prop))
          {
            delete data[prop];
          }
        }
        
        // Now display the results.
        app.set(data);
        
/*
        // Close the window if the status is Active or Processing
        if (data.status == aiagallery.dbif.Constants.Status.Active ||
            data.stautus == aiagallery.dbif.Constants.Status.Processing)
        {
          app.setValue(false);
        }
*/

        break;

      case "deleteApp":
        // Retrieve the App object to which this request applied
        app = rpcRequest.getUserData("App");
        
        // The app has been deleted, so remove it from view
        app.getLayoutParent().remove(app);
        app.dispose();
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
