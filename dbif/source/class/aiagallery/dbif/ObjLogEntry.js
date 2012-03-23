/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjLogEntry",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(uid )
  {
    var             key;
    
    // Pre-initialize the data
    this.setData(
      {
        "visitor"   : null,
        "code"      : null,
        "params"    : [],
        "timestamp" : aiagallery.dbif.MDbifCommon.currentTimestamp()
      });

    // Call the superclass constructor
    this.base(arguments, "logentry", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "logentry");

    var databaseProperties =
      {
        /** Id of the Visitor for whom this log entry applies */
        "visitor" : 
        {
          type      : "String",
          reference : "visitors"
        },
        
        /** Code identifying a (translatable) message */
        "code"      : "String",
        
        /** Parameters to message */
        "params"    : "StringArray",

        /** Time the log entry was issued */
        "timestamp" : "Date"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("logentry",
                                                 databaseProperties);
  }
});
