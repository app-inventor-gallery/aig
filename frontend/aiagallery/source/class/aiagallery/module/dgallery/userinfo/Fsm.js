/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
require(aiagallery.module.dgallery.appinfo.AppInfo)
 */

/**
 * FSM for userinfo pages
 */
qx.Class.define("aiagallery.module.dgallery.userinfo.Fsm",
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
            var gui = aiagallery.module.dgallery.userinfo.Gui.getInstance();
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
          
          // Clicked on an authored app
          "authoredAppClick" :
            "Transition_Idle_to_Idle_via_authoredAppClick",

          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
          },

          "flagIt" : "Transition_Idle_to_AwaitRpcResult_via_flagUserProfile",  

          // When we get a disappear event
          "disappear" :
          {
            //"main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);


      // The following transitions have a predicate, so must be listed first

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
         // If get the user info we are going to display
         var request = 
           this.callRpc(fsm,
                        "aiagallery.features",
                        "getPublicUserProfile",
                        [
                          module.getUserData("user") 
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "appear");
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

      /*
       * Transition: Idle to Idle
       *
       * Cause: An authored app has been clicked
       *
       * Action:
       *  Create (if necessary) and switch to an application-specific tab
       */
      
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_authoredAppClick",
      {
        "nextState" : "State_Idle",
      
        "context" : this,
      
        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             item = event.getData();

          // Add a module for the specified app
          aiagallery.module.dgallery.appinfo.AppInfo.addAppView(item.uid, 
                                                               item.title);

        }
      });
      
      state.addTransition(trans);
      
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_flagUserProfile",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             userString;
          var             reason;
          var             map;
          
          // Get the data map
          map = event.getData();
          
          // Break out the map
          userString = map.appId;
          reason = map.reason; 

          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "flagIt",
                         [ 
                           // flag type: 3 = user
                           aiagallery.dbif.Constants.FlagType.User,     
                           reason,  // reason
                           userName // String of the user's name
                         ]);


          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "flagIt");
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
