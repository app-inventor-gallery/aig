/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MWhoAmI",
{
  construct : function()
  {
    this.registerService("aiagallery.features.whoAmI",
                         this.whoAmI,
                         []);

    this.registerService("aiagallery.features.getUserProfile",
                         this.getUserProfile,
                         []);

    this.registerService("aiagallery.features.editUserProfile",
                         this.editUserProfile,
                         []);

    this.registerService("aiagallery.features.getPublicUserProfile",
                         this.getPublicUserProfile,
                         ["user"]);
  },

  members :
  {
    /**
     * Return the user's current login information and, optionally a logout
     * URL.
     */
    whoAmI : function()
    {
      var             ret;
      var             me;
      var             whoami;
      
      // Get the object indicating who we're logged in as
      whoami = this.getWhoAmI();
      
      // Are they logged in?
      if (! whoami)
      {
        // Nope.
        return({
                 id                : "",
                 email             : "anonymous",
                 displayName       : "",
                 isAdmin           : false,
                 logoutUrl         : "",
                 permissions       : [],
                 hasSetDisplayName : true
               });
      }
      
      // Obtain this dude's Visitor record
      me = new aiagallery.dbif.ObjVisitors(whoami.id);
      
      // Create the return object, initialized to a clone of whoami.
      ret =
        {
          id                : String(whoami.id),
          email             : String(whoami.email),
          displayName       : String(whoami.displayName),
          isAdmin           : whoami.isAdmin,
          logoutUrl         : (qx.lang.Type.isArray(whoami.logoutUrl)
                               ? qx.lang.Array.clone(whoami.logoutUrl)
                               : String(whoami.logoutUrl)),
          permissions       : (qx.lang.Type.isArray(whoami.permissions)
                               ? qx.lang.Array.clone(whoami.permissions)
                               : []),
          hasSetDisplayName : whoami.hasSetDisplayName
        };

      return ret;
    },

    /**
     * Retrun the user profile information in the form of a map.
     * This function operates similiar whoAmI, but will differnt more data
     * 
     * @return {Map}
     *   A map of all the user data to display in the myself module
     * 
     */ 
    getUserProfile : function()
    {

      var             ret;
      var             me;
      var             meData; 
      var             whoami;
      
      // Get the object indicating who we're logged in as
      whoami = this.getWhoAmI();
      
      // Are they logged in?
      if (! whoami)
      {
        // Nope.
        return({
                 id                : "",
                 email             : "anonymous"
               });
      }
      
      // Obtain this dude's Visitor record
      me = new aiagallery.dbif.ObjVisitors(whoami.id);
      meData = me.getData();

      // Create the return object with the vistor data
      ret =
        {
          id                : String(whoami.id),
          email             : String(whoami.email),
          displayName       : String(whoami.displayName),
          hasSetDisplayName : whoami.hasSetDisplayName,
          location          : meData.location,
          bio               : meData.bio,
          birthYear         : meData.birthYear,
          birthMonth        : meData.birthMonth
        };

      return ret;

    },

   /**
    * Receive a user data map, parse it and update the user's
    * profile data.  
    *
    * @param userDataMap {Map}
    *  Map of all the userData we are going to update
    * 
    * @return {Boolean}
    *  Return True if completed succesfully, false otherwise.
    * 
    */
    editUserProfile : function(userDataMap)
    {

      var          _this = this;

      // Lock DB for editing
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          var           whoami;
          var           me;
          var           meData;

          // Get the object indicating who we're logged in as
          whoami = _this.getWhoAmI();
      
          // Are they logged in?
          if (! whoami)
          {
            // Nope. This is an error 
            return false;

          }

          // Obtain this dude's Visitor record
          me = new aiagallery.dbif.ObjVisitors(whoami.id);
          meData = me.getData();
 
          // Update with new info
          meData.bio = userDataMap.bio;
          meData.location = userDataMap.location;
          meData.birthYear = parseInt(userDataMap.birthYear);
          meData.birthMonth = userDataMap.birthMonth;
          meData.email = userDataMap.email;
          meData.displayName = userDataMap.displayName;

          // Write back to DB
          me.put();

          return true;

        });
    },

   /**
    * Receive a username, search for the user and return a map
    *  of data to display on the profile page
    *
    * @param user {String}
    *  The username in question
    * 
    * @return {Map}
    *  A map of the user data to display
    * 
    */
    getPublicUserProfile : function(user)
    {
      var              criteria;
      var              resultList;
      var              userObj;
      
      criteria = 
        {
          type  : "element",
          field : "displayName",
          value : user
        }; 
        
      // Check to ensure name is unique
      resultList = 
        liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                    criteria);
                              

      // Should return one and only one username
      /*
      if (resultList.lenght != 1) 
      {
        error.setCode(2);
        error.setMessage("The display name you specified: \"" + user +
                         "\" cannot be found."); 

        throw error;
      }
      */ 
      // Parse user data into map
      return resultList[0];

    }

  }
});
