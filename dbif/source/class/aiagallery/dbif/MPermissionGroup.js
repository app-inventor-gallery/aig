/**
 * Copyright (c) 2011 Paul Geromini 
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
                         [ "name" ]);

    this.registerService("aiagallery.features.deletePermissionGroup",
                         this.deletePermissionGroup,
                         [ "name" ]);

    this.registerService("aiagallery.features.updatePermissionGroup",
                         this.updatePermissionGroup,
                         [ "name" ]); 

    this.registerService("aiagallery.features.getPermissionGroup",
                         this.getPermissionGroups);

    this.registerService("aiagallery.features.getPermissionGroup",
                         this.getPermissionGroup,
                         [ "name" ]);

  },

  members :
  {

    /**
     * Create a new permission group
     *
     * @param pGroupName {String}
     *   This is a string to identify the name of the permission group
     *
     * @return {PermissionGroup || Error}
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
        //Empty permission array
        pGroupData.permissions = []; 

        //Put this on the databse   
        pGroup.put(); 

        return pGroupData; 

    },

    /**
     * Delete a permission group.
     *
     * @param pGroupName {String}
     *   This is a string to identify the name of the permission group
     *
     * @return {Boolean || Error}
     *   Returns true if delete was succesful, or an error if
     *   something went wrong
     *
     */
     deletePermissionGroup : function(pGroupName)
     {
        //Get permission group data
        var pGroup = new aiagallery.dbif.ObjPermissionGroup(pGroupName);   

        if (pGroup.getBrandNew() == true)
        {
           //Object does not exists return error
           return false;
        }
      
        pGroup.removeSelf(); 

        return true; 

    },

    /**
     * Update a permission group
     *
     * @param pName {String}
     *   This is a string to identify the name of the permission group
     *
     * @param pArray {Array}
     *   This is an array of strings with the updated permissions
     *
     * @return {PermissionGroup || Error}
     *   This returns the actual permission group object, or an error if
     *   something went wrong
     *
     */
     updatePermissionGroup : function(pName, pArray)
     {
        //Get the permission group
        var pGroup = new aiagallery.dbif.ObjPermissionGroup(pName);   

        if (pGroup.getBrandNew() == true)
        {
           //Object does not exist return error
           return false;
        }

        //Get the data
        var pGroupData = pGroup.getData();

        //FIXME Ensure permissions exist
 
        //Update Permisssions
        pGroupData.permissions = pArray;

        //Put this on the databse   
        pGroup.put(); 

        //Return updated permission
        return pGroupData; 

     },

    /**
     * Get all the permission groups
     *
     * @return {Array || Error}
     *   This returns an array of permission groups, or an error if
     *   something went wrong
     *
     */
     getPermissionGroups : function()
     {
        // Construct query criteria for permission groups
        criteria = 
          {
            type : "op",
            method : "and",
            children : 
            [
              {
                type: "element",
                field: "permissiongroup"
              },
              {
                type: "element",
                field: "permissions"
              }
            ]
          };
          
          //Execute the query
          permissionGroupsList = liberated.dbif.Entity.query(
                                    "aiagallery.dbif.ObjPermissionGroup",
                                     criteria,
                                     null);
                                     
          //Return the permission group list
          return permissionGroupsList;
     },

 /**
     * Get a specific permission group
     *
     * @param pGroupName {String}
     *   This is a string to identify the name of the permission group
     *
     * @return {PermissionGroup || Error}
     *   This returns the actual permission group object, 
     *   or an error if something went wrong
     *
     */
     getPermissionGroup : function(pGroupName)
     {
        //Create a new permission group
        //Use default permissions
        var pGroup = new aiagallery.dbif.ObjPermissionGroup(pGroupName);   

        if (pGroup.getBrandNew() == true)
        {
           //Object does not exist return error
           return false;
        } else {
           //Object did exist so return its list of permissions
           return pGroup.getData(); 
        }

    }

  }
}); 
