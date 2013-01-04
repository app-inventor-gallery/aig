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
          // applications.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppList",
                         [ 100 ]);

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

          // Only use memcache if we are on Google App Engine.
          if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
          {
              // Prepare variables for memcache, just like in getAppInfo()
              var uid = model.uid;
	      var memcacheServiceFactory;
	      var syncCache;

              // Concat a bunch of strings with UID as keys in memcache
              var retapp = "retapp_";
              var retflag = "retflag_";
              var retlikes = "retlikes_";
              var retbyauthor = "retbyauthor_";
              var retcomments = "retcomments_";
              var retcommentsflag = "retcommentsflag_";

              var key_app = retapp.concat(uid);
              var key_flag = retflag.concat(uid);
              var key_likes = retlikes.concat(uid);
              var key_byauthor = retbyauthor.concat(uid);
              var key_comments = retcomments.concat(uid);
              var key_commentsflag = retcommentsflag.concat(uid);

	      // Setting up memcache references
	      memcacheServiceFactory = 
                Packages.com.google.appengine.api.memcache.MemcacheServiceFactory;
	      syncCache = memcacheServiceFactory.getMemcacheService();	

              // Make sure to clear memcache for this app's data of all sorts
/**              var testvar = false;
              testvar = syncCache.delete(key_app);
              if (testvar) {
                alert(key_app);
              } else {
                alert("Oops");
                alert(key_app);
              }
**/
              alert(syncCache.get(key_app));
              syncCache.delete(key_app);
              syncCache.delete(key_flag);
              syncCache.delete(key_likes);
              syncCache.delete(key_byauthor);
              syncCache.delete(key_comments);
              syncCache.delete(key_commentsflag);
          }

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

          // Only use memcache if we are on Google App Engine.
          if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
          {

	      var memcacheServiceFactory;
	      var syncCache;
              var value;
/*
	      // Setting up memcache references
	      memcacheServiceFactory = 
                Packages.com.google.appengine.api.memcache.MemcacheServiceFactory;
	      syncCache = memcacheServiceFactory.getMemcacheService();	
              // Check if item in memcache, if it exists we flush it
	      value = syncCache.get(data.uid); 
              if (value != null) {
              // After pulling data, make sure to clear memcache
              syncCache.clearAll();

              }*/
          }

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
/**
          // Only use memcache if we are on Google App Engine.
          if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
          {

	      var memcacheServiceFactory;
	      var syncCache;

	      // Setting up memcache references
	      memcacheServiceFactory = 
                Packages.com.google.appengine.api.memcache.MemcacheServiceFactory;
	      syncCache = memcacheServiceFactory.getMemcacheService();	
              // After pulling data, make sure to clear memcache
              syncCache.clearAll();
          }**/

          
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
