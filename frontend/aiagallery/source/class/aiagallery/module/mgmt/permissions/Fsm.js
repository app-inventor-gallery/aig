/**
 * Copyright (c) 2011 Derrell Lipman
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
            "pgroups" : qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
          },
        
          // On the clicking of a button, execute is fired
          "execute" :
          {
            //When a user clicks the add Permission Group button
            "addPerm" : "Transition_Idle_to_AwaitRpcResult_via_add",

            //When a user clicks the save button
            "savePerm" : "Transition_Idle_to_AwaitRpcResult_via_save",

            //When a user clicks the delete button
            "deletePerm" : "Transition_Idle_to_AwaitRpcResult_via_delete"
            
          },
          
          // When we get an appear event, retrieve the permission group 
          // name list. We only want to do it the first time, though, so  
          // we use a predicate to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
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

        "predicate" : function(fsm, event)
        {
          // Have we already been here before?
          if (fsm.getUserData("noUpdate"))
          {
            // Yup. Don't accept this transition and no need to check further.
            return null;
          }
          
          // Prevent this transition from being taken next time.
          fsm.setUserData("noUpdate", true);
          
          // Accept this transition
          return true;
        },

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
          request.setUserData("requestType", "onEntry");
        }
      });

      state.addTransition(trans);
      
      // The following transitions have a predicate, so must be listed first

      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: User clicked on a permission group on list1
       *
       * Action:
       *  Take the string name currently selected and get the current
       *  list of permissions attached to this group
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_list1",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,
        
        "predicate" : function(fsm, event)
        {
          if (fsm.getObject("pgroups").getSelection().length == 0)
          {
            // Do not use this transition and do not try others
            return null;
          }

          // Accept this transition
          return true;
        },

        "ontransition" : function(fsm, event)
        {
          //Get selected name 
          var pName = fsm.getObject("pgroups");
          pName = pName.getSelection()[0].getLabel();

          //Get permission list from DB
          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getPermissionGroup",
                        [

                          pName
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "pGroupChanged");
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
        "Transition_Idle_to_AwaitRpcResult_via_add",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {

          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addPermissionGroup",
                         [

                          fsm.getObject("pGroupName").getValue()
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "pGroupNameAdded");

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
        "Transition_Idle_to_AwaitRpcResult_via_delete",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {

          //Get the name of the permission group to delete
          var pName = fsm.getObject("pgroups");
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
          request.setUserData("requestType", "pGroupNameDeleted");

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
        "Transition_Idle_to_AwaitRpcResult_via_save",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,		

        "ontransition" : function(fsm, event)
        {
          //Get selected name 
          var pName = fsm.getObject("pgroups");
          
          pName = pName.getSelection()[0].getLabel();

          //Get selected permissions
          var pSelected = fsm.getObject("permissions");
          pSelected = pSelected.getSelection();

          var pList = new Array();
          
          for (var i = 0; i < pSelected.length; i++)
          {
            pList.push(pSelected[i].getLabel());
          }
           

          //Update on DB
          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "updatePermissionGroup",
                        [

                          pName, pList
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "pGroupChanged");
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
      // State: <some other state>
      // ------------------------------------------------------------ //

      // put state and transitions here




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
