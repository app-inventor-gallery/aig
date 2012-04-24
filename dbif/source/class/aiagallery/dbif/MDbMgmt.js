/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MDbMgmt",
{
  construct : function()
  {
    this.registerService("aiagallery.features.getDatabaseEntities",
                         this.getDatabaseEntities,
                         [ "entityType" ]);
  },

  members :
  {
    /**
     * Get all of the entities of a given type.
     *
     * @param entityType {String}
     *   The entity type to retrieve
     *
     * @return {Array}
     *   Array of maps of entity data
     */
    getDatabaseEntities : function(entityType, error)
    {
      var             criteria;
      var             results;
      var             bOldUseRootKey;

      try
      {
        // Query for all entities of the given type
        results = liberated.dbif.Entity.query(entityType);
        return results;
      }
      catch(e)
      {
        error.setCode(1);
        error.setMessage("Unknown entity type");
        error.setData(
          {
            entityType : entityType
          });
        return error;
      }
    }
  }
});
