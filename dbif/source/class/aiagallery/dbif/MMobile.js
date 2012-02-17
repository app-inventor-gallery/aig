/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MMobile",
{
  construct : function()
  {
    this.registerService("aiagallery.features.mobileRequest",
                         this.mobileRequest,
                         [ "command" ]);
  },

  members :
  {
    mobileRequest : function(command, error)
    {
      var             fields;
      var             field;
      var             params;

      // The command is supposed to be a series of colon-separated
      // fields. Let's split it up and see what we got.
      fields = command.split(":");
      
      // The first field is the command name
      field = fields.shift();
      
      // Add error as the last parameter to all commands
      fields.push(error);
      
      switch(field)
      {
      case "all":
        // Retrieve a list of applications. Parameters are offset, count, and
        // sort order.
        return this.__getAll(fields, error);
        
      case "search":
        // Search for applications based on some criteria. Lone parameter is
        // keywordString.
        return this.__getBySearch(fields, error);
        
      case "tag":
        // Search by tag name. Parameters are the tag name, offset, count, and
        // sort order.
        return this.__getByTag(fields, error);
        
      case "featured":
        // Get featured apps. Parameters are the offset, count, and sort order.
        return this.__getByFeatured(fields, error);
        
      case "by_developer":
        // Get apps by their owner. Parameters are the owner's display name,
        // offset, count, and sort order.
        return this.__getByOwner(fields, error);
        
      case "getinfo":
        // Get information about an application
        return this.__getAppInfo(fields, error);
        
      case "comments":
        // Get comments made about an application
        return this.__getComments(fields, error);
        
      case "get_categories":
        // Get the category list (top-level tags). There are no parameters to
        // this request.
        return this.__getCategories(fields, error);
        
      default:
        error.setCode(1);
        error.setMessage("Unrecognized request: " + field);
        return error;
      }
    },
    
    
    __getAll : function(fields, error)
    {
      var requiredParams = 4;
      for (var i = requiredParams + 1 - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();
      
      var offsetTypeCheck = offset === null || !isNaN(parseInt(offset, 10));
      var countTypeCheck = count === null || !isNaN(parseInt(count, 10));
      var orderTypeCheck = order === null || typeof order === "string";
      var fieldTypeCheck = field === null || typeof field === "string";
      
      if (!offsetTypeCheck || !countTypeCheck || !orderTypeCheck ||
          !fieldTypeCheck)
      {
        error.setCode(5);
        error.setMessage("Malformed mobile request: Incorrect parameter type.");
        return error;
      }
      
      var results = liberated.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        // We want everything, so null search criteria
        {
          type : "element",
          field: "status",
          value: aiagallery.dbif.Constants.Status.Active
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset, count, order, field));

      try
      {
        results.forEach(function(obj)
        {
          // Add this owner's display name
          obj["displayName"] =
            aiagallery.dbif.MVisitors._getDisplayName(obj["owner"], error);

          // Did we fail to find this owner?
          if (obj["displayName"] === error)
          {
            // Yup. Abort the request.
            throw error;
          }
        });
      }
      catch(error)
      {
        return error;
      }
      
      return results;
    },
    
    __getBySearch : function(fields, error)
    {
      var results;
      var requiredParams = 3;
      for (var i = requiredParams + 1 - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var keywordString = fields.shift();
      var offset = fields.shift();
      var count = fields.shift();
      
      var offsetTypeCheck = offset === null || !isNaN(parseInt(offset, 10));
      var countTypeCheck = count === null || !isNaN(parseInt(count, 10));
      
      if (!offsetTypeCheck || !countTypeCheck)
      {
        error.setCode(5);
        error.setMessage("Malformed mobile request: Incorrect parameter type.");
        return error;
      }
      
      // keyword is required.
      if (typeof keywordString !== "string")
      {
        error.setCode(3);
        error.setMessage("No search terms given");
        return error;
      }
      
      // Request specific fields
      var requestedFields = 
      {
        owner              : "owner",
        title              : "title",
        description        : "description",
        tags               : "tags",
        image1             : "image1",
        uploadTime         : "uploadTime",
        creationTime       : "creationTime",
        numLikes           : "numLikes",
        numDownloads       : "numDownloads",
        numViewed          : "numViewed",
        numComments        : "numComments",
        status             : "status",
        uid                : "uid"
      };
    
      // Use MSearch Mixin
      results = this.keywordSearch(keywordString, null, requestedFields, error);
      
      // If they have not specified a count nor an offset...
      if (count === null && offset === null)
      {
        // ... then return the whole list
        return results;
      }
      
      // If there's no count, return the whole list beginning at offset
      if (count === null)
      {
        offset = parseInt(offset, 10);
        return results.slice(offset);
      }
      
      // There's a count and an offset. Give that group.
      offset = parseInt(offset, 10);
      count = parseInt(count, 10);
      return results.slice(offset, offset + count);
    },
    
    __getByTag : function(fields, error)
    {
      var requiredParams = 5;
      for (var i = requiredParams + 1 - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var tagName = fields.shift();
      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();
      
      // tagName is required
      if (typeof tagName !== "string")
      {
        error.setCode(3);
        error.setMessage("No tag name given");
        return error;
      }
      var offsetTypeCheck = offset === null || !isNaN(parseInt(offset, 10));
      var countTypeCheck = count === null || !isNaN(parseInt(count, 10));
      var orderTypeCheck = order === null || typeof order === "string";
      var fieldTypeCheck = field === null || typeof field === "string";
      
      if (!offsetTypeCheck || !countTypeCheck || !orderTypeCheck ||
          !fieldTypeCheck)
      {
        error.setCode(5);
        error.setMessage("Malformed mobile request: Incorrect parameter type.");
        return error;
      }
      
      var results = liberated.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        {
          type : "op",
          method : "and",
          children : 
          [
            {
              type  : "element",
              field : "status",
              value : aiagallery.dbif.Constants.Status.Active 
            },
            {
              type  : "element",
              field : "tags",
              value : tagName 
            }
          ]
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria(offset, count, order, field));

      try
      {
        results.forEach(function(obj)
        {
          // Replace this owner with his display name
          obj["displayName"] =
            aiagallery.dbif.MVisitors._getDisplayName(obj["owner"], error);

          // Did we fail to find this owner?
          if (obj["displayName"] === error)
          {
            // Yup. Abort the request.
            throw error;
          }
        });
      }
      catch(error)
      {
        return error;
      }
      
      return results;
    },
    
    __getByFeatured : function(fields, error)
    {
      // This is the same as __getByTag so just prepend the tag name
      fields.unshift("*Featured*");

      // If the only quality of a Featured App is that it has a *Featured* tag
      //   then this works.
      return this.__getByTag(fields, error);
    },
    
    __getByOwner : function(fields, error)
    {
      var requiredParams = 5;
      for (var i = requiredParams + 1 - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var ownerId = fields.shift();
      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();
      
      // ownerId is required
      if (ownerId.length == 0)
      {
        error.setCode(3);
        error.setMessage("No developer's id given");
        return error;
      }

      // Get the display name for this app's owner
      var visitors = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                                 ownerId);

      // We must have found this visitor
      if (visitors.length != 1)
      {
        error.setCode(4);
        error.setMessage("Developer (owner) not found: " + ownerId);
        return error;
      }
      
      var displayName = visitors[0].displayName;

      var offsetTypeCheck = offset === null || !isNaN(parseInt(offset,10));
      var countTypeCheck = count === null || !isNaN(parseInt(count,10));
      var orderTypeCheck = order === null || typeof order === "string";
      var fieldTypeCheck = field === null || typeof field === "string";
      
      if (!offsetTypeCheck || !countTypeCheck || !orderTypeCheck ||
          !fieldTypeCheck)
      {
        error.setCode(5);
        error.setMessage("Malformed mobile request: Incorrect parameter type.");
        return error;
      }      
      
      // Then use the ownerId to query for all Apps
      var results = liberated.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        {
          type : "op",
          method : "and",
          children : 
          [
            {
              type  : "element",
              field : "status",
              value : aiagallery.dbif.Constants.Status.Active 
            },
            {
              type  : "element",
              field : "owner",
              value : ownerId
            }
          ]
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset, count, order, field));
      
      // Return display names too
      results.forEach(function(obj)
        {
          obj["displayName"] = displayName;
        });
     
      return results;
    },
    
    __getAppInfo : function(fields, error)
    {
      var requiredParams = 1;
      for (var i = requiredParams + 1 - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var appId = parseInt(fields.shift(), 10);
      
      // appId is required
      if (isNaN(appId))
      {
        error.setCode(3);
        error.setMessage("No App UID given");
        return error;
      }
      
      // Using the method included by mixin MApps
      
      // Request specific fields
      var requestedFields = 
      {
        owner              : "owner",
        displayName        : "displayName",
        title              : "title",
        description        : "description",
        tags               : "tags",
        image1             : "image1",
        uploadTime         : "uploadTime",
        creationTime       : "creationTime",
        numLikes           : "numLikes",
        numDownloads       : "numDownloads",
        numViewed          : "numViewed",
        numComments        : "numComments",
        status             : "status"
      };
      
      // The final parameter to each RPC when called by the RPC Server, is an
      // error object which we can manipulate if there's an error. In this
      // case, we're pretending to be the server when we call a different RPC,
      // so pass its error object.
      
      // The appId is passed in here as a string, but is a number in reality.
      return this.getAppInfo(appId, false, requestedFields, error);
    },
    
    __getComments : function(fields, error)
    {
      var requiredParams = 1;
      for (var i = requiredParams + 1 - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }
      
      // Make sure appId is an integer
      var appId = parseInt(fields.shift(), 10);

      // appId is required
      if (isNaN(appId))
      {
        error.setCode(3);
        error.setMessage("No App UID given");
        return error;
      }      
      
      // FIXME: UNTESTED. At time of dev, no comments available to query on
      
      // The appId is passed in here as a string, but is a number in reality.
      return this.getComments(appId, null, null, error);
    },
    
    __getCategories : function(fields, error)
    {
      // fields is expected to be empty

      // Use the method included by mixin MTags
      return this.getCategoryTags(error);
    },

    /**
     * Build a correctly formatted Result Criteria array for rpc queries
     * 
     * @param offset {Number}
     *   Specify how many results to skip
     * 
     * @param count {Number}
     *   Limit how many matching results are returned
     * 
     * @param sortField {String}
     *   The field on which to sort
     * 
     * @param sortOrder {String}
     *   Either "desc" or "asc" to specify the order in which results should be
     *   returned.
     * 
     * @return {Array}
     *   Array contains objects specifying the result criteria
     * 
     */
    __buildResultCriteria : function(offset, count, sortOrder, sortField)
    {
      // Building the Result Criteria object based on what's given
      var ret = [];
      
      // Are the field on which to sort and sort order specified? Then add sort
      //   criteria.
      if (sortField && sortOrder)
      {
        ret.push({ type  : "sort", field : sortField, order : sortOrder});
      }
      
      // Did they request a certain number of results? add a limit criteria
      if (count)
      {
        ret.push({ type  : "limit", value : parseInt(count,10)}); 
      }
      
      // Did they want to skip a number of results? add offset criteria object
      if (offset)
      {
        ret.push({  type  : "offset", value : parseInt(offset,10)});
      }
      
      // return the whole finished Result Criteria array, or an empty array
      return ret;
    }
  }
});
