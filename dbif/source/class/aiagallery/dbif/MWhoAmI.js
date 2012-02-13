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
    }
  }
});
