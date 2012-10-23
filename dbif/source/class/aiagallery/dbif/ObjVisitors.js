/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjVisitors",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(id)
  {
    var initialData;

    if (typeof id != "undefined")
    {
      // Pre-initialize the data
      this.setData(
        {
          "id"             : id,
          "displayName"    : null,
          "permissions"    : [],
          "permissionGroups": [],
          "status"         : aiagallery.dbif.Constants.Status.Active,
          "channels"       : [],
          "recentSearches" : [],
          "recentViews"    : [],
          "location"       : "",
          "bio"            : "",
          "url"            : "",
          "organization"   : ""
        });
    }

    // Use the "id" property as the entity key
    this.setEntityKeyProperty("id");
    
    // Call the superclass constructor
    this.base(arguments, "visitors", id);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "visitors");

    var databaseProperties =
      {
        /** The user's numeric id, converted to a string */
        "id" : "String",
        
        /** The user's email address */
        "email" : "String",

        /** How the user's name is displayed in the gallery */
        "displayName" : "String",

        /** A list of explicit permissions assigned to this user */
        "permissions" : "StringArray",
        
        /** 
         * A list of names of permission groups assigned to this user. Each of
         *  these groups gives this user additional explicit permissions 
         */
        "permissionGroups" : "StringArray",

        /** Active, Pending, or Banned (by their numeric values) */
        "status" : "Integer",

        /** Channel ids for server push. One entry per this user's clients */
        "channels" : "StringArray",

        /** A list of the user's recent searches */
        "recentSearches" : "StringArray",

        /** A list of the user's recent application views */
        "recentViews" : "KeyArray",
        
        /** Timestamp of last connection */
        "connectionTimestamp" : "Date",

        /** Short user made biography */
        "bio" : "String",

        /** User's Location */
        "location" : "String",

        /** User's birth year */
        "birthYear" : "Integer",

        /** User's birth month */
        "birthMonth" : "String",

        /** Organization user is associated with */
        "organization" : "String",

        /** User's own website */
        "url" : "String"

      };
      
    var canonicalize = 
      {
        "displayName" :
        {
          // Property in which to store the canonical value. Since we are
          // converting the value to lower case, we'll give the property a
          // name that reflects that.
          prop : "displayName_lc",
          
          // The canonical value will be a string
          type : "String",

          // Function to convert a value to lower case
          func : function(value)
          {
            return (typeof value == "undefined" || value === null
                    ? null
                    : value.toLowerCase());
          }
        }
      };
      
    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("visitors",
                                                 databaseProperties,
                                                 "id",
                                                 canonicalize);
  }
});
