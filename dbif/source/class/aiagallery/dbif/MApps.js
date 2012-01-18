/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MApps",
{
  construct : function()
  {
    this.registerService("aiagallery.features.addOrEditApp",
                         this.addOrEditApp,
                         [ "uid", "attributes" ]);

    this.registerService("aiagallery.features.deleteApp",
                         this.deleteApp,
                         [ "uid" ]);

    this.registerService("aiagallery.features.getAppList",
                         this.getAppList,
                         [ "bStringize", "sortCriteria", "offset", "limit" ]);

    this.registerService("aiagallery.features.getAppListAll",
                         this.getAppListAll,
                         [ "bStringize", "sortCriteria", "offset", "limit" ]);

    this.registerService("aiagallery.features.getHomeRibbonData",
                         this.getHomeRibbonData); 

    this.registerService("aiagallery.features.appQuery",
                         this.appQuery,
                         [ "criteria", "requestedFields" ]);
    
    this.registerService("aiagallery.features.intersectKeywordAndQuery",
                         this.intersectKeywordAndQuery,
                         [ "queryArgs" ]);


    this.registerService("aiagallery.features.getAppListByList",
                         this.getAppListByList,
                         [ "uidArr", "requestedFields" ]);

    
    this.registerService("aiagallery.features.getAppInfo",
                         this.getAppInfo,
                         [ "uid", "bStringize", "requestedFields" ]);
  },

  statics :
  {
    /** The next AppId value to use */
    nextAppId : 100,
    
    /**
     * Stringize the array fields of an App
     * 
     * @param app {Object}
     *   a reference to the App whose array fields are to be stringized.
     */
    __stringizeAppInfo : function(app)
    {
            [
              // FIXME: When previous Author chain is implemented, uncomment
              //"previousAuthors",
              "tags"
              
            ].forEach(function(field)
              {
                // ... stringize this field.
                app[field] = app[field].join(", ");
              });

            // Convert from numeric to string status
            app.status = [ "Banned", "Pending", "Active" ][app.status];
            
      
    },
    
    /**
     * Strip an App object of all but the requested fields. Also renames
     * fields per request
     * 
     * @param app {Object}
     *   a reference to the App whose fields are to be deleted or renamed.
     * 
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should remain in the resultant Object. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",   // No change in name. 
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     * 
     *   Any field which is not in this map is deleted from app
     */
    _requestedFields : function(app, requestedFields)
    {
      // Remove those members which are not requested, and rename as requested
      var requested;
      
      for (var field in app)
      {
        // Is this field a requested field?
        requested = requestedFields[field];
        if (! requested)
        {
          // No, remove it
          delete app[field];
        }
        
        // If the field name is to be remapped...
        if (requested != field)
        {
          // then copy and delete to effect the remapping.
          app[requested] = app[field];
          delete app[field];
        }
      }
    },
    
    /**
     * Add or confirm existence of each word in each field of given App Data
     *
     * @param dataObj {Object}
     *  The result of getData() on the app object. Contains all the info in the
     *  database recorded for this App
     *
     * ASSUMPTION: There is already a transaction in progress!
     */
    _populateSearch : function(dataObj)
    {
      var appDataField;
      var wordsToAdd;
      var searchObj;
      var appId = dataObj["uid"];

      for (appDataField in dataObj)
      {
        // Go through each field in the App Data Object
        switch (appDataField)
        {
        // If it's one of the text fields...
        case "title":
        case "description":
          // Split up the words and...
          wordsToAdd = dataObj[appDataField].split(" ");
          wordsToAdd.forEach(function(word)
              {
                // Make sure to only add lower case words to the search
                // database
                var wordLC = word.toLowerCase();

                // If the word is a stop word, discard it
                if (qx.lang.Array.contains(
                      aiagallery.dbif.MSearch.stopWordArr,
                      word))
                {
                  return;
                }

                // Add each one to the db                
                searchObj = new aiagallery.dbif.ObjSearch([wordLC,
                                                          appId,
                                                          appDataField]);
                // Save the record in the DB.
                searchObj.put();
              });
          break;

        case "tags":
          wordsToAdd = dataObj[appDataField];
          wordsToAdd.forEach(function(word)
              {

                // Make sure to only add lower case words to the search
                // database
                var wordLC = word.toLowerCase();

                // Add each one to the db                
                searchObj = new aiagallery.dbif.ObjSearch([wordLC,
                                                          appId,
                                                         appDataField]);
                // Save the record in the DB.
                searchObj.put();
              });
          break;

        }
      }
    },
    
    /**
     * Ensure that there are no Search records from App with this uid
     * 
     * @param uid {Integer}
     *   This is the app's uid whose Search records are to be wiped
     *
     * ASSUMPTION: There is already a transaction in progress!
     */
    _removeAppFromSearch : function(uid)
    {
      var results;
      var resultObj;
      var searchObj;

      // Get all Search Objects with this uid then...
      results = liberated.dbif.Entity.query("aiagallery.dbif.ObjSearch",
                                            {
                                              type : "element",
                                              field: "appId",
                                              value: uid
                                            },
                                           null);
      // Remove every record found
      results.forEach(
        function(obj)
        {
          searchObj = new aiagallery.dbif.ObjSearch([obj["word"],
                                                     obj["appId"],
                                                     obj["appField"]]);
          searchObj.removeSelf();
        });
    }
  },
  
  members :
  {
    addOrEditApp : function(uid, attributes, error)
    {
      var             i;
      var             title;
      var             description;
      var             image;
      var             previousAuthors;
      var             source;
      var             apk;
      var             tags;
      var             tagObj;
      var             tagData;
      var             oldTags;
      var             bHasCategory;
      var             categories;
      var             uploadTime;
      var             status;
      var             statusIndex;
      var             appData;
      var             appObj;
      var             hTask = null;
      var             queue;
      var             options;
      var             bNew;
      var             whoami;
      var             missing = [];
      var             addedBlobs = [];
      var             removeBlobs = [];
      var             sourceData;
      var             apkData;
      var             image1Key;
      var             image2Key;
      var             image3Key;
      var             sourceKey = null;
      var             apkKey = null;
      var             allowableFields =
        [
          "uid",
          "owner",
          "title",
          "description",
          "image1",
          "image2",
          "image3",
          "previousAuthors",
          "source",
          "sourceFileName",
          "apk",
          "apkFileName",
          "tags",
          "uploadTime",
          "numLikes",
          "numDownloads",
          "numViewed",
          "numComments",
          "status"
        ];
      var             requiredFields =
        [
          "owner",
          "title",
          "description",
          "tags",
          "source",
          "apk",
          "image1"
        ];
      
      try
      {
        // Don't let the caller override the owner
        delete attributes["owner"];

        // Determine who the logged-in user is
        whoami = this.getWhoAmI();

        // Get an AppData object. If uid is non-null, retrieve the prior data.
        appObj = new aiagallery.dbif.ObjAppData(uid);

        // Retrieve the data
        appData = appObj.getData();

        // If we were given a record identifier...
        if (uid !== null)
        {
          // ... it must have already existed or it's an error
          if (appObj.getBrandNew())
          {
            // It didn't!
            error.setCode(1);
            error.setMessage("Unrecognized UID");
            return error;
          }

          // Ensure that the logged-in user owns this application.
          if (appData.owner != whoami.email)
          {
            // He doesn't. Someone's doing something nasty!
            error.setCode(2);
            error.setMessage("Not owner");
            return error;
          }
        }
        else
        {
          // Initialize the owner field
          appData.owner = whoami.email;
        }

        // Save the existing tags list
        oldTags = appData.tags;

        // If there's no image1 value...
        if (! attributes.image1)
        {
          // ... then move image3 or image2 to image1
          if (attributes.image3)
          {
            attributes.image1 = attributes.image3;
            attributes.image3 = null;
          }
          else
          {
            // image2 may not exist either, which will be caught in the
            // code that detects missing fields.
            attributes.image1 = attributes.image2;
            attributes.image2 = null;
          }
        }

        // Similarly, if there's no image2 value...
        if (! attributes.image2)
        {
          // ... then move image3 to image2. (Again, it may not exist.)
          attributes.image2 = attributes.image3;
          attributes.image3 = null;
        }

/*
        // If we're on App Engine...
        if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
        {
          // ... then prepare to retrieve scalable image URLs
          var Images = Packages.com.google.appengine.api.images;
          var ImagesServiceFactory = Images.ImagesServiceFactory;
          var imagesService = ImagesServiceFactory.getImagesService();
          var BlobKey = Packages.com.google.appengine.api.blobstore.BlobKey;
          var blobKey;

          //
          // Now, for each image that exists, put it in a blob
          //
          [ "1", "2", "3" ].forEach(
            function(num)
            {
              var             imageId = "image" + num;
              var             blobId = imageId + "blob";
              var             contents;
              var             mimeType;
              var             imageData;
              var             image;
              var             blobKey;

              if (attributes[imageId])
              {
                // Parse out the actual url
                imageData = attributes[imageId];
                contents = imageData.substring(imageData.indexOf(",") + 1);

                // Parse out the mimeType. This always starts at index 5 and
                // ends with a semicolon
                mimeType = imageData.substring(5, imageData.indexOf(";"));

                // Base64-decode the image data
                imageData = aiagallery.dbif.Decoder64.decode(contents);

                // Save the image data as a blob
                attributes[blobId] =
                  liberated.dbif.Entity.putBlob(imageData, mimeType);
                

                // Save the blob id to remove it, in case something fails
                addedBlobs.push(attributes[blobId]);

                // Use App Engine's Image API to retrieve the URL to a
                // (possibly) scaled image
                blobKey = new BlobKey(attributes[blobId]);
                attributes[imageId] = 
                  String(imagesService.getServingUrl(blobKey));
              }
            });
        }
*/

        // Copy fields from the attributes parameter into this db record
        allowableFields.forEach(
          function(field)
          {
            // Was this field provided in the parameter attributes?
            if (attributes[field])
            {
              // Handle source and apk fields specially
              switch(field)
              {
              case "source":
                // Save the field data
                sourceData = attributes.source;

                // Ensure that we have an array of keys. The most recent key is
                // kept at the top of the stack.
                if (! appData.source)
                {
                  appData.source = [];
                }
                break;

              case "apk":
                // Save the field data
                apkData = attributes.apk;

                // Ensure that we have an array of keys. The most recent key is
                // kept at the top of the stack.
                if (! appData.apk)
                {
                  appData.apk = [];
                }
                break;

              case "image1":
              case "image2":
              case "image3":
                // Replace what's in the db entry
                appData[field] = attributes[field];

                // If there's already a blob...
                if (appData[field + "blob"])
                {
                  // ... then add that blob ID to the list of ones to be removed
                  removeBlobs.push(appData[field + "blob"]);
                }

                // Save the blob ID too
                appData[field + "blob"] = attributes[field + "blob"];
                break;

              default:
                // Replace what's in the db entry
                appData[field] = attributes[field];
                break;
              }
            }

            // If this field is required and not available...
            if (qx.lang.Array.contains(requiredFields, field) &&
                ! appData[field])
            {
              // then mark it as missing
              missing.push(field);
            }
          });

        // Issue a query for all category tags
        categories = liberated.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                                 {
                                                   type  : "element",
                                                   field : "type",
                                                   value : "category"
                                                 },
                                                 null);

        // We want to look at only the value field of each category
        categories = categories.map(
          function(o)
          {
            return o.value;
          });

        // Ensure that at least one of the specified tags is a category
        bHasCategory = false;
        tags = appData.tags;
        for (i = 0; i < tags.length; i++)
        {
          // Is this tag a category?
          if (qx.lang.Array.contains(categories, tags[i]))
          {
            // Yup. Mark it.
            bHasCategory = true;

            // No need to look further.
            break;
          }
        }

        // Were there any missing, required fields?
        if (missing.length > 0)
        {
          // Yup. Let 'em know.
          error.setCode(4);
          error.setMessage("Please make sure to provide: " +
                           missing.join(", "));
          return error;
        }

        // Did we find at least one category tag?
        if (! bHasCategory)
        {
          // Nope. Let 'em know.
          error.setCode(3);
          error.setMessage("At least one category is required");
          return error;
        }

        // If a new source file was uploaded...
        if (sourceData)
        {
          // ... then update the upload time to now
          appData.uploadTime = aiagallery.dbif.MDbifCommon.currentTimestamp();
        }

        // Save the new source data (if there is any)
        if (sourceData)
        {
          // Save the data and prepend the blob id to the key list
          sourceKey = liberated.dbif.Entity.putBlob(sourceData);
          appData.source.unshift(sourceKey);

          // Save the blob id to remove it, in case something fails
          addedBlobs.push(sourceKey);
        }

        // Similarly for apk data
        if (apkData)
        {
          // Save the data and prepend the blob id to the key list
          apkKey = liberated.dbif.Entity.putBlob(apkData);
          appData.apk.unshift(apkKey);

          // Save the blob id to remove it, in case something fails
          addedBlobs.push(apkKey);
        }
      }
      catch(e)
      {
        // Something failed. Remove any blobs we added.
        addedBlobs.forEach(
          function(blobId)
          {
            liberated.dbif.Entity.removeBlob(blobId);
          });
        
        // Rethrow the error
        throw e;
      }
      
      try
      {
        appData = liberated.dbif.Entity.asTransaction(
          function()
          {
            // Add new tags to the database, and update counts of formerly-
            // existing tags. Remove "normal" tags with a count of 0.
            appData.tags.forEach(
              function(tag)
              {
                // If the tag existed previously, ignore it.
                if (qx.lang.Array.contains(oldTags, tag))
                {
                  // Remove it from oldTags
                  qx.lang.Array.remove(oldTags, tag);
                  return;
                }

                // It didn't exist. Create or retrieve existing tag.
                tagObj = new aiagallery.dbif.ObjTags(tag);
                tagData = tagObj.getData();

                // If we created it, data is initialized. Otherwise...
                if (! tagObj.getBrandNew())
                {
                  // ... it existed, so we need to increment its count
                  ++tagData.count;
                }

                // Save the tag object
                tagObj.put();
              });

            // Anything left in oldTags are those which were removed.
            oldTags.forEach(
              function(tag)
              {
                tagObj = new aiagallery.dbif.ObjTags(tag);
                tagData = tagObj.getData();

                // The record has to exist already. Decrement this tag's count.
                --tagData.count;

                // Ensure it's a "normal" tag
                if (tagData.type != "normal")
                {
                  // It's not, so we have nothing more we need to do.
                  return;
                }

                // If the count is less than 1...
                if (tagData.count < 1)
                {
                  // ... then we can remove the tag
                  tagObj.removeSelf();
                }
              });

            // If we're on App Engine...
            if (liberated.dbif.Entity.getCurrentDatabaseProvider() ==
                "appengine")
            {
              // ... then set the status to "PENDING" until the task queue is
              // processed and the app data is cleaned up
              appData.status = aiagallery.dbif.Constants.Status.Processing;
            }

            // Save this record in the database
            appObj.put();

            // Add all words in text fields to word Search record
            aiagallery.dbif.MApps._populateSearch(appObj.getData());

            // If we're on App Engine...
            if (liberated.dbif.Entity.getCurrentDatabaseProvider() ==
                "appengine")
            {
              // ... then create a task to clean up the data for this app
              var TaskQueue = Packages.com.google.appengine.api.taskqueue;
              var Queue = TaskQueue.Queue;
              var QueueFactory = TaskQueue.QueueFactory;
              var TaskOptions = TaskQueue.TaskOptions;
              var requestData =
                {
                  type : "postAppUpload",
                  uid  : appData.uid
                };
              var jsonRequest = qx.lang.Json.stringify(requestData);

              queue = QueueFactory.getDefaultQueue();
              options = TaskOptions.Builder.withUrl("/task");
              options.payload(jsonRequest);
              hTask = queue.add(options);
            }

            // Return entity data including newly-created key (if adding)
            return appObj.getData();
          });
      }
      catch (e)
      {
        // The transaction failed. Remove any blobs we added.
        addedBlobs.forEach(
          function(blobId)
          {
            liberated.dbif.Entity.removeBlob(blobId);
          });
        
        // If we had started the postprocessing task...
        if (hTask !== null)
        {
          // ... then delete it
          queue.deleteTask(hTask);
        }

        // Rethrow the error
        throw e;
      }
      
      // There was no error, so remove any old, no-longer-in-use blobs
      removeBlobs.forEach(
        function(blobId)
        {
          liberated.dbif.Entity.removeBlob(blobId);
        });

      return appData;
    },
    
    
    /**
     * Do post processing of an uploaded app. This function base64-decodes the
     * data url values, saves the images as blobs, and replaces each data url
     * with an http: url for retrieving the image (with scaling).
     *
     * @param requestData {Map}
     *   Map which includes a uid member that uniquely identifies the app to
     *   be post-processed.
     */
    _postAppUpload : function(requestData)
    {
      var         app;
      var         appData;
      var         addedBlobs = [];
      var         Images = Packages.com.google.appengine.api.images;
      var         ImagesServiceFactory = Images.ImagesServiceFactory;
      var         imagesService = ImagesServiceFactory.getImagesService();
      var         BlobKey = Packages.com.google.appengine.api.blobstore.BlobKey;

      // Ensure we have the requisite UID
      if (typeof requestData.uid == "undefined" || requestData.uid == null)
      {
        throw (
          {
            code    : 301,
            message : "Missing UID"
          });
      }
      
      // Retrieve this app
      app = new aiagallery.dbif.ObjAppData(requestData.uid);
      
      // Get the app property data from the app object
      appData = app.getData();

      // If it's indicating as brand new, the user may have deleted it. If
      // it's already active, there's nothing to be done.
      if (app.getBrandNew() ||
          appData.status == aiagallery.dbif.Constants.Status.Active)
      {
        // Nothing to do in that case
        return;
      }
      
      //
      // Now, for each image that exists, put it in a blob
      //
      [ "1", "2", "3" ].forEach(
        function(num)
        {
          var             imageId = "image" + num;
          var             blobId = imageId + "blob";
          var             contents;
          var             mimeType;
          var             imageData;
          var             image;
          var             blobKey;

          if (appData[imageId])
          {
            // Parse out the actual url
            imageData = appData[imageId];
            
            // Ensure it's still a data url, and we aren't retrying work done
            if (imageData.substring(0, 4) != "data")
            {
              return;
            }
            
            // Get the contents of the base64-encoded photo
            contents = imageData.substring(imageData.indexOf(",") + 1);

            // Parse out the mimeType. This always starts at index 5 and
            // ends with a semicolon
            mimeType = imageData.substring(5, imageData.indexOf(";"));

            // Base64-decode the image data
            imageData = aiagallery.dbif.Decoder64.decode(contents);

            // Save the image data as a blob
            appData[blobId] =
              liberated.dbif.Entity.putBlob(imageData, mimeType);

            // Save the blob id to remove it, in case something fails
            addedBlobs.push(appData[blobId]);

            // Use App Engine's Image API to retrieve the URL to a
            // (possibly) scaled image
            blobKey = new BlobKey(appData[blobId]);
            appData[imageId] = 
              String(imagesService.getServingUrl(blobKey));
          }
        });
      
      // Application processing has been completed (once the object is saved)
      appData.status = aiagallery.dbif.Constants.Status.Active;

      // Save the app object with the updates
      try
      {
        app.put();
      }
      catch (e)
      {
        // We failed to write the database. Remove any blobs we added
        addedBlobs.forEach(
          function(blobId)
          {
            liberated.dbif.Entity.removeBlob(blobId);
          });
        
        // Throw an error that will cause this function to be retried
        throw (
          {
            code    : 302,
            message : "Rewrite of app object failed"
          });
      }
    },


    deleteApp : function(uid, error)
    {
      var             appObj;
      var             appData;
      var             tagObj;
      var             tagData;
      var             whoami;

      // Retrieve an instance of this application entity
      appObj = new aiagallery.dbif.ObjAppData(uid);
      
      // Does this application exist?
      if (appObj.getBrandNew())
      {
        // It doesn't. Let 'em know.
        return false;
      }

      // Get the object data
      appData = appObj.getData();
      
      // Determine who the logged-in user is
      whoami = this.getWhoAmI();

      // Ensure that the logged-in user owns this application
      if (! whoami || appData.owner != whoami.email)
      {
        // He doesn't. Someone's doing something nasty!
        error.setCode(1);
        error.setMessage("Not owner");
        return error;
      }

      liberated.dbif.Entity.asTransaction(
        function()
        {
          var             results;

          // Decrement counts for tags used by this application.
          appData.tags.forEach(
            function(tag)
            {
              // Get this tag object
              tagObj = new aiagallery.dbif.ObjTags(tag);
              tagData = tagObj.getData();

              // The record has to exist already. Decrement this tag's count.
              --tagData.count;

              // Ensure it's a "normal" tag
              if (tagData.type != "normal")
              {
                // It's not, so we have nothing more we need to do.
                return;
              }

              // If the count is less than 1...
              if (tagData.count < 1)
              {
                // ... then we can remove the tag
                tagObj.removeSelf();
              }
            });

          // Remove all Likes objects referencing this application
          liberated.dbif.Entity.query("aiagallery.dbif.ObjLikes", 
                                      {
                                        type  : "element",
                                        field : "app",
                                        value : appData.uid
                                      }).forEach(
            function(result)
            {
              var             obj;
              
              // Get this Likes object
              obj = new aiagallery.dbif.ObjLikes(result.uid);
              
              // Assuming it exists (it had better!)...
              if (! obj.getBrandNew())
              {
                // ... then remove this object
                obj.removeSelf();
              }
            });
      
          // Remove all Flags objects referencing this application
          liberated.dbif.Entity.query("aiagallery.dbif.ObjFlags", 
                                      {
                                        type  : "element",
                                        field : "app",
                                        value : appData.uid
                                      }).forEach(
            function(result)
            {
              var             obj;
              
              // Get this Flags object
              obj = new aiagallery.dbif.ObjFlags(result.uid);
              
              // Assuming it exists (it had better!)...
              if (! obj.getBrandNew())
              {
                // ... then remove this object
                obj.removeSelf();
              }
            });
      
          // Remove all comments referencing this application
          liberated.dbif.Entity.query("aiagallery.dbif.ObjComments", 
                                      {
                                        type  : "element",
                                        field : "app",
                                        value : appData.uid
                                      }).forEach(
            function(result)
            {
              var             obj;
              
              // Get this Comments object
              obj = new aiagallery.dbif.ObjComments( [
                                                       result.app,
                                                       result.treeId
                                                     ]);
              
              // Assuming it exists (it had better!)...
              if (! obj.getBrandNew())
              {
                // ... then remove this object
                obj.removeSelf();
              }
            });
      
          // Remove all Downloads referencing this application
          liberated.dbif.Entity.query("aiagallery.dbif.ObjDownloads", 
                                      {
                                        type  : "element",
                                        field : "app",
                                        value : appData.uid
                                      }).forEach(
            function(result)
            {
              var             obj;
              
              // Get this Comments object
              obj = new aiagallery.dbif.ObjDownloads(result.uid);
              
              // Assuming it exists (it had better!)...
              if (! obj.getBrandNew())
              {
                // ... then remove this object
                obj.removeSelf();
              }
            });
      
          // Delete the app
          appObj.removeSelf();

          // Remove any search entries that map to only this app
          aiagallery.dbif.MApps._removeAppFromSearch(uid);
        });
      
      // If we've added an image1 blob...
      if (appData.image1 !== null)
      {
        // ... then remove it
        liberated.dbif.Entity.removeBlob(appData.image1);
      }

      // If we've added an image2 blob...
      if (appData.image2 !== null)
      {
        // ... then remove it
        liberated.dbif.Entity.removeBlob(appData.image2);
      }

      // If we've added an image3 blob...
      if (appData.image3 !== null)
      {
        // ... then remove it
        liberated.dbif.Entity.removeBlob(appData.image3);
      }

      // Remove any apk blobs associated with this app
      if (appData.apk)
      {
        appData.apk.forEach(
          function(apkBlobId)
          {
            liberated.dbif.Entity.removeBlob(apkBlobId);
          });
      }

      // Similarly for any source blobs
      if (appData.source)
      {
        appData.source.forEach(
          function(sourceBlobId)
          {
            liberated.dbif.Entity.removeBlob(sourceBlobId);
          });
      }

      // We were successful
      return true;
    },
    
    /**
     * Get a portion of the application list.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     *
     * @param bAll {Boolean}
     *   Whether to return all applications (if permissions allow it) rather
     *   than only those applications owned by the logged-in user.
     */
    _getAppList : function(bStringize, sortCriteria, offset, limit, bAll)
    {
      var             categories;
      var             categoryNames;
      var             appList;
      var             whoami;
      var             criteria;
      var             resultCriteria = [];
      var             owners;
      var             displayName;

      // Get the current user
      whoami = this.getWhoAmI();

      // Create the criteria for a search of apps of the current user
      if (! bAll)
      {
        criteria =
          {
            type  : "element",
            field : "owner",
            value : whoami.email
          };
      }
      else
      {
        // We want all objects
        criteria = null;
      }
      
      // If an offset is requested...
      if (typeof(offset) != "undefined" && offset !== null)
      {
        // ... then specify it in the result criteria.
        resultCriteria.push({ "offset" : offset });
      }
      
      // If a limit is requested...
      if (typeof(limit) !== "undefined" && limit !== null)
      {
        // ... then specify it in the result criteria
        resultCriteria.push({ "limit" : limit });
      }
      
      // If sort criteria are given...
      if (typeof(sortCriteria) !== "undefined" && sortCriteria !== null)
      {
        // ... then add them too.
        for (var sortField in sortCriteria)
        {
          resultCriteria.push(
          { 
            type : "sort", 
            field: sortField, 
            order: sortCriteria[sortField]
          });
        }
      }

      // Issue a query for all apps 
      appList = liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData", 
                                            criteria,
                                            resultCriteria);

      // Manipulate each App individually, before returning
      appList.forEach(
          function(app)
          {
            // Replace the owner name with the owner's display name
            owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                                  app["owner"]);

            // FIXME: should never occur (but does)
            if (true)
            {
              displayName = null;
              if (owners.length == 0)
              {
                displayName = "<>";
              }
            }

            // If it's not an "all" request (administrator)...
            if (! bAll)
            {
              // ... then replace his visitor id with his display name
              app["owner"] = displayName || owners[0].displayName || "<>";
            }
            else
            {
              // Otherwise add the display name
              app["displayName"] = displayName || owners[0].displayName || "<>";
            }
           
            // If we were asked to stringize the values...
            if (bStringize)
            {
              // ... then send each App to the Stringizer
              aiagallery.dbif.MApps.__stringizeAppInfo(app);
            }
          });
        
  
      
      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for category tags
      categories = liberated.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                               criteria,
                                               [
                                                 { 
                                                   type  : "sort",
                                                   field : "value",
                                                   order : "asc"
                                                 }
                                               ]);
      
      // They want only the tag value to be returned
      categoryNames = categories.map(function() { return arguments[0].value; });

      // We've built the whole list. Return it.
      return { apps : appList, categories : categoryNames };
    },
    
    /**
     * Get a the application list of the logged-in user.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     */
    getAppList : function(bStringize, sortCriteria, offset, limit)
    {
      return this._getAppList(bStringize, sortCriteria, offset, limit, false);
    },

    /**
     * Get a the entire application list.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     */
    getAppListAll : function(bStringize, sortCriteria, offset, limit)
    {
      return this._getAppList(bStringize, sortCriteria, offset, limit, true);
    },

    /**
     * Issue a query for a set of applicaitons. Limit the response to
     * particular fields.
     *
     * @param criteria {Map|Key}
     *   Criteria for selection of which applications to return. This
     *   parameter is in the format described in the 'searchCriteria'
     *   parameter of liberated.dbif.Entity.query().
     *
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     *
     *         return { apps : appList, categories : categoryNames };
     * @return {Map}
     *   The return value is a map with two members: "apps" and
     *   "categories". The former is an array of maps, each providing
     *   information about one application. The latter is an array of the tags
     *   which are identified as top-level categories.
     */
    appQuery : function(criteria, requestedFields)
    {
      var             appList;
      var             categories;
      var             categoryNames;
      var             owners;
      var             displayName;

      appList = 
        liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData", criteria);

      // Manipulate each App individually
      appList.forEach(
        function(app)
        {
          // Issue a query for this visitor
          owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                               app.owner);

          // FIXME: should never occur (but does)
          if (true)
          {
            displayName = null;
            if (owners.length == 0)
            {
              displayName = "<>";
            }
          }

          // Replace the (private) owner id with his display name
          app.owner = displayName || owners[0].displayName || "<>";
          
          // If there were requested fields specified...
          if (requestedFields)
          {
            // Send to the requestedFields function for removal and remapping
            aiagallery.dbif.MApps._requestedFields(app, requestedFields);
          }
          
        });
      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for all categories
      categories = liberated.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                               criteria,
                                               [
                                                 { 
                                                   type  : "sort",
                                                   field : "value",
                                                   order : "asc"
                                                 }
                                               ]);
      
      // Tag objects contain the tag value, type, and count of uses. For this
      // procedure, we want to return only the tag value.
      categoryNames = categories.map(function() 
                                     { 
                                       return arguments[0].value;
                                     });

      return { apps : appList, categories : categoryNames };
    },

    /**
     * Perform a keyword search on the given string, as well as an appQuery on
     * the given criteria, and return the intersection of the results.
     * 
     * @param queryArgs {Map}
     *   This is a map containing member names that are the 4 unique parameters
     *   to MApps.appQuery(criteria, requestedFields) and 
     *   keywordSearch(keywordString, queryFields, requestedFields)
     *  
     *   The value of each of those members is the argument to be passed upon
     *   calling that RPC
     *  
     *   For example:
     *  
     *     {
     *       criteria         : {....(see MApps.appQuery() docu....},
     *       requestedFields  : {....(see MApps.appQuery() docu....},
     *       keywordString    : "Some words to search on",
     *       queryFields      : null // not implemented yet,
     *                               // pass null for safety
     *     }
     * 
     * @return {Map}
     *   The return value is an array of maps, each providing information
     *   about one application.
     *
     */
    intersectKeywordAndQuery : function(queryArgs, error)
    {      

      var               keywordString;
      var               appQueryResults;
      var               appQueryResultArr = [];
      var               bQueryUsed = true;
      var               keywordSearchResultArr = [];
      var               bKeywordUsed = true;
      var               intersectionArr = [];
      
      // Going to perform keyword search first
      keywordString = queryArgs["keywordString"];
      
      // If there was no keyword string provided
      if (keywordString === null || typeof keywordString === "undefined" ||
          keywordString === "")
      {
        // Then just use the results of appQuery
        bKeywordUsed = false;
      }
      else
      {
        // Perform keyword search
        keywordSearchResultArr = this.keywordSearch(keywordString,
                                                queryArgs["queryFields"],
                                                queryArgs["requestedFields"],
                                                error);
        // If there was a problem
        if (keywordSearchResultArr === error)
        {
          // Propegate the failure
          return error;
        }
      }
      
      // Was there any criteria given to perform appQuery on?
      if (queryArgs["criteria"]["method"] === "and" &&
          queryArgs["criteria"]["children"].length === 0)
      {
        // No, just use the keyword results
        bQueryUsed = false;
      }
      else
      {
        // Yes, use it to perform appQuery
        appQueryResults = this.appQuery(queryArgs["criteria"],
                                      queryArgs["requestedFields"],
                                      error);
      
        // If there was a problem
        if (appQueryResults === error)
        {
          // Propegate the failure
          return error; 
        }

        // Unwrap the appQuery results
        appQueryResultArr = appQueryResults["apps"];
      }
      
      // Was nothing given to search on?
      if (!bKeywordUsed && !bQueryUsed)
      {
        // This is an error
        error.setCode(1);
        error.setMessage("No keyword or search criteria given");
        return error;
      }
      
      // Was just appQuery used?
      if (!bKeywordUsed)
      {
        // Then just return its results
        return appQueryResultArr;
      }
      
      // Was just keyword search used?
      if (!bQueryUsed)
      {
        // Then just return its results
        return keywordSearchResultArr;
      }
      
      // If we got here, then both keyword search and app query ran so...
      
      // Perform intersection operation            
      keywordSearchResultArr.forEach(function(keywordAppObj)
        {
          appQueryResultArr.forEach(function(appQueryAppObj)
            {
              if (keywordAppObj["uid"] === appQueryAppObj["uid"])
              {
                intersectionArr.push(appQueryAppObj);
              }              
            });
        });
                                     
      // Return the intersection between the two result sets
      return intersectionArr;    
      
    },

    /**
     * Performs three queries to retrive the Featured, Most Liked, and Newest. 
     * This is for the front page ribbon.
     * 
     * @return {Map}
     *   The return value is a map with arrays in it. Each array in the map 
     *   corresponds to one of the three search queries.  
     *
     */
    getHomeRibbonData : function()
    { 
      var             owners;
      var             displayName;

      // Create and execute query for "Featured" apps.
      var criterion = 
        {
          type  : "element",
          field : "tags",
          value : "*Featured*"
        };

      var searchResponseFeatured = 
          liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData",criterion);

      // Manipulate each App individually, before returning
      searchResponseFeatured.forEach(
          function(app)
          {
            // Replace the owner name with the owner's display name
            owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                                 app["owner"]);

            // FIXME: should never occur (but does)
            if (true)
            {
              displayName = null;
              if (owners.length == 0)
              {
                displayName = "<>";
              }
            }

            // Replace his visitor id with his display name
            app["owner"] = displayName || owners[0].displayName || "<>";
                      
            // Do special App Engine processing to scale images
            if (liberated.dbif.Entity.getCurrentDatabaseProvider() ==
                "appengine")
            {
              // Scale images
              [ "1", "2", "3" ].forEach(
                function(num)
                {
                  var             imageId = "image" + num;
                  var             url = app[imageId];

                  // Is this image URL provided and is it real (not data:)?
                  if (url && url.substring(0, 4) == "http")
                  {
                    // Request App Engine to scale to 100px longest side
                    app[imageId] += "=s100";
                  }
                });
            }
          });

      //Create and execute query for "Most Liked" apps. 
      criterion = 
        {
          type  : "element",
          field : "status",
          value : aiagallery.dbif.Constants.Status.Active
        };

      //Create map to specify specific return data from the upload time query
      var requestedData = 
        [
          {
            type  : "limit",
            value : aiagallery.dbif.Constants.RIBBON_NUM_MOST_LIKED  
          },
          { 
            type  : "sort",   
            field : "numLikes",
            order : "desc" 
          }
        ]; 

      var searchResponseLiked = 
        liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData",
                                    criterion,
                                    requestedData);

      // Manipulate each App individually, before returning
      searchResponseLiked.forEach(
          function(app)
          {
            // Replace the owner name with the owner's display name
            owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                                 app["owner"]);

            // FIXME: should never occur (but does)
            if (true)
            {
              displayName = null;
              if (owners.length == 0)
              {
                displayName = "<>";
              }
            }

            // Replace his visitor id with his display name
            app["owner"] = displayName || owners[0].displayName || "<>";
                      
          });

      //Create and execute query for "Newest" apps.
      criterion = 
        {
          type  : "element",
          field : "status",
          value : aiagallery.dbif.Constants.Status.Active
        };

      //Create map to specify specific return data from the upload time query
      requestedData = 
        [
          {
            type : "limit",
            value : aiagallery.dbif.Constants.RIBBON_NUM_NEWEST
          },
          {
            type  : "sort",
            field : "uploadTime",
            order : "desc" }
        ]; 

      var searchResponseNewest = 
        liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData",
                                    criterion,
                                    requestedData);

      // Manipulate each App individually, before returning
      searchResponseNewest.forEach(
        function(app)
        {
          // Replace the owner name with the owner's display name
          owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                               app["owner"]);

          // FIXME: should never occur (but does)
          if (true)
          {
            displayName = null;
            if (owners.length == 0)
            {
              displayName = "<>";
            }
          }

          // Replace his visitor id with his display name
          app["owner"] = displayName || owners[0].displayName || "<>";
        });

      //Construct map of data
      var data = 
        {
          "Featured"     :    searchResponseFeatured,   
          "MostLiked"    :    searchResponseLiked,
          "Newest"       :    searchResponseNewest
        };

      //Return the map containing the arrays containing the apps. 
      return data;
    },
      
    /**
     * Get a list of Apps from a discrete list of App UIDs
     * 
     * @param uidArr {Array}
     * An Array containing App UIDs which are to be exhanged for actual App Data
     * 
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     * 
     * @return {Array}
     *  An array of maps. Each map contains data about one of the Apps whose
     *  UIDs were specified.
     * 
     */
    getAppListByList : function( uidArr, requestedFields)
    {
      var             appList = [];
      var             owners;
      var             displayName;
      
      uidArr.forEach(function(uid)
          {
            appList.push(
              liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData", 
                                          uid)[0]);
          });
      
      // Manipulate each App individually
      appList.forEach(
        function(app)
        {
          // Issue a query for this visitor
          owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                               app.owner);

          // FIXME: should never occur (but does)
          if (true)
          {
            displayName = null;
            if (owners.length == 0)
            {
              displayName = "<>";
            }
          }

          // Replace the (private) owner id with his display name
          app.owner = displayName || owners[0].displayName || "<>";
          
          // Do special App Engine processing to scale images
          if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
          {
            // Scale images
            [ "1", "2", "3" ].forEach(
              function(num)
              {
                var             imageId = "image" + num;
                var             url = app[imageId];

                // Is this image URL provided and is it real (not data:)?
                if (url && url.substring(0, 4) == "http")
                {
                  // Request App Engine to scale to 100px longest side
                  app[imageId] += "=s100";
                }
              });
          }

          // If there were requested fields specified...
          if (requestedFields)
          {
            // Send to the requestedFields function for removal and remapping
            aiagallery.dbif.MApps._requestedFields(app, requestedFields);
          }
          
        });

      return appList;
    },
    
    /**
     * Get the details about a particular application.
     *
     * This function will also increment the number of views of the 
     * requested app by 1. 
     *
     * @param uid {Key}
     *   The unique identifier of an application.
     *
     * @param bStringize {Boolean}
     *   Whether some non-string parameters should be converted to a string
     *   representation. For example, the "tags" and "previousAuthors" fields
     *   are arrays, and are returned as an array if this parameter is false,
     *   but are returned as a comma-separated string of the array values if
     *   this parameter value is true. The status value, an integer, is
     *   returned as a number when this parameter is false, and as the string
     *   representing the status value when it is true.
     *
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     * 
     * @param error {liberated.rpc.error.Error}
     *   All RPCs are passed, as their final argument, an error object. Most
     *   don't use it, but this one does. If the application being requested
     *   is not found (which, since the uid of the specific application is
     *   provided as a parameter, likely means that it was just deleted), an
     *   error is generated back to the client by setting the code and message
     *   in this object.
     *
     * @return {Map}
     *   All of the information about the application, with the exception that
     *   the owner has been converted to the owner's display name.
     */
    getAppInfo : function(uid, bStringize, requestedFields, error)
    {
      var             app;
      var             appObj;
      var             tagTable;
      var             whoami;
      var             criteria;
      var             owners;
      var             likesList;
      var             displayName;

      whoami = this.getWhoAmI();

      //Update the views and last viewed date

      //Get the actual object
      appObj = new aiagallery.dbif.ObjAppData(uid);    

      // See if this app exists.  
      if (appObj.getBrandNew())
      {
        // It doesn't. Let 'em know that the application has just been removed
        // (or there's a programmer error)
        error.setCode(1);
        error.setMessage("Application is not available. " +
                         "It may have been removed recently.");
        return error;
      }
  
      app = appObj.getData();

      //Increment the number of views by 1. 
      app.numViewed++; 

      //Set the "lastViewedDate" to the time this function was called
      app.lastViewedTime = aiagallery.dbif.MDbifCommon.currentTimestamp(); 

      //Put back on the database
      appObj.put();
 
      // If the application status is not Active, only the owner can view it.
      if (app.status != aiagallery.dbif.Constants.Status.Active &&
          (! whoami || app.owner != whoami.email))
      {
        // It doesn't. Let 'em know that the application has just been removed
        // (or there's a programmer error)
        error.setCode(2);
        error.setMessage("Application is not available. " +
                         "It may have been removed recently.");
        return error;
      }
 
      // Issue a query for this visitor
      owners = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                           app.owner);

      // FIXME: should never occur (but does)
      if (true)
      {
        displayName = null;
        if (owners.length == 0)
        {
          displayName = "<>";
        }
      }

      // Replace the (private) owner id with his display name
      app.owner = displayName || owners[0].displayName || "<>";

      // If there's a user signed in...
      if (whoami && whoami.email)
      {
        // Determine if the current user has already liked this application
        // Construct query criteria for "likes of this app by current visitor"
        criteria = 
          {
            type : "op",
            method : "and",
            children : 
            [
              {
                type: "element",
                field: "app",
                value: uid
              },
              {
                type: "element",
                field: "visitor",
                value: whoami.email
              }
            ]
          };

        // Query for the likes of this app by the current visitor
        // (an array, which should have length zero or one).
        likesList = liberated.dbif.Entity.query("aiagallery.dbif.ObjLikes",
                                                criteria,
                                                null);

        // If there were any results, this user has already liked it.
        app.bAlreadyLiked = likesList.length > 0;
      }

      // If we were asked to stringize the values...
      if (bStringize)
      { 
        aiagallery.dbif.MApps.__stringizeAppInfo(app);
      }
      
      // If there were requested fields specified...
      if (requestedFields)
      {
        // If the "comments" field was requested
        if (requestedFields["comments"])
        {
          
          // Use function from Mixin MComments to add comments to app info
          // object
          app.comments = this.getComments(uid, null, null, error);
        }
        
        // Send it to the requestedFields function for stripping and remapping
        aiagallery.dbif.MApps._requestedFields(app, requestedFields);
      }
      

      // Do special App Engine processing to scale images
      if (liberated.dbif.Entity.getCurrentDatabaseProvider() == "appengine")
      {
        // Scale images
        [ "1", "2", "3" ].forEach(
          function(num)
          {
            var             imageId = "image" + num;
            var             url = app[imageId];

            // Is this image URL provided and is it real (not data:)?
            if (url && url.substring(0, 4) == "http")
            {
              // Request App Engine to scale to 100px longest side
              app[imageId] += "=s200";
            }
          });
      }

      // Give 'em what they came for
      return app;
    }    
  }
});
