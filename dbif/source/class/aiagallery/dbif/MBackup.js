/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MBackup",
{
  construct : function()
  {
    this.registerService("aiagallery.features.getDatabase",
                         this.getDatabase,
                         []);
  },

  members :
  {
    /**
     * Retrieve the database. All data other than blobs is returned as a
     * JavaScript map. Retrieving blobs must be done independently by the
     * client issuing the request.
     *
     * @return {Map}
     *   The entire database, in the form of a JavaScript map.
     */
    getDatabase : function()
    {
      // Do the rest within a transaction, to keep the Visitor object intact
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          var             entityClasses;
          var             database = {};

          // Retrieve the list of entity types
          entityClasses =
            qx.lang.Object.getKeys(liberated.dbif.Entity.entityTypeMap);
          
          // For each entity type...
          entityClasses.forEach(
            function(entityClass)
            {
              var             entityType;
              var             propertyTypes;

              // Convert from entity class name to entity type
              entityType = liberated.dbif.Entity.entityTypeMap[entityClass];

              // Retrieve all of the entities of the specified type and save
              // them in our return "database" object.
              try
              {
                database[entityType] = liberated.dbif.Entity.query(entityClass);
              }
              catch (e)
              {
                this.warn(e);
              }
              
              // Get the property type information for this entity type
              propertyTypes =
                liberated.dbif.Entity.getPropertyTypes(entityType);
              
              // For any property types that are blobs
            },
            this);
          
          return database;
        },
        [],
        this);
    }
  }
});
