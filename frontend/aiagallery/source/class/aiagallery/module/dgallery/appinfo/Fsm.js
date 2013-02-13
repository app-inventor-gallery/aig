/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Each individual application page's finite state machine
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.Fsm",
{
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

            // Otherwise, call the standard result handler
            var gui = module.getUserData("gui");
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
          // When we get an appear event, retrieve the application info. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          "viewApp" : "Transition_Idle_to_Idle_via_viewApp",

          "likeIt"  : "Transition_Idle_to_AwaitRpcResult_via_likeIt",

          "flagIt"  : "Transition_Idle_to_AwaitRpcResult_via_flagIt",     

          // Event is called directly from a comment
          "flagComment" : "Transition_Idle_to_AwaitRpcResult_via_flagComment",
          
          "execute" :
          {
            "butAddComment" :
            "Transition_Idle_to_AwaitRpcResult_via_submit_comment",

            "tagRequest" :
            "Transition_Idle_to_AwaitRpcResult_via_tagRequest"

            
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
       *  Start our timer
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

          // Issue the remote procedure call to get the application
          // data. Request that the tags, previous authors, and status be
          // converted to strings for us.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppInfo",
                         [ 
                           module.getUserData("app_uid"),
                           true,
                           {
                             uid          : "uid",
                             owner        : "owner",
                             image1       : "image1",
                             title        : "title",
                             numLikes     : "numLikes",
                             numDownloads : "numDownloads",
                             numViewed    : "numViewed",
                             numComments  : "numComments",
                             displayName  : "displayName",
                             description  : "description",
                             creationTime : "creationTime",
                             uploadTime   : "uploadTime",
                             source       : "source",
                             comments     : "comments"
                             //tags         : "tags"
                           }
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getAppInfo");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: An item is selected from the "By this author" list
       *
       * Action:
       *  Create (if necessary) and switch to an application-specific tab
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_viewApp",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             item = event.getData();
          
          // Add a module for the specified app
          aiagallery.module.dgallery.appinfo.AppInfo.addAppView(item.uid, 
                                                                item.title);
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
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: butAddComment has been pressed
       *
       * Action:
       *  Add a comment to the database and to the GUI
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_submit_comment",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             appId;
          var             comment;
          var             request;

          // Retrieve the UID of the current app, and the new comment
          appId = fsm.getObject("searchResult").getUid();
          comment = fsm.getObject("textNewComment").getValue();
          
          // Trim whitespace from head and tail of the comment
          comment = qx.lang.String.trim(comment);

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addComment",
                         [
                           appId,
                           comment,
                           null     // The parent thread's UID
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "addComment");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: tagRequest has been pressed
       *
       * Action:
       *  Search for tag query and return to GUI
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_tagRequest",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          console.log("Entered FSM ontransition!");
          // Get the event data
          var             tagName;
          var             tagArray = [];
          var             queryFieldArray = [];
          var             request;

          // Retrieve the tag name we are trying to query
          tagName = fsm.getObject("tagName").getLabel();
          console.log(tagName);
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "appTagQuery",
                         [ tagName ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "tagResponse");
        }
      });

      state.addTransition(trans);



      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: likeItButton has been pressed
       *
       * Action:
       *  Add a "Like" for this app to the database and to the GUI
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_likeIt",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             appId;

          // Retrieve the UID of the current app, and the new comment
          appId = fsm.getObject("searchResult").getUid();

          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "likesPlusOne",
                         [
                           appId
                         ]);

          // Tell Gui the request type
          request.setUserData("requestType", "likesPlusOne");
        }
      });

      state.addTransition(trans);

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_flagIt",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             appId;
          var             reason;

          // Retrieve the UID of the current app uid
          appId = fsm.getObject("searchResult").getUid();

          // Get the reason for the flagging
          reason = fsm.getObject("searchResult").getUserData("flagData").reason;

          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "flagIt",
                         [ 
                           // flag type: 0 = app, 1 = comment
                           aiagallery.dbif.Constants.FlagType.App,     
                           reason,          // reason
                           appId,           // ID of application being banned
                           null             // comment ID
                         ]);


          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "flagIt");
        }
      });
      state.addTransition(trans);
      
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_flagComment",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             appId;
          var             treeId;
          var             reason;
          var             map;
          
          // Get the data map
          map = event.getData();
          
          // Break out the map
          appId = map.appId;
          treeId = map.treeId;
          reason = map.reason;

          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "flagIt",
                         [ 
                           // flag type: 1 = comment
                           aiagallery.dbif.Constants.FlagType.Comment,     
                           reason,  // reason
                           appId,   // ID of comment's app
                           treeId   // comment ID
                         ]);


          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "flagComment");
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
