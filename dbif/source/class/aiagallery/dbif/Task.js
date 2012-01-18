/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.Task",
{
  extend : qx.core.Object,
  
  statics :
  {
    /**
     * Process a scheduled task.
     */
    process : function(requestData)
    {
      var             dbif =  aiagallery.dbif.DbifAppEngine.getInstance();

      java.lang.System.out.println(
        liberated.dbif.Debug.debugObjectToString(requestData, "Task"));
      
      switch(requestData.type)
      {
      case "postAppUpload":
        dbif._postAppUpload(requestData);
        break;
        
      default:
        throw (
          {
            code    : 297,
            message : "Unrecognized request type: " + requestData.type
          });
      }
    }
  }
});
