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
 * User's own info page Finite State Machine
 */
qx.Class.define("aiagallery.module.dgallery.user.Fsm",
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
            var gui = aiagallery.module.dgallery.user.Gui.getInstance();
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
            
            "saveBtn" : "Transition_Idle_to_AwaitRpcResult_via_saveBtn"
            
          },
          
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
         // Retrive user information
         var request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "getUserProfile",
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
       * Cause: "save" button pressed
       *
       * Action:
       *  Save the new user profile chances
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_saveBtn",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             newUserInfo = {};
          var             request;
          var             field; 
          var             fieldYear;
          var             fieldMonth;
          var             yearString;
          var             monthString; 
          
          // Parse data from dialog into map
          // Ensure no added whitespace by using trim()
          // Ensure no nulls are added as well
          field = fsm.getObject("userNameField");
          newUserInfo["displayName"] = field.getValue(); 

          // If one of these fields is not set
          // then ignore both
          fieldYear = fsm.getObject("dobYearSBox");  
          fieldMonth = fsm.getObject("dobMonthSBox");          

          yearString = fieldYear.getSelection()[0].getLabel(); 
          monthString = fieldMonth.getSelection()[0].getLabel(); 
          if (monthString != "Month" && yearString != "Year")
          {     
            newUserInfo["birthYear"] = parseInt(yearString); 
            newUserInfo["birthMonth"] = monthString;
          } 
          else 
          {
            newUserInfo["birthYear"] = 0; 
            newUserInfo["birthMonth"] = "";
          }

          field = fsm.getObject("emailField");
          newUserInfo["email"] = field.getValue().trim(); 

          field = fsm.getObject("locationField");
          if (field.getValue() != null)
          {
            newUserInfo["location"] = field.getValue().trim(); 
          }

          field = fsm.getObject("orgField");
          if (field.getValue() != null)
          {
            newUserInfo["organization"] = field.getValue().trim(); 
          }

          field = fsm.getObject("urlField");
          if (field.getValue() != null)
          {
            newUserInfo["url"] = field.getValue().trim(); 
          }

          field = fsm.getObject("bioTextArea");
          if (field.getValue() != null)
          {
            newUserInfo["bio"] = field.getValue(); 
          }

          // DB Does not support booleans
          // 0 for false, 1 for true
          field = fsm.getObject("showEmailCheck");
          if (field.getValue())
          {
            newUserInfo["showEmail"] = 1;
          } 
          else
          {
            newUserInfo["showEmail"] = 0;
          }
          

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "editProfile",
                         [

                          newUserInfo 
                           
                        ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "editUserProfile");

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
