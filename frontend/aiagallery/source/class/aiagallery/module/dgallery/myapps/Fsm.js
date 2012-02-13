/**
 * Copyright (c) 2011 Derrell Lipman
 * 
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
qx.Class.define("aiagallery.module.dgallery.myapps.Fsm",
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
            var gui = aiagallery.module.dgallery.myapps.Gui.getInstance();
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
          // Messages pushed by the server, e.g. app status changes
          "serverPush" : "Transition_Idle_to_Idle_via_serverPush",

          // On the clicking of a Save button in an app's Detail editing area
          "saveApp" : "Transition_Idle_to_AwaitRpcResult_via_saveApp",
          
          // On the clicking of a Delete button in an app's Detail editing area
          "deleteApp" : "Transition_Idle_to_AwaitRpcResult_via_deleteApp",
          
          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
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
       *  If this is the very first appear, retrieve the category list.
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
          // Issue the remote procedure call to get the list of this visitor's
          // applications. Request to convert lists into stringts, and
          // retrieve only the logged-in user's own apps, not all apps.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppList",
                         [ false, null, null, null ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getAppList");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: Save button was pressed, and Detail form validates
       *
       * Action:
       *  Initiate a request save the changed data
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_saveApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             data = event.getData();
          var             model = data.model;
          var             request;

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addOrEditApp",
                         [
                           model.uid,
                           model
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "addOrEditApp");
          
          // Save the App object to which this request applies
          request.setUserData("App", data.app);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: Delete button was pressed on a previously-saved app
       *
       * Action:
       *  Initiate a request save the changed data
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deleteApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             data = event.getData();
          var             request;

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "deleteApp",
                         [
                           data.uid
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteApp");
          
          // Save the App object to which this request applies
          request.setUserData("App", data.app);
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to Idle
       *
       * Cause: A server push message arrived, indicating, generally, a change
       * of status of an app.
       *
       * Action:
       *  Update the GUI
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_serverPush",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var data;
            
          // Retrieve the serverPush event
          data = event.getData();
          
          // The serverPush event contains the data we care about
          data = data.getData();
          
          //
          // Simulate that this is an RPC response
          //
          var rpcRequest = new qx.core.Object();
          rpcRequest.setUserData("requestType", "serverPush");
          rpcRequest.setUserData("rpc_response", 
                                 {
                                   type : "success",
                                   data : data
                                 });

          // Call the standard result handler
          var gui = aiagallery.module.dgallery.myapps.Gui.getInstance();
          gui.handleResponse(module, rpcRequest);

          // Dispose of the request
          if (rpcRequest.request)
          {
            rpcRequest.request.dispose();
            rpcRequest.request = null;
          }
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
