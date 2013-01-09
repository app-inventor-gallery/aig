/**
 * Copyright (c) 2013 Derrell Lipman
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
 * Flag management Finite State Machine
 */
qx.Class.define("aiagallery.module.mgmt.flags.Fsm",
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
            var gui = aiagallery.module.mgmt.flags.Gui.getInstance();
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
          // Keep a flagged app
          "keepApp" : "Transition_Idle_to_AwaitRpcResult_via_keepApp",

          // Keep a flagged profile
          "keepProfile" : "Transition_Idle_to_AwaitRpcResult_via_keepProfile",

          // Delete a flagged app
          "deleteApp" : "Transition_Idle_to_AwaitRpcResult_via_deleteApp",

          // Delete a flagged profile
          "deleteProfile"
            : "Transition_Idle_to_AwaitRpcResult_via_deleteProfile",
    
          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
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

        "ontransition" : function(fsm, event)
        {
          // If we wanted to do something as the page appeared,
          // it would go here.
          // Pull the app flags from the db 
          var      request;
 
          request = 
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getFlags",
                         [aiagallery.dbif.Constants.FlagType.App]);        

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getFlags");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked on keep button for an app in mgmt page 
       *
       * Action:
       *  Keep an app that has been flagged
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_keepApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          var     appId;
          
          // Get the uid
          appId = event.getData().getUserData("uid");          
          
          // Change status of selected comment back to viewable
          request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "clearAppFlags",
                          [appId]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "keepApp");

        }
      });
      
      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked on keep button for a profile in mgmt page 
       *
       * Action:
       *  Keep a profile that has been flagged
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_keepProfile",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          var     username; 
          
          // Get the username
          username = event.getData().getUserData("username");
        
          // Have to send string since userId cannot be passed to frontend.
          // Possible for user to change name during this time.
          request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "clearProfileFlags",
                          [username]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "keepProfile");

        }
      });
      
      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked on delete button for an app in mgmt page 
       *
       * Action:
       *  Delete an app that has been flagged
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deleteApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          var     uid; 
          
          // Get the uid
          uid = event.getData().getUserData("uid");
        
          request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "mgmtDeleteApp",
                          [uid]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteApp");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked on delete button for a profile in mgmt page 
       *
       * Action:
       *  Delete a profile that has been flagged
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deleteProfile",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request;  
          var     username; 
          
          // Get the username
          username = event.getData().getUserData("username");
        
          // Have to send string since userId cannot be passed to frontend.
          // Possible for user to change name during this time.
          request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "deleteVisitorWithUsername",
                          [username]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteProfile");

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
