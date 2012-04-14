/**
 * Copyright (c) 2011 Paul Geromini 
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MSystem",
{
  construct : function()
  {
    this.registerService("aiagallery.features.getMotd",
                         this.getMotd,
                         []);

    this.registerService("aiagallery.features.saveMotd",
                         this.saveMotd,
                         [ "motdContent" ]);

  },

  members :
  {
    /** 
     * Create a new motd or save a new message for an already existing motd
     *
     * @param motdContent {String}
     *   The actual string content of the new motd
     *
     * @return {String || Error}
     *   This returns the actual motd string, or an error if
     *   something went wrong
     */
     saveMotd : function(motdContent)
     {
       var             systemObj;
       var             systemObjData;
       
       return liberated.dbif.Entity.asTransaction( 
         function()
         {
           // Retrieve or create a new system object which contains the motd 
           systemObj = 
             new aiagallery.dbif.ObjSystem(aiagallery.dbif.ObjSystem.SINGLETON);

           // Get the data
           systemObjData = systemObj.getData();

           // Update content
           systemObjData.motd = motdContent;

           // Put this on the databse   
           systemObj.put(); 

           // Return new motdData string
           return systemObjData.motd; 
         }); 
     },
     
    /** 
     * Get the existing motd
     *
     * @return {String || Error}
     *   This returns the actual motd content, or an error if
     *   something went wrong
     */
     getMotd : function()
     {
       var             systemObj;
       var             systemObjData;
       
       // Get the system object
       systemObj = 
         new aiagallery.dbif.ObjSystem(aiagallery.dbif.ObjSystem.SINGLETON);

       // Get the system object
       systemObjData = systemObj.getData();

       // Return the string motd
       return systemObjData.motd; 
     
     }
  }
}); 
