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
          // Change selection on the entity type select box
          "changeSelection" :
          {
            "selEntityTypes" : 
              "Transition_Idle_to_AwaitRpcResult_via_entityTypeSelection"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "change selection on Entity Type select box"
       *
       * Action:
       *  Issue RPC call to request all of the entities of the selected type
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_entityTypeSelection",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             entityType;
          var             entityTypes;
          var             request;
          var             bRootKey;

          // Determine which entity type was selected
          entityType = event.getData()[0].getChildControl("label").getValue();

          // Find out whether to use a root key
          bRootKey = fsm.getObject("chkUseRootKey").getValue();

          // Issue the remote procedure call to retrieve all entities of the
          // specified type.
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getDatabaseEntities",
                         [ entityType, bRootKey ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getDatabaseEntities");
          
          // Save the entity type too
          request.setUserData("entityType", entityType);
        }
      });

      state.addTransition(trans);

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
