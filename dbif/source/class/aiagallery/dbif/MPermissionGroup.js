/**
 * Copyright (c) 2011 Reed Spool
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MPermissionGroup",
{
  construct : function()
  {
    this.registerService("aiagallery.features.addPermissionGroup",
                         this.addPermissionGroup,
                         [ "appId" ]);

    this.registerService("aiagallery.features.updatePermissionGroup",
                         this.updatePermissionGroup,
                         []); 

    this.registerService("aiagallery.features.getPermissionGroup",
                         this.getPermissionGroups);

    this.registerService("aiagallery.features.getPermissionGroup",
                         this.getPermissionGroup,
                         [ "uid" ]);
  },

  members :

{

    /**
     * Create a new permission group
     *
     * @param pGroupName {String}
     *   This is a string to identify the name of the permission group
     *
     * @return {Boolean || Error}
     *   This returns the actual permission group object, or an error if
     *   something went wrong
     *
     */
     addPermissionGroup : function(pGroupName)
     {
        //Create a new permission group
        //Use default permissions
        var pGroup = new aiagallery.dbif.ObjPermissionGroup(pGroupName);   

        if (pGroup.getBrandNew() == false)
        {
           //Object already exists return error
           return false;
        }
 
        //New permission group, set with default information
        var pGroupData = pGroup.getData();

        pGroupData.name = pGroupName;
        pGroupData.permissions = ["addOrEditApp", "deleteApp", "addComment", 
                                  "deleteComment", "flagIt", "likesPlusOne"]; 

        //Put this on the databse   
        pGroup.put(); 

        return pGroupData; 

      }
   }
}); 
