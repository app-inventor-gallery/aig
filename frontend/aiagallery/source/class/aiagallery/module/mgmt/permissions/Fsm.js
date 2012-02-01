/**
 * Copyright (c) 2012 Derrell Lipman
 * Copyright (c) 2012 Paul Geromini 
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Permission management Finite State Machine
 */
qx.Class.define("aiagallery.module.mgmt.permissions.Fsm",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModuleFsm,

  members :
  {
    buildFsm : function(module)
    {
      var fsm = module.fsm;
      var state;
      var trans;

      // ------------------------------------------------------------ //
      // State: Idle
      // ------------------------------------------------------------ //

      /*
       * State: Idle
       *
       * Actions upon entry
       *   - if returning from RPC, display the result
       */

      state = new qx.util.fsm.State("State_Idle",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Display the result.  We need to get the request object
            var rpcRequest = this.popRpcRequest();

            // Call the standard result handler
            var gui = aiagallery.module.mgmt.permissions.Gui.getInstance();
            gui.handleResponse(module, rpcRequest);

            // Dispose of the request
            if (rpcRequest.request)
            {
              rpcRequest.request.dispose();
              rpcRequest.request = null;
            }
          }
        },

        "events" :
        {
          "changeSelection" :
          {
            //When a user selects a project group on list1 this is called
            "pGroupNameList" : 
              "Transition_Idle_to_AwaitRpcResult_via_changeSelection"
          },
        
          // On the clicking of a button, execute is fired
          "execute" :
          {
            //When a user clicks the add Permission Group button
            "addPermissionGroup" : 
              "Transition_Idle_to_AwaitRpcResult_via_addPermissionGroup",

            //When a user clicks the save button
            "savePermissionGroup" : 
              "Transition_Idle_to_AwaitRpcResult_via_savePermissionGroup",

            //When a user clicks the delete button
            "deletePermissionGroup" : 
              "Transition_Idle_to_AwaitRpcResult_via_deletePermissionGroup"
            
          },
          
          // When we get an appear event, retrieve the permission group 
          // name list. We only want to do it the first time, though, so  
          // we use a predicate to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event
          "disappear" :
          {
            //"main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  If this is the very first appear, retrieve the permission
       *  group name list.
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {   
         //Call to retrive the permission group name list
        var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getPermissionGroups",
                         []);
                         
          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "appear");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: User clicked on a permission group on the permission
       * group name list. 
       *
       * Action:
       *  Take the string name currently selected and get the current
       *  list of permissions attached to this group
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_changeSelection",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,
        
        "predicate" : function(fsm, event)
        {
          if (fsm.getObject("pGroupNameList").getSelection().length == 0)
          {
            // Do not use this transition and do not try others
            return null;
          }

          // Accept this transition
          return true;
        },

        "ontransition" : function(fsm, event)
        {
          // Get selected name 
          var pName = fsm.getObject("pGroupNameList");
          pName = pName.getSelection()[0].getLabel();

          // Get permission list from DB
          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addOrEditOrGetPermissionGroup",
                        [

                          pName,
                          [],
                          true,
                          null
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", 
            "addOrEditOrGetPermissionGroup_changeSelection");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "Add Permission Group" button pressed
       *
       * Action:
       *  Take the string in the textfield. Create a default 
       *  permission group with the name from the textfield.
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_addPermissionGroup",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
        
          // Get selected permissions
          var pSelected = fsm.getObject("possiblePermissionList");
          pSelected = pSelected.getSelection();

          var pList = new Array();
          
          for (var i = 0; i < pSelected.length; i++)
          {
            pList.push(pSelected[i].getLabel());
          }
          
          // Get the textfield with the description
          var description = fsm.getObject("pGroupDescriptionField").getValue();

          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addOrEditOrGetPermissionGroup",
                         [

                          fsm.getObject("pGroupNameField").getValue(),
                          pList,
                          false,
                          description
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "addOrEditOrGetPermissionGroup");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "Delete" button pressed
       *
       * Action:
       *  Take the string name currently selected and delete the corresponding
       *  permission group
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deletePermissionGroup",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {

          //Get the name of the permission group to delete
          var pName = fsm.getObject("pGroupNameList");
          pName = pName.getSelection()[0].getLabel();

          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "deletePermissionGroup",
                         [

                          pName
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deletePermissionGroup");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "Save" button pressed
       *
       * Action:
       *  Take the string name currently selected and take the corresponding
       *  selected permissions and update them on the DB.
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_savePermissionGroup",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,		

        "ontransition" : function(fsm, event)
        {
          // Get selected name 
          var pName = fsm.getObject("pGroupNameList");         
          pName = pName.getSelection()[0].getLabel();

          // Get selected permissions
          var pSelected = fsm.getObject("possiblePermissionList");
          pSelected = pSelected.getSelection();

          // Put Selected permissions in a list
          var pList = new Array();
          pList = pSelected.map(
            function(listItem)
            {
              return listItem.getLabel(); 
            });  
           
          // Get the textfield with the description
          var description = fsm.getObject("pGroupDescriptionField").getValue();

          // Update on DB
          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addOrEditOrGetPermissionGroup",
                        [

                          pName, 
                          pList,
                          false,
                          description
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "addOrEditOrGetPermissionGroup_save");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "disappear" on canvas
       *
       * Action:
       *  Stop our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_disappear",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
        }
      });

      state.addTransition(trans);

      // ------------------------------------------------------------ //
      // State: AwaitRpcResult
      // ------------------------------------------------------------ //

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);


      // ------------------------------------------------------------ //
      // Epilog
      // ------------------------------------------------------------ //

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
