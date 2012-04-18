/**
 * Copyright (c) 2012 Paul Geromini
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjSystem",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(key)
  {
    // Pre-initialize the data
    this.setData(
      {
        "key"           : key,
        "motd"          : null,
        "lastUpdated"   : aiagallery.dbif.MDbifCommon.currentTimestamp()
      });
       
    // Call the superclass constructor
    this.base(arguments, "system", key);
    
  },
  
  statics : 
  { 
    /** The key for the one and only ObjSystem object ever created */ 
    SINGLETON : 0
  }, 
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "system");

    var databaseProperties =
      {
        /** The object's key */
        "key" : "Number",
        
        /** Actual content of the message of the day */
        "motd" : "String",

        /** Time the motd was last edited occurred */
        "lastUpdated" : "Date"
        
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("system",
                                                 databaseProperties,
                                                 "key");
  }
});
