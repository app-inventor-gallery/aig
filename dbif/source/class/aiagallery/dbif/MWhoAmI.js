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
      if (!whoami )
      {
        // Nope.
        return({
                 id                : "",
                 email             : "anonymous",
                 displayName       : "",
                 isAdmin           : false,
                 logoutUrl         : "",
                 permissions       : [],
                 hasSetDisplayName : true,
                 isAnonymous       : true
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
          hasSetDisplayName : whoami.hasSetDisplayName,
          isAnonymous       : false
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
          birthMonth        : meData.birthMonth,
          org               : meData.organization,
          url               : meData.url,
          showEmail         : meData.showEmail 
        };

      return ret;

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
    getPublicUserProfile : function(user, error)
    {
      var              criteria;
      var              resultList;
      var              requestedFields;
      var              profile;

      requestedFields = {
        uid :  "uid",
        owner : "owner",
        image1 :"image1",
        title :"title",
        displayName : "displayName"
      }; 
      
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
      if (resultList.length != 1) 
      {
        error.setCode(2);
        error.setMessage("The display name you specified: \"" + user +
                         "\" cannot be found."); 

        return error;
      }
      

      profile = resultList[0];
    
      criteria = 
        {
          type : "op",
          method : "and",
          children : 
          [
            {
              type: "element",
              field: "owner",
              value: profile.id
            },
            {
              type: "element",
              field: "status",
              value: aiagallery.dbif.Constants.Status.Active
            }
          ]
        };

      resultList =
        liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData", 
                                    criteria);       
      

      // Add the author's name to each app
      resultList.forEach(
        function(app)
        {
          app.displayName = user || "<>";

          // Clear out unneeded fields
          aiagallery.dbif.MApps._requestedFields(app, requestedFields);

          // Remove the owner field
          delete app.owner;
        });


      // Add in a list of user authored apps 
      profile["authoredApps"] = resultList; 
 
      // Not allowed to return user id
      delete profile.id; 

      // If the user does not want to show email
      // do not return it
      if (profile.showEmail == 0)
      {
        delete profile.email;
      }

      return profile;
    }

  }
});
