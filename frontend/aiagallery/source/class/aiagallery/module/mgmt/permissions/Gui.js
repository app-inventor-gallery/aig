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
      var list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
	  
	  //Disable delete/save button unless something is selected
	  list.addListener("changeSelection", function(e) 
      {
		var label = e.getData()[0].getLabel(); 
        savePermissionGroup.setEnabled(label != "");
		deletePermissionGroup.setEnabled(label != "")
      }, this); 


      groupbox.add(list);
      fsm.addObject("pgroups", list, "main.fsmUtils.disable_during_rpc");     

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);

      //Allow user to select multiple items
      list.setSelectionMode("multi");

	  //Create a data array of possible permissions
	  var pDataArray = new qx.data.Array(["addOrEditApp", "deleteApp", 
	                     "getAppListAll", "addComment", "deleteComment", 
						 "flagIt", "addOrEditVisitor", "deleteVisitor", 
						 "getVisitorList", "likesPlusOne", 
						 "getDatabaseEntities"]);
	  
	  //Create controller to add data to list2
	  var permissionController
	  this.permissionController 
	    = new qx.data.controller.List(pDataArray, list); 
	    
      groupbox.add(list);
      fsm.addObject("permissions", list, "main.fsmUtils.disable_during_rpc");

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
	  var             deleteBtn = fsm.getObject("deletePerm");
	  var             saveBtn = fsm.getObject("savePerm");
      var             list1 = fsm.getObject("pgroups");
      var             list2 = fsm.getObject("permissions");
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;

	  //Set both buttons as disabled
	  deleteBtn.setEnabled(false);
	  saveBtn.setEnabled(false);
	  
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
 
      case "pGroupNameAdded" : 
        if (response.data.result == "false") 
        {
          //Permission group name already exists
		  alert("An error occurred trying to add this permission group.")
          break;
        }

        //Creation was a success add to list. 
        var pName = new qx.ui.form.ListItem(response.data.result.name);        
        list1.add(pName);		
		
		//Enable buttons
		deleteBtn.setEnabled(true);
		saveBtn.setEnabled(true); 	

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

		//If there are no remaining permission groups
		//on list1 disable delete and save button
		if (list1.getChildren().length == 0) 
		{
		  deleteBtn.setEnabled(false);
		  saveBtn.setEnabled(false); 		  
		}
		
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
		
		//Enable buttons
		deleteBtn.setEnabled(true);
		saveBtn.setEnabled(true); 	
		
        break; 

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
