/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MDbifCommon",
{
  include :
  [
    aiagallery.dbif.MVisitors,
    aiagallery.dbif.MApps,
    aiagallery.dbif.MTags,
    aiagallery.dbif.MMobile,
    aiagallery.dbif.MComments,
    aiagallery.dbif.MWhoAmI,
    aiagallery.dbif.MChannel,
    aiagallery.dbif.MSearch,
    aiagallery.dbif.MLiking,
    aiagallery.dbif.MDownloads,
    aiagallery.dbif.MFlags,
    aiagallery.dbif.MDbMgmt,
    aiagallery.dbif.MSystem,
    aiagallery.dbif.MPermissionGroup
  ],

  construct : function()
  {
    // Provide easy access to the error codes and messages
    this.ErrorCode = aiagallery.dbif.Constants.ErrorCode;

    // Use our authorization function
    liberated.AbstractRpcHandler.authorizationFunction =
      function(fqMethod)
      {
        var             me;
        var             meData;
        var             displayName;
        var             bAllowed;

        // Call the real authorizer function. It returns true if allowed.
        bAllowed = aiagallery.dbif.MDbifCommon.authenticate(fqMethod);

        // If we're on App Engine...
        if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
        {
          // ... then log who's trying to do what. First, is someone logged in?
          if (aiagallery.dbif.MDbifCommon.__whoami)
          {
            // Yup. Retrieve our visitor object
            me = new aiagallery.dbif.ObjVisitors(
              aiagallery.dbif.MDbifCommon.__whoami.id);

            // Is it brand new, or does not contain a display name yet?
            meData = me.getData();
            if (me.getBrandNew() || meData.displayName === null)
            {
              throw new Error("Programming error, this should not be reachable."
                              + " Identify() in DbifAppEngine should be called "
                              + "first"); 
            }
            else
            {
              // We know this guy. Use his real display name
              displayName =
                aiagallery.dbif.MDbifCommon.__whoami.id + 
                " (" + meData.displayName + ")";
            }
          }
          else
          {
            // No one is logged in
            displayName = "anonymous";
          }
          
          // Now log a message. stdout if allowed; stderr if not
          if (bAllowed)
          {
            java.lang.System.out.println(displayName + ", method: " + fqMethod);
          }
          else
          {
            java.lang.System.err.println("Permission denied to " +
                                         displayName + ", method: " + fqMethod);
          }
        }
        
        return bAllowed;
      };
  },

  properties :
  {
    /**
     * Information about the currently-logged-in user. The value is a map
     * containing the fields: id, email, displayName, and isAdmin.
     */
    whoAmI :
    {
      nullable : true,
      init     : null,
      check    : "Object",
      apply    : "_applyWhoAmI"
    }
  },

  members :
  {
    /**
     * Add a log message for the specified visitor.
     * 
     * @param visitor {Number}
     *   The id of a specific existing visitor
     * 
     * @param messageCode {String}
     *   A key from the aiagallery.dbif.Constants.LogMessage map
     * 
     * @param varargs {Any}
     *   Additional parameters to be added to the log message
     */
    logMessage : function(visitor, messageCode, varargs)
    {
      var             logEntry;
      var             data;
      
      // Get a new log entry object
      logEntry = new aiagallery.dbif.ObjLogEntry();
      
      // Retrieve the data map
      data = logEntry.getData();

      // Set the property values
      data.visitor = visitor;
      data.code = messageCode;
      data.params = qx.lang.Array.fromArguments(arguments, 2);
      
      // Save the log message
      logEntry.put();
    },

    _applyWhoAmI : function(value, old)
    {
      aiagallery.dbif.MDbifCommon.__whoami = value;
      
      // Be sure this visitor is in the database
      if (typeof value == "object" &&
          value !== null &&
          typeof value.id == "string" &&
          value.id.length > 0)
      {
        liberated.dbif.Entity.asTransaction(
          function()
          {
            var             visitor;
            var             data;

            visitor = new aiagallery.dbif.ObjVisitors(value.id);
            if (visitor.getBrandNew())
            {
              data = visitor.getData();
              data.email = value.email;
              data.displayName = value.displayName;
              visitor.put();
            }
          });
      }
    }
  },

  statics :
  {
    __whoami : null,
    __isAdmin : null,
    __initialized : false,

    /**
     * Standardized time stamp for all Date fields
     *
     * @return {Integer}
     *   The number of milliseconds since midnight, 1 Jan 1970
     */
    currentTimestamp : function()
    {
      return new Date().getTime();
    },

    /**
     * Function to be called for authorization to run a service
     * method.
     *
     * @param fqMethod {String}
     *   The fully-qualified name of the method to be called
     *
     * @return {Boolean}
     *   true to allow the function to be called, or false to indicates
     *   permission denied.
     */
    authenticate : function(fqMethod)
    {
      var             methodComponents;
      var             methodName;
      var             serviceName;
      var             me;
      var             meData;
      var             meObjVisitor;
      var             mePermissionGroups;
      var             bAnonymous;

      // Have we yet initialized the user object?
      if (aiagallery.dbif.MDbifCommon.__whoami &&
          ! aiagallery.dbif.MDbifCommon.__initialized)
      {
        // Nope. Retrieve our visitor object
        me = new aiagallery.dbif.ObjVisitors(
          aiagallery.dbif.MDbifCommon.__whoami.id);

        // Is it brand new, or does not contain a display name yet?
        meData = me.getData();
        if (me.getBrandNew() || meData.displayName === null)
        {
          // True. Save it.
          if (! meData.displayName)
          {
            meData.displayName =
              aiagallery.dbif.MDbifCommon.__whoami.displayName;
          }
        }

        // Update the time of their last connection
        meData.connectionTimestamp = 
          aiagallery.dbif.MDbifCommon.currentTimestamp();
        
        // Write changed data
        me.put();

        // We're now initialized
        aiagallery.dbif.MDbifCommon.__initialized = true;
      }

      // Split the fully-qualified method name into its constituent parts
      methodComponents = fqMethod.split(".");

      // The final component is the actual method name
      methodName = methodComponents.pop();

      // The remainder is the service path. Join it back together.
      serviceName = methodComponents.join(".");

      // Ensure that the service name is what's expected. (This should never
      // occur, since the RPC server has already validated that the method
      // exists.)
      if (serviceName != "aiagallery.features")
      {
        // It's not. Do not allow access.
        return false;
      }

      // If the user is an adminstrator, ...
      if (aiagallery.dbif.MDbifCommon.__whoami &&
          aiagallery.dbif.MDbifCommon.__whoami.isAdmin)
      {
        // ... they implicitly have access.
        return true;
      }

      // Do per-method authorization.

      // Are they logged in, or anonymous?
      bAnonymous = (aiagallery.dbif.MDbifCommon.__whoami === null);

      switch(methodName)
      {

      //
      // MApps
      //
      case "getAppList":
        return ! bAnonymous;    // Access is allowed if they're logged in

      case "addOrEditApp":
      case "deleteApp":
      case "mgmtDeleteApp":
      case "getAppListAll":
      case "mgmtEditApp":
      case "clearAppFlags":
      case "setFeaturedApps":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "appQuery":
      case "intersectKeywordAndQuery":
      case "getAppInfo":
      case "getAppListByList":
      case "getHomeRibbonData":
          return true;            // Anonymous access

      //
      // MComments
      //
      case "addComment":
      case "deleteComment":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "getComments":
        return true;            // Anonymous access

      //
      // MFlags
      //
      case "flagIt":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      //
      // MMobile
      //
      case "mobileRequest":
        return true;            // Anonymous access

      //
      // MSearch
      //
      case "keywordSearch":
        return true;            // Anonymous access

      //
      // MTags
      //
      case "getCategoryTags":
        return true;            // Anonymous access

      //
      // MVisitors
      //
      case "addOrEditVisitor":
      case "whitelistVisitors":
      case "deleteVisitor":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "editProfile":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "getVisitorListAndPGroups":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      //
      // MWhoAmI
      //
      case "whoAmI":
        return true;            // Anonymous access

      //
      // MSearch
      //
      case "keywordSearch":
        return true;          // Anonymous access

      //
      // MLiking
      //
      case "likesPlusOne":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      //
      // MDbMgmt
      //
      case "getDatabaseEntities":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      //
      // MPermissionGroup
      //
      case "addOrEditPermissionGroup" :
      case "getGroupPermissions" :
      case "deletePermissionGroup" :
      case "getPermissionGroups" :
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      //
      // MChannel
      //
      case "getChannelToken" :
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      default:
        // Do not allow access to unrecognized method names
        return false;
      }

    },


    _deepPermissionCheck : function(methodName)
    {
      // Find out who we are.
      var whoami = aiagallery.dbif.MDbifCommon.__whoami;

      // If no one is logged in...
      if (! whoami)
      {
        // ... then they do not have permission
        return false;
      }

      // Retrieve this user's full list of permissions (already expanded to
      // include permissions gleaned from permission groups).
      var permissionArr = whoami.permissions || [];

      // Standard check: Does my permission list contain this method?
      if (permissionArr != null &&
          qx.lang.Array.contains(permissionArr, methodName))
      {
        // Yes, allow me.
        return true;
      }

      // Permission not found 
      return false; 
    }
  }
});
