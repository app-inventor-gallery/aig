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
     * Retrieve the database.
     *
     * @return {String}
     *   The entire database, in the form of a JSON-stringified JavaScript map.
     */
    getDatabase : function()
    {
      var             nextBlobKey = 1;
      var             entityClasses;
      var             getBlob;
      var             database;
      var             datastoreService;
      var             blobstoreService;
      var             blobInfoFactory;
      var             blobInfo;
      var             BlobKey;
      var             BlobstoreServiceFactory;
      var             BlobInfoFactory;
      var             Datastore;
      
      //
      // Prepare to be able to retrieve blob info (content type, filename)
      //

      BlobKey =
        Packages.com.google.appengine.api.blobstore.BlobKey;
      BlobstoreServiceFactory = 
        Packages.com.google.appengine.api.blobstore.BlobstoreServiceFactory;
      BlobInfoFactory =
        Packages.com.google.appengine.api.blobstore.BlobInfoFactory;

      // Gain access to the datastore service
      Datastore = Packages.com.google.appengine.api.datastore;
      datastoreService =
        Datastore.DatastoreServiceFactory.getDatastoreService();

      // Get a blobstore service and a blob info factory
      blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
      blobInfoFactory = new BlobInfoFactory(datastoreService);

      // Initialize an empty database map
      database =
        {
          "**BLOB**" :
          {
          }
        };

      // Retrieve the list of entity types
      entityClasses =
        qx.lang.Object.getKeys(liberated.dbif.Entity.entityTypeMap);
      
      // Run in a transaction to keep database consistent
      liberated.dbif.Entity.asTransaction(
        function()
        {
          var             dbKey;

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
            });
        },
        [],
        this);

      //
      // Blob retrieval must be done outside of the transaction, because App
      // Engine (apparently) does not provide a means of putting blobs into a
      // specified entity group. They are therefore all in their own top-level
      // entity group, and retrieving more than one causes the transaction to
      // fail.
      //

      // For each entity type...
      entityClasses.forEach(
        function(entityClass)
        {
          var             entityType;
          var             field;
          var             fields;

          // Convert from entity class name to entity type
          entityType = liberated.dbif.Entity.entityTypeMap[entityClass];

          // Get the property type information for this entity type
          fields = liberated.dbif.Entity.getPropertyTypes(entityType).fields;

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

          getBlob = qx.lang.Function.bind(
            function(nativeKey, entity)
            {
              var             blobData;

              // Retrieve the blob
              try
              {
                blobData = liberated.dbif.Entity.getBlob(nativeKey);
              }
              catch (e)
              {
                this.warn("Could not retrieve blob ID " + 
                          nativeKey + " (" + e + ")");
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
            },
            this);

          // Loop through each entity. For any property types that are
          // blobs, retrieve the blob, base-64 encode it, save it in a
          // "**BLOB**" entry in the return database, and save its "key"
          // in that entry in place of the key that was just retrieved."
          database[entityType].forEach(
            function(entity)
            {
              var             blobKey;
              var             blobIdList;
              var             returnKey;
              var             filename;
              var             contentType;

              // For each blob property...
              for (field in fields)
              {
                switch(fields[field])
                {
                case "BlobId":
                  // Get the key to add to our return database for this blob
                  returnKey = nextBlobKey++;

                  // Convert the blob id into a key
                  blobKey = new BlobKey(entity[field]);

                  // Get the blob info to retrieve content type and filename
                  blobInfo = blobInfoFactory.loadBlobInfo(blobKey);

                  // Add the base64-encoded blob to our **BLOB** entry, along
                  // with its actual content type and saved file name.
                  filename = blobInfo.getFilename();

                  // Fix a bug where filename was added as "undefined""
                  if (filename == "undefined")
                  {
                    filename = null;
                  }

                  contentType = blobInfo.getContentType();
                  database["**BLOB**"]["" + returnKey] =
                    {
                      data        : getBlob(entity[field], entity),
                      contentType : (contentType
                                     ? String(contentType)
                                     : null),
                      filename    : (filename
                                     ? String(filename)
                                     : null)
                    };

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

                      // Convert the blob id into a key
                      blobKey = new BlobKey(nativeBlobId);

                      // Get the blob info to retrieve content type and filename
                      blobInfo = blobInfoFactory.loadBlobInfo(blobKey);

                      // Add the base64-encoded blob to our **BLOB** entry,
                      // along with its actual content type and saved file name.
                      filename = blobInfo.getFilename();
                      
                      // Fix a bug where filename was added as "undefined""
                      if (filename == "undefined")
                      {
                        filename = null;
                      }
                      
                      contentType = blobInfo.getContentType();
                      database["**BLOB**"]["" + returnKey] =
                        {
                          data        : getBlob(nativeBlobId, entity),
                          contentType : (contentType
                                         ? String(contentType)
                                         : null),
                          filename    : (filename
                                         ? String(filename) :
                                         null)
                        };

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

      return qx.lang.Json.stringify(database, null, 2);
    },

    /**
     * Restore a database.
     *
     * @param database {String}
     *   The entire database, in the form of a JSON-stringified JavaScript map.
     */
    putDatabase : function(jsonDatabase)
    {
      var             id;
      var             blobDb;
      var             blobKey;
      var             blobInfo;
      var             database;
      var             entityClasses;
      
      // Parse the JSON to get the database as a map
      database = qx.lang.Json.parse(jsonDatabase);
      
      //
      // First, create all of the blobs. Once the blob data is in the real
      // database, replace the base64-encoded data in our database map with
      // the blob ID of that data i the real database.
      //
      
      // For each blob...
      blobDb = database["**BLOB**"];
      for (id in blobDb)
      {
        // ... write this blob to the database and save its key in its former
        // place in the database map.
        blobInfo = blobDb[id];
        blobDb[id] = liberated.dbif.Entity.putBlob(blobInfo.data,
                                                   blobInfo.contentType,
                                                   blobInfo.filename);
      }
      
      // Now, for each entity class...
      // Retrieve the list of entity types
      entityClasses =
        qx.lang.Object.getKeys(liberated.dbif.Entity.entityTypeMap);

      // Run in a transaction to keep database consistent
      liberated.dbif.Entity.asTransaction(
        function()
        {
          var             jsEntityObjs;

          // For each entity type...
          entityClasses.forEach(
            function(entityClass)
            {
              var             obj;
              var             entityType;
              var             entity;
              var             blobField;
              var             blobFields;
              var             data;
              var             arr;

              // Get the property type information for this entity type
              blobFields =
                liberated.dbif.Entity.getPropertyTypes(entityType).fields;

              // Remove elements that are not BlobId or BlobIdArray
              qx.lang.Object.getKeys(blobFields).forEach(
                function(field)
                {
                  // Is this one we care about?
                  if (blobFields[field] != "BlobId" &&
                      blobFields[field] != "BlobIdArray")
                  {
                    // Nope. Remove it.
                    delete blobFields[field];
                  }
                },
                this);

              // Convert from entity class name to entity type
              entityType = liberated.dbif.Entity.entityTypeMap[entityClass];

              // Point to this database object
              jsEntityObjs = database[entityType];
              
              // For each entity of this type...
              for (obj in jsEntityObjs)
              {
                // Instantiate a new object of this class
                entity = new qx.Class.getByName(entityClass)();
                
                // Retrieve the entity data to be saved (after alteration)
                data = jsEntityObjs[obj];
                
                // For each blob field...
                for (blobField in blobFields)
                {
                  // Is this field a BlobId or a BlobIdArray?
                  switch(blobFields[blobField])
                  {
                  case "BlobId":
                    // Replace the temporary blob id in the JS entity with its
                    // real blob id.
                    data[blobField] = blobDb[data[blobField]];
                    break;
                    
                  case "BlobIdArray":
                    // Replace each of the temporary blob ids in the JS entity
                    // with their real blob ids.
                    arr = [];
                    data[blobField].forEach(
                      function(blobId)
                      {
                        arr.push(blobDb[blobId]);
                      },
                      this);
                    data[blobField] = arr;
                    break;
                  }
                }

                // Set the entity's data
                entity.setData(data);
                
                // Write out this new entity
                entity.put();
              }
            });
        },
        [],
        this);
    }
  }
});
