/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * User management finite state machine
 */
qx.Class.define("aiagallery.module.mgmt.db.Fsm",
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

            // Otherewise, call the standard result handler
            var gui = aiagallery.module.mgmt.db.Gui.getInstance();
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
          // When we get an appear event, retrieve the visitor list
          "appear"    :
          {
            "main.canvas" : "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event, stop our timer
          "disappear" :
          {
            "main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "genericRpcCall"
       *
       * Action:
       *  Issue the RPC call specified by the event data
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the user data, which includes the parameters to callRpc()
          var userData = event.getData();

          // Issue the specified remote procedure call
          this.callRpc(userData.fsm,
                        userData.service,
                        userData.method,
                        userData.params,
                        userData);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  Start our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Issue the remote procedure call to get the visitor list. Request
          // that the permissions and status be converted to strings for us.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getVisitorList",
                         [ true ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getVisitorList");
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
//          aiagallery.module.mgmt.db.Fsm._stopTimer(fsm);
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
