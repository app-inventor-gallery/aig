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
    this.registerService("aiagallery.features.addOrEditPermissionGroup",
                         this.addOrEditPermissionGroup,
                         [ "pGroupName", "pArray", "descString" ]);

    this.registerService("aiagallery.features.getGroupPermissions",
                         this.getGroupPermissions,
                         [ "pGroupName" ]);

    this.registerService("aiagallery.features.deletePermissionGroup",
                         this.deletePermissionGroup,
                         [ "pGroupName" ]);

    this.registerService("aiagallery.features.getPermissionGroups",
                         this.getPermissionGroups,
                         []);

  },

  members :
  {
    /**
     * Create a new permission group, edit an existing one
     *
     * @param pGroupName {String}
     *   This is a string to identify the name of the permission group
     *
     * @param pArray {Array}
     *   An array of strings of permissions
     *
     * @param descString {String}
     *   The description string
     *
     * @return {PermissionGroup || Error}
     *   This returns the actual permission group object, or an error if
     *   something went wrong
     *
     */
    addOrEditPermissionGroup : function(pGroupName, pArray, descString)
    {
      var       pGroup;
      var       pGroupData;

      return liberated.dbif.Entity.asTransaction( 
        function()
        {
          // Retrieve or create a new permission group
          // Use default permissions, if new
          pGroup = new aiagallery.dbif.ObjPermissionGroup(pGroupName);   

          // Get the group data
          pGroupData = pGroup.getData();

          // Update Permisssions
          pGroupData.permissions = pArray;

          // Use user supplied description
          pGroupData.description = descString; 

          // Put this on the databse   
          pGroup.put(); 

          // Return new pGroup Data
          return pGroupData; 
        }); 
    },

    /**
     * Get the permissions attached to a permission group
     * 
     * @param pGroupName {String}
     *   This is a string to identify the name of the permission group
     *
     * @return {PermissionGroup || Error}
     *   This returns the actual permission group object, or an error if
     *   something went wrong
     *
     */
    getGroupPermissions : function(pGroupName)
    {       
      var       pGroup;
      var       pGroupData;

      // Get the permission group
      pGroup = new aiagallery.dbif.ObjPermissionGroup(pGroupName);   

      // Get the permission data 
      pGroupData = pGroup.getData();

      // Return the data
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
      var      pGroup;

      //Get permission group data
      pGroup = new aiagallery.dbif.ObjPermissionGroup(pGroupName);   

      if (pGroup.getBrandNew() == true)
      {
         //Object does not exist. Return error
         return false;
      }

      pGroup.removeSelf(); 
      return true; 
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
      //Execute the query
      var permissionGroupsList = liberated.dbif.Entity.query(
                                "aiagallery.dbif.ObjPermissionGroup");

      //Return the permission group list
      return permissionGroupsList;
    }
  }
}); 
