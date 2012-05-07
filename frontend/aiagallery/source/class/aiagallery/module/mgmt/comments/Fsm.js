/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
require(aiagallery.module.dgallery.appinfo.AppInfo)
 */

/**
 * Temporary testing page Finite State Machine
 */
qx.Class.define("aiagallery.module.mgmt.comments.Fsm",
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
            var gui = aiagallery.module.mgmt.comments.Gui.getInstance();
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
          // On the clicking of a button, execute is fired
          "execute" :
          {
            
            "queryBtn" : "Transition_Idle_to_AwaitRpcResult_via_query"
            
          },
          
           // Event is called directly from a comment
          "keepComment" : "Transition_Idle_to_AwaitRpcResult_via_keepComment",
          
          // Event is called directly from a comment
          "deleteComment" : "Transition_Idle_to_AwaitRpcResult_via_deleteComment",
          
          // When we get an appear event, retrieve all pending comments
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
       *  If this is the very first appear, retrieve the 
       *  list of pending comments.
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          
          // Query to get all pending comments return in a list.
          request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "getPendingComments",
                          []);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getPendingComments");

        }
      });
            
      state.addTransition(trans);
      
      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked on keep button for a comment in mgmt page 
       *
       * Action:
       *  Keep a comment that has been flagged
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_keepComment",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          var     appId;
          var     treeId; 
          var     map; 
          
          // Get the data map
          map = event.getData();
          
          // Break out the map
          appId = map.appId;
          treeId = map.treeId;  
          
          // Change status of selected comment back to viewable
          request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "setCommentActive",
                          [appId, treeId]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "setCommentActive");
          request.setUserData("commentInfo", map); 

        }
      });
      
      state.addTransition(trans);
      
      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked on delete button for a comment in mgmt page 
       *
       * Action:
       *  Delete (set status to unviewable) a comment that has been flagged
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deleteComment",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          var     appId;
          var     treeId; 
          var     map; 
          
          // Get the data map
          map = event.getData();
          
          // Break out the map
          appId = map.appId;
          treeId = map.treeId;  
        
         // Change the status of the comment to unviewable
         request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "deleteComment",
                         [appId, treeId]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteComment");
          request.setUserData("commentInfo", map); 

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
