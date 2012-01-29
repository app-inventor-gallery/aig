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

      //Disable button on startup since textfield will be empty
      addPermissionGroup.setEnabled(false);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("addPerm", addPermissionGroup, "main.fsmUtils.disable_during_rpc");

      // Create an Update Permission Group button
      var savePermissionGroup = new qx.ui.form.Button(this.tr("Save"));
      savePermissionGroup.set(
      {
        maxHeight : 24,
        width     : 100
      });
      hBox.add(savePermissionGroup);
      savePermissionGroup.addListener("execute", fsm.eventListener, fsm);

      //Disable button on startup 
      savePermissionGroup.setEnabled(false); 
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("savePerm", savePermissionGroup, "main.fsmUtils.disable_during_rpc");

      // Create a Delete button
      var deletePermissionGroup = new qx.ui.form.Button(this.tr("Delete"));
      deletePermissionGroup.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
      hBox.add(deletePermissionGroup);
      deletePermissionGroup.addListener("execute", fsm.eventListener, fsm);
      
      //Disable button on startup 
      deletePermissionGroup.setEnabled(false);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("deletePerm", deletePermissionGroup, "main.fsmUtils.disable_during_rpc");
      
      //Create textfield
      var textField = new qx.ui.form.TextField;
      textField.set(
      {
        width     : 200
      });
      hBox.add(textField);

      //Only enable add button if there is something in the textfield
      textField.addListener("input", function(e) 
      {
        var value = e.getData();
        addPermissionGroup.setEnabled(value.length > 0);
      }, this); 

      //Create friendly name to get it from the FSM
      fsm.addObject("pGroupName", textField,"main.fsmUtils.disable_during_rpc");

      // Create a set of finder-style multi-level browsing lists
      var groupbox = new qx.ui.groupbox.GroupBox("Permission Groups");
      groupbox.setLayout(new qx.ui.layout.HBox());
      groupbox.setContentPadding(0);
      hBox.add(groupbox);

      // create and add the lists. Store them in an array.
      var list1 = new qx.ui.form.List();
      list1.setWidth(150);
      list1.addListener("changeSelection", fsm.eventListener, fsm);
      
      //Disable delete/save button unless something is selected
      list1.addListener("changeSelection", function(e) 
      {
        var bEnable = (list1.getSelection().length != 0);
        savePermissionGroup.setEnabled(bEnable);
        deletePermissionGroup.setEnabled(bEnable)
      }, this); 

      groupbox.add(list1);
      fsm.addObject("pgroups", list1, "main.fsmUtils.disable_during_rpc");     

      list2 = new qx.ui.form.List();
      list2.setWidth(150);
      list2.addListener("changeSelection", fsm.eventListener, fsm);

      //Allow user to select multiple items
      list2.setSelectionMode("multi");

      //Create a data array of possible permissions
      var pDataArray = new qx.data.Array(["addOrEditApp", "deleteApp", 
                         "getAppListAll", "addComment", "deleteComment", 
                         "flagIt", "addOrEditVisitor", "deleteVisitor", 
                         "getVisitorList", "likesPlusOne", 
                         "getDatabaseEntities"]);
      
      //Create controller to add data to list2
      var permissionController
      this.permissionController 
        = new qx.data.controller.List(pDataArray, list2); 
        
      groupbox.add(list2);
      fsm.addObject("permissions", list2, "main.fsmUtils.disable_during_rpc");

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
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;
      var             textField = fsm.getObject("pGroupName");
      var             delBtn = fsm.getObject("deletePerm");
      var             saveBtn = fsm.getObject("savePerm");
      var             addBtn = fsm.getObject("addPerm"); 
      
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
 
      case "onEntry" :
        if (response.data.result == "false") 
        {
          //Permission group name already exists
          alert("An error occurred trying to get the permission groups.");
          break;
        }
        
        //Got the array of permission groups 
        //If the array is not empty we need to do something
        var pArray = response.data.result;
        
        for (var i = 0; i < pArray.length; i++)
        {
          //Add to list
          var pName = new qx.ui.form.ListItem(pArray[i].name);   
          list1.add(pName)
          
          //Select it
          list1.setSelection([pName]); 
          
          //Convert to a data Array.
          var dataArray = new qx.data.Array(pArray[i].permissions);
        
          //Set Selectiong using controller
          this.permissionController.setSelection(dataArray); 
        }
        
        //There was nothing in the array make sure buttons are disabled
        //They should be disabled, but they are not in this case
        if (pArray.length == 0)
        {
          delBtn.setEnabled(false); 
          saveBtn.setEnabled(false); 
        }
        
        //Ensure Add Btn is disabled
        addBtn.setEnabled(false);
   
        break; 
 
      case "pGroupNameAdded" : 
        if (response.data.result == "false") 
        {
          //Permission group name already exists
          alert("An error occurred trying to add this permission group.");
          break;
        }

        //Creation was a success add to list. 
        var pName = new qx.ui.form.ListItem(response.data.result.name);        
        list1.add(pName);	
        
        //Select on list
        list1.setSelection([pName]); 
        
        //Clear textField
        textField.setValue("");
        
        //Ensure Add Btn is disabled
        addBtn.setEnabled(false);
        
        break; 

      case "pGroupNameDeleted" :
        if (response.data.result == "false") 
        {
          //Delete failed
          alert("An error occurred trying to delete this permission group.")
          break;
        }
        
        //Permission group was deleted remove it from the list
        list1.remove(list1.getSelection()[0]);
        
        //Clear all current selections on list 2 (the list of permissions)
        list2.resetSelection(); 
        
         break; 

      case "pGroupChanged" :
      
        if (response.data.result == "false") 
        {
          //Could not find the selected pGroup. Oops
          alert("An error occurred trying get info about this permission group.")
          break;
        }		
                        
        //Clear all current selections on list 2 (the list of permissions)
        list2.resetSelection(); 
        
        //Make things easier to read
        var returnedList = response.data.result.permissions;
        
        //Convert to a data Array.
        var dataArray = new qx.data.Array(returnedList);
        
        //Set Selectiong using controller
        this.permissionController.setSelection(dataArray); 
        
        break; 

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
