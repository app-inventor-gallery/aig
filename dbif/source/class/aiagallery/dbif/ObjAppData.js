/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjAppData",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(uid)
  {
    // Pre-initialize the data
    this.setData(
      {
        "newimage1"       : null,
        "image1"          : null,
        "newsource"       : [],
        "source"          : [],
        "tags"            : [],
        "numLikes"        : 0,
        "numDownloads"    : 0,
        "numViewed"       : 0,
        "numComments"     : 0,
        "status"          : aiagallery.dbif.Constants.Status.Active,
        "creationTime"    : aiagallery.dbif.MDbifCommon.currentTimestamp(),
	"lastViewedTime"  : null,  
	"numRootComments" : 0,
        "numCurFlags"     : 0
      });

    // Call the superclass constructor
    this.base(arguments, "apps", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "apps");

    var databaseProperties =
      {
        /** The owner of the application (id of Visitor object) */
        "owner" : "String",

        /** The application title */
        "title" : "String",

        /** Description of the application */
        "description" : "String",

        /** New (to be processed) image #1 (data: or real URL) */
        "newimage1" : "LongString",

        /** Image #1 (data: or real URL) */
        "image1" : "LongString",

        /** Image #1 blob id */
        "image1blob" : "BlobId",

        /** Blob ids of source ZIP file (base64-encoded), newest first */
        "newsource" : "BlobIdArray",

        /** Blob ids of source ZIP file (raw), newest first */
        "source" : "BlobIdArray",

        /** File Name of Source File */
        "sourceFileName" : "String",

        /** Blob ids of executable APK file (base64-encoded), newest first */
        "newapk" : "BlobIdArray",

        /** Blob ids of executable APK file (raw), newest first */
        "apk" : "BlobIdArray",

        /** File Name of APK File */
        "apkFileName" : "String",

        /** Tags assigned to this application */
        "tags" : "StringArray",

        /** Time the most recent Source ZIP file was uploaded */
        "uploadTime" : "Date",
        
        /** The date and time this App was first created */
        "creationTime" : "Date",

        /** The date this App was last viewed */
        "lastViewedTime" : "Date", 

        /** Number of "likes" of this application */
        "numLikes" : "Integer",

        /** Number of downloads of this application */
        "numDownloads" : "Integer",

        /** Number of times this application was viewed */
        "numViewed" : "Integer",

        /** Number of root comments on this application */
        "numRootComments" : "Integer",
        
        /** Total number of comments on this application */
        "numComments" : "Integer",

        /** Status of this application (active, pending, banned) */
        "status" : "Integer",

        /** Total number of flags on this application */
        "numCurFlags" : "Integer"
      };

    var canonicalize =
      {
        "tags" :
        {
          // Property in which to store the canonical value. This will be a
          // new string array.
          prop : "tags_lc",
          
          // The canonical value will be a string array
          type : "StringArray",

          // Function to convert a value to lower case
          func : function(value)
          {
            if (! value)
            {
              return value;
            }
            
            return value.toLowerCase();
          }
        }
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("apps", 
                                                 databaseProperties,
                                                 null,
                                                 canonicalize);
  }
});
