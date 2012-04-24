/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.Constants",
{
  extend  : qx.core.Object,

  statics :
  {
    /** 
     *  Value of the maximum amount of times an app or comment 
     *  can be flagged 
     */
    MAX_FLAGGED           : 5,

    /** Number of "newest" apps to return by the getHomeRibbonData() RPC */
    RIBBON_NUM_NEWEST     : 20,
    
    /** Number of "most liked" apps to return by the getHomeRibbonData() RPC */
    RIBBON_NUM_MOST_LIKED : 20,
    
    /** Name of the permission group used for the white list */
    WHITELIST             : "Whitelist",


    //
    // DEVELOPER NOTE:
    //
    //   Never change values associated with existing status entries. When
    //   adding new entries, add them at the end of the list, with previously 
    //   unused values. The database contains numeric values that would all
    //   otherwise need to be updated.
    //

    /** Mapping of status names to values */
    Status      : 
    {
      Banned      : 0,
      Pending     : 1,
      Active      : 2,
      Unpublished : 3,
      Invalid     : 4,
      Incomplete  : 5,
      Editing     : 6,
      NotSaved    : 7,
      Uploading   : 8,
      Processing  : 9
    },
    
    /** Reverse mapping of status: values to names */
    StatusToName :
    [
      "Banned", 
      "Under review",
      "Active",
      "Unpublished",
      "Invalid",
      "Incomplete",
      "Editing",
      "Not saved!",
      "Uploading",
      "Processing"
    ],

    /** Maximum length of input fields */
    FieldLength :
    {
      Title       : 30,
      Description : 480,
      Tags        : 20,
      Comment     : 480
    },

    /** Mapping of FlagType names to values */
    FlagType      : 
    {
      App  : 0,
      Comment : 1
    },

    /** Reverse mapping of FlagType values to names */
    FlagTypeToName :
    [
      "App", 
      "Comment"
    ],

    /** Mapping of permission names to descriptions */
    Permissions :
    {
      //
      // MApps
      //
      "addOrEditApp"    : "Add and edit applications",
      "deleteApp"       : "Delete applications",
      "getAppListAll"   : "Get all users application list",
      "mgmtEditApp"     : "Managment override for application management",
      "setFeaturedApps" : "Specify the set of featured apps",

      /* Anonymous access...
      "getAppList"               : "Get logged in user application list",
      "getHomeRibbonData"        : "Retrieve apps displayed on home page",
      "appQuery"                 : "Query for applications",
      "intersectKeywordAndQuery" : "Get intersection of keyword search and" +
                                   "appQuery",
      "getAppListByList"         : "Get list of apps given list of UIDs"
      "getAppInfo"               : "Get application detail information",
      ... */
      
      //
      // MComments
      //
      "addComment"   : "Add comments to an application",
      "deleteComment": "Delete comments from an application",
      
      /* Anonymous access...
      "getComments"  : "Retrieve comments about an application",
      ... */
      
      //
      // MFlags
      //
      "flagIt"         : "Flag an app or comment",
      "clearAppFlags"  : "Clear all of an app's flags, and reset count to 0",
      
      //
      // MMobile
      //
      /* Anonymous access...
      "mobileRequest" : "Mobile client requests",
      ... */

      //
      // MSearch
      //
      /* Anonymous access...
      "keywordSearch" : "Search for apps",
      ... */

      //
      // MTags
      //
      /* Anonymous access...
      "getCategoryTags" : "Get the list of category tags",
      ... */
      
      //
      // MVisitors
      //
      "addOrEditVisitor"           : "Add and edit visitors",
      "whitelistVisitors"          : "Edit the whitelist",
      "deleteVisitor"              : "Delete visitors",
      "editProfile"                : "Edit user profile",
      "getVisitorListAndPGroups"   : "Retrieve list of visitors",
      
      //
      // MWhoAmI
      //
      /* Anonymous access...
      "whoAmI" : "Identify the current user id and permissions"
       */

      //
      // MLikes
      //
      "likesPlusOne"     : "Like an app",

      //
      // MDbMgmt
      //
      "getDatabaseEntities" : "Retrieve all database entities of a given type",
      
      //
      // MPermissionGroup
      //
      "addOrEditPermissionGroup" : "Add/edit permission groups",
      "getGroupPermissions"      : "Retrieve permission groups",
      "deletePermissionGroup"    : "Delete a permission group",
      "getPermissionGroups"      : "Retrieve the list of permission groups",
      
      //
      // MChannel
      //
      "getChannelToken" : "Request server push"
    },
    
    // Error codes
    ErrorCode :
    {
      "UnknownUID" : 
      {
        code    : 1,
        message : this.tr("Unrecognized UID")
      },
      
      "NotOwner"   : this.tr("Not owner"),
      "Field data too long" : 3,
      "Invalid image data" : 4,
      "At least one category is required" : 5,
      "No keyword or search criteria given" : 1,
      "Application is not available. " : 1,
      "Empty Comment" : 3,
      "Unrecognized parent treeId" : 1,
      "Attempted to overwrite existing comment" : 3,
      "Unknown entity type" : 1,
      "Application with that ID not found. Unable to flag." : 1,
      "Comment not found. Unable to flag." : 2,
      "unknown flag type." : 3,
      "Reached an un-reachable section in the flagIt rpc." : 4,
      "Reached an un-reachable section in the flagIt rpc." : 4,
      "App with that ID not found. Unable to like." : 1,
      "Unrecognized request" : 1,
      "Malformed mobile request: Incorrect parameter type." : 5,
      "No search terms given" : 3,
      "No tag name given" : 3,
      "No developer's display name given" : 3,
      "Developer not found" : 4,
      "No App UID given" : 3,
      "At least 1 keyword required for keyword search" : 3,
      "Unexpected parameter type" : 1,
      "Display name must be between 2 and 30 characters." : 2,
      "The display name you specified is already in use." : 2
    },

    // Log messages. Comments above each are required parameters
    LogMessage :
    {
      // [ title ]
      "App submitted" : "Application submitted, being processed",
      
      // [ title (if available) ]
      "App incomplete" : "Application submitted but is incomplete",

      // [ title, imageNumber ]
      "Invalid image" : "An invalid image was uploaded",
      
      // [ title ]
      "Unknown app error" : "An unexpected error occurred while processing app",
      
      // [ title ]
      "App available" : "The application is now available",
      
      // [ title]
      "App removed" : "The application has been removed"
    }
  }
});
