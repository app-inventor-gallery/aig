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
      var             nextBlobKey = 1;

      // Do the rest within a transaction, to keep the Visitor object intact
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          var             entityClasses;
          var             database = 
            {
              "**BLOB**" :
              {
              }
            };

          // Retrieve the list of entity types
          entityClasses =
            qx.lang.Object.getKeys(liberated.dbif.Entity.entityTypeMap);
          
          // For each entity type...
          entityClasses.forEach(
            function(entityClass)
            {
              var             entityType;
              var             fields;

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
                return;
              }
              
              // Get the property type information for this entity type
              fields =
                liberated.dbif.Entity.getPropertyTypes(entityType).fields;
              
              // Remove elements that are not BlobId or BlobIdArray
              qx.lang.Object.getKeys(fields).forEach(
                function(field)
                {
                  // Is this one we care about?
                  if (fields[field] != "BlobId" &&
                      fields[field] != "BlobIdArray")
                  {
                    // Nope. Remove it.
                    delete fields[field];
                  }
                },
                this);

              // Loop through each entity. For any property types that are
              // blobs, retrieve the blob, base-64 encode it, save it in a
              // "**BLOB**" entry in the return database, and save its "key"
              // in that entry in place of the key that was just retrieved."
              database[entityType].forEach(
                function(entity)
                {
                  var             field;
                  var             blobIdList;
                  var             returnKey;

                  function getBlob(nativeKey)
                  {
                    var             blobData;

                    // Retrieve the blob
                    try
                    {
                      blobData = liberated.dbif.Entity.getBlob(nativeKey);
                    }
                    catch (e)
                    {
                      this.warn("Could not retrieve blob ID " + nativeKey);
                      return null;
                    }
                    
                    if (! blobData)
                    {
                      qx.log.Logger.warn(
                        "Missing blob in field " + field + 
                          " (" + nativeKey + ")" +
                        ", entity=" + qx.lang.Json.stringify(entity));
                      return null;
                    }

                    // Base64-encode the data and return it
                    return qx.util.Base64.encode(blobData, true);
                  }

                  // For each blob property...
                  for (field in fields)
                  {
                    switch(fields[field])
                    {
                    case "BlobId":
                      // Get the key to add to our return database for this blob
                      returnKey = nextBlobKey++;
                      
                      // Add the base64-encoded blob to our **BLOB** entry
                      database["**BLOB**"]["" + returnKey] =
                        getBlob(entity[field]);
                      
                      // Replace the native database key with the return one
                      entity[field] = returnKey;
                      break;
                      
                    case "BlobIdArray":
                      // With an array of BlobIds, process each separately
                      // First, Save a copy of the list of blob IDs.
                      blobIdList = entity[field];
                      
                      // Ensure there's an array here
                      if (! blobIdList)
                      {
                        this.warn("No array found for field " + field +
                                  " in " + qx.lang.Json.stringify(entity));
                        blobIdList = [];
                      }

                      // Now we can initialize the entity's property to an
                      // empty array.
                      entity[field] = [];

                      // For each blob id...
                      blobIdList.forEach(
                        function(nativeBlobId)
                        {
                          // Get the key to add to our return database for
                          // this blob
                          returnKey = nextBlobKey++;

                          // Add the base64-encoded blob to our **BLOB** entry
                          database["**BLOB**"]["" + returnKey] =
                            getBlob(nativeBlobId);

                          // Add this new key to the entity's array
                          entity[field].push(returnKey);
                        },
                        this);
                      break;
                    }
                  }
                },
                this);
            },
            this);
          
          return database;
        },
        [],
        this);
    }
  }
});
