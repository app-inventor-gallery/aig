/**
 * Copyright (c) 2011 Derrell Lipman
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
    SINGLETON : 0
  }, 
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "system");

    var databaseProperties =
      {
        /** The objects key */
        "key" : "Number",
        
        /** Actual content of the message of the day */
        "motd" : "String",

        /** Time the motd was last edited occurred */
        "lastUpdated" : "Date"
        
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("system",
                                                 databaseProperties);
  }
});