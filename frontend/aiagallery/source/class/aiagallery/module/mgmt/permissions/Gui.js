/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the permission management page
 */
qx.Class.define("aiagallery.module.mgmt.permissions.Gui",
{
  type : "singleton",
  extend :  qx.ui.core.Widget,

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
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             rowData;

      // Live mode. Retrieve data from the backend.
      rowData = [];

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());   

      // We'll left-justify some buttons in a button row
      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      var hBox = new qx.ui.container.Composite(layout);

      // Create an Add Permission button
      var addPermissionGroup = new qx.ui.form.Button(this.tr("Add Permission Group"));
      addPermissionGroup.set(
        {
          maxHeight : 24,
          width     : 150
        });
      hBox.add(addPermissionGroup);
      addPermissionGroup.addListener("execute", fsm.eventListener, fsm);

      // Create a Delete button
      var deletePGroup = new qx.ui.form.Button(this.tr("Delete"));
      deletePGroup.set(
        {
          maxHeight : 24,
          width     : 100,
          enabled   : false
        });
      hBox.add(deletePGroup);
      fsm.addObject("deletePGroup", deletePGroup);
      
      //Create textfield
      var textField = new qx.ui.form.TextField;
      textField.set(
        {
          width     : 200
        });
      hBox.add(textField);

      //Create friendly name to get it from the FSM
      fsm.addObject("pGroupName", textField);

      // Create a set of finder-style multi-level browsing lists
      groupbox = new qx.ui.groupbox.GroupBox("Permission Groups");
      groupbox.setLayout(new qx.ui.layout.HBox());
      groupbox.setContentPadding(0);
      hBox.add(groupbox);

      // create and add the lists. Store them in an array.
      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("pgroups", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("permissions", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("users", list);

      // Add to the page
      canvas.add(hBox);

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
      var             list1 = fsm.getObject("pgroups");
      var             list2 = fsm.getObject("permissions");
      var             list3 = fsm.getObject("users");
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;

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
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
