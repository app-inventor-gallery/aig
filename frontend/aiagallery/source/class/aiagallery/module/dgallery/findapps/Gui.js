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
      var             fsm = module.fsm;

      // Make it easy to provide some space around the edges
      canvas.setLayout(new qx.ui.layout.Canvas());

      if (true)
      {
        var hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        canvas.add(hbox, { top : 10, left : 10 });
        var json = new qx.ui.form.TextField();
        json.setWidth(200);
        hbox.add(json);
        var but = new qx.ui.form.Button("Set Query");
        hbox.add(but);
        but.addListener(
          "execute",
          function(e)
          {
            this.__criteria.setQuery(json.getValue());
          },
          this);
      }

      // Add the whole search criteria (and its search results)
      this.__criteria =
        new aiagallery.module.dgallery.findapps.CriteriaSearch();
      
      // Add a listener for a new search
      this.__criteria.addListener("queryChanged", fsm.eventListener, fsm);

      // Add a listener for when the user clicks on an app in search results
      this.__criteria.addListener("viewApp", fsm.eventListener, fsm);
    
      canvas.add(this.__criteria, 
                 { top : 60, left : 10, bottom : 10, right : 10 });

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
      var             model;

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
        this.__criteria.setCategoryList(response.data.result);
        break;
      
      case "intersectKeywordAndQuery":
        // Retrieve the app list
        apps = response.data.result;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.__criteria.getSearchResultsList().setModel(model);
        break;
        
        
      case "appQuery":
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;

        // unused...
        //categories = response.data.result.categories;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.__criteria.getSearchResultsList().setModel(model);
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
