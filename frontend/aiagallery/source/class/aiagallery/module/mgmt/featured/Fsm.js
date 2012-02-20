/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Featured Apps management
 */
qx.Class.define("aiagallery.module.mgmt.featured.Fsm",
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
            var gui = aiagallery.module.mgmt.featured.Gui.getInstance();
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
          "execute" :
          {
            "butSaveFeatured" : 
              "Transition_Idle_to_AwaitRpcResult_via_butSaveFeatured"
          },

          // When we get an appear event
          "appear"    :
          {
            "main.canvas" : "Transition_Idle_to_AwaitRpcResult_via_appear"
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
       * Transition: Idle to AwaitRpcResult
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

/*
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
*/

        "ontransition" : function(fsm, event)
        {
          // Issue the remote procedure call to get the application list.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppListAll",
                         [ false ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getAppListAll");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "execute" on "Save featured apps" button
       *
       * Action:
       *  Issue an RPC to set the new list of featured apps
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_butSaveFeatured",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             selection;
          var             listApps;
          var             featured = [];
          
          // Retrieve the Apps list
          listApps = fsm.getObject("listApps");
          
          // Retrieve the selection from that list
          selection = listApps.getSelection();
          
          // Add the uid from item to an array
          selection.forEach(
            function(item)
            {
              featured.push(item.getUid());
            });

          // Issue the remote procedure call to get the application list.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "setFeaturedApps",
                         [ featured ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "setFeaturedApps");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "Search" button pressed
       *
       * Action:
       *  Initiate a request for the list of  matching applications.
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_query",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             criteria;
          var             criterium;
          var             request;
          var             selection;



          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "mobileRequest",
                         [

                          fsm.getObject("queryField").getValue()
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "mobileRequest");

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
