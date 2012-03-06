/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
require(aiagallery.module.dgallery.appinfo.AppInfo)
 */

/**
 * Gallery "find apps" page finite state machine
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Fsm",
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
            var gui = aiagallery.module.dgallery.findapps.Gui.getInstance();
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
          // click on app title or image
          "viewApp" : "Transition_Idle_to_Idle_via_viewApp",

          // a new search was initiated
          "queryChanged" : "Transition_Idle_to_AwaitRpcResult_via_queryChanged",

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
            "main.canvas" : "Transition_Idle_to_Idle_via_disappear"
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
          // Issue the remote procedure call to get the list of category tags.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getCategoryTags",
                         []);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getCategoryTags");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "queryChanged" event from CriteriaSearch
       *
       * Action:
       *  Initiate a request for the list of  matching applications.
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_queryChanged",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             i;
          var             request;
          var             eventData;
          var             requestData = {};
          
          // Retrieve the event data which provides the query criteria
          eventData = event.getData().data;

          // First, let's set the keyword search fields. Some of these may not
          // exist in the event data, but that's ok.
          requestData.text = eventData.text;
          requestData.title = eventData.title;
          requestData.description = eventData.description;
          requestData.tags = eventData.tags;

          // Now let's start building the AND-ed app field criteria
          requestData.criteria = 
            {
              type     : "op",
              method   : "and",
              children : []
            };

          // Add categories
          if (eventData.categories)
          {
            // Add each one separately
            eventData.categories.forEach(
              function(category)
              {
                requestData.criteria.children.push(
                  {
                    type  : "element",
                    field : "tags", 
                    value : category
                  });
              },
              this);
          }

          // Add author
          if (eventData.authorId)
          {
            requestData.criteria.children.push(
              {
                type  : "element",
                field : "owner", 
                value : eventData.authorId
              });
          }

          // Add likes count
          if (eventData.likes)
          {
            requestData.criteria.children.push(
              {
                type     : "element",
                field    : "numLikes",
                value    : eventData.likes[1],
                filterOp : eventData.likes[0]
              });
          }

          // Add downloads count
          if (eventData.downloads)
          {
            requestData.criteria.children.push(
              {
                type     : "element",
                field    : "numDownloads",
                value    : eventData.downloads[1],
                filterOp : eventData.downloads[0]
              });
          }

          // Add views count
          if (eventData.views)
          {
            requestData.criteria.children.push(
              {
                type     : "element",
                field    : "numViewed",
                value    : eventData.views[1],
                filterOp : eventData.views[0]
              });
          }
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "intersectKeywordAndQuery",
                         [
                           requestData
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "intersectKeywordAndQuery");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: An item is selected from the search results
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
