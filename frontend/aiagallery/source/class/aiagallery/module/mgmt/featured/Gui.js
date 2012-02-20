/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for Featured Apps management
 */
qx.Class.define("aiagallery.module.mgmt.featured.Gui",
{
  type : "singleton",
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
      var             o;
      var             app;
      var             fsm = module.fsm;
      var             hbox;
      var             canvas = module.canvas;

      canvas.setLayout(new qx.ui.layout.VBox(10));

      // Add the list for all of the search results
      this.listApps = new qx.ui.list.List();
      this.listApps.set(
        {
          itemHeight    : 130,
          labelPath     : "title",
          iconPath      : "image1",
          selectionMode : "multi"
        });
      fsm.addObject("listApps", 
                    this.listApps, 
                    "main.fsmUtils.disable_during_rpc");
      canvas.add(this.listApps, { flex : 1 });
      
      // Create a horizontal box for the button row
      hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      
      // Add a left spacer to center-justify the button
      hbox.add(new qx.ui.core.Spacer(10, 10), { flex : 1 });
      
      // Button to set the featured apps
      this.butSaveFeatured = new qx.ui.form.Button("Save featured apps");
      this.butSaveFeatured.addListener("execute", fsm.eventListener, fsm);
      fsm.addObject("butSaveFeatured", 
                    this.butSaveFeatured, 
                    "main.fsmUtils.disable_during_rpc");
      hbox.add(this.butSaveFeatured);
      
      // Add a right spacer to center-justify the button
      hbox.add(new qx.ui.core.Spacer(10, 10), { flex : 1 });
      
      canvas.add(hbox);
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
      var             result;
      var             apps;
      var             model;
      var             selection;

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
      case "getAppListAll":
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.listApps.setModel(model);
        
        // Retrieve the selection array
        selection = this.listApps.getSelection();

        // Select any currently-featured apps
        apps.forEach(
          function(app, i)
          {
            if (qx.lang.Array.contains(app.tags, "*Featured*"))
            {
              selection.push(model.getItem(i));
            }
          });
        break;

      case "setFeaturedApps":
        // Nothing to do
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
