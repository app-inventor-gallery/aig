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
    this.registerService("getDatabaseEntities",
                         this.getDatabaseEntities,
                         [ "entityType", "bUseRootKey" ]);
  },

  members :
  {
    /**
     * Get all of the entities of a given type.
     *
     * @param entityType {String}
     *   The entity type to retrieve
     *
     * @param bUseRootKey {Boolean?true}
     *   Whether to use a root key. (This should always be true unless you
     *   REALLY know what you're doing.)
     *
     * @return {Array}
     *   Array of maps of entity data
     */
    getDatabaseEntities : function(entityType, bUseRootKey, error)
    {
      var             criteria;
      var             results;
      var             bOldUseRootKey;

      // Set default value
      if (typeof bUseRootKey == "undefined")
      {
        bUseRootKey = true;
      }

      try
      {
        // If specified, set use of the root key
        if (liberated.dbif.Entity.custom.dbif == "appengine")
        {
          bOldUseRootKey = 
            liberated.dbif.Entity.custom.initRootKey(bUseRootKey);
        }

        // Query for all entities of the given type
        results = liberated.dbif.Entity.query(entityType);

        // reset use of the root key
        if (typeof bOldUseRootKey != "undefined")
        {
          liberated.dbif.Entity.custom.initRootKey(bOldUseRootKey);
        }

        return results;
      }
      catch(e)
      {
        error.setCode(1);
        error.setMessage("Unknown entity type: " + entityType);
        return error;
      }
    }
  }
});
