/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(javax.*)
 */

qx.Mixin.define("aiagallery.dbif.MComments",
{
  construct : function()
  {
    this.registerService("aiagallery.features.addComment",
                         this.addComment,
                         [ "appId", "text", "parentTreeId" ]);

    this.registerService("aiagallery.features.deleteComment",
                         this.deleteComment,
                         [ "appId", "treeId" ]);

    this.registerService("aiagallery.features.getComments",
                         this.getComments,
                         [ "appId", "resultCriteria" ]);
    
    this.registerService("aiagallery.features.getFlaggedComments",
                         this.getFlaggedComments,
                         []);
                        
    this.registerService("aiagallery.features.setCommentActive",
                         this.setCommentActive,
                         []);
  },

  statics :
  {
    _base160arr : 
    [
       48,  49,  50,  51,  52,  53,  54,  55,  56,  57,  /* 0-9 */
       58,  59,  65,  66,  67,  68,  69,  70,  71,  72,  /* : ; A-H */
       73,  74,  75,  76,  77,  78,  79,  80,  81,  82,  /* I-R */
       83,  84,  85,  86,  87,  88,  89,  90,  97,  98,  /* S-Z , a-b */
       99, 100, 101, 102, 103, 104, 105, 106, 107, 108, /* c-l */
      109, 110, 111, 112, 113, 114, 115, 116, 117, 118, /* m-v */
      119, 120, 121, 122, 160, 161, 162, 163, 164, 165, /* w-z, latin1 */
      166, 167, 168, 169, 170, 171, 172, 173, 174, 175, /* latin1 */
      176, 177, 178, 179, 180, 181, 182, 183, 184, 185, /* latin1 */
      186, 187, 188, 189, 190, 191, 192, 193, 194, 195, /* latin1 */
      196, 197, 198, 199, 200, 201, 202, 203, 204, 205, /* latin1 */
      206, 207, 208, 209, 210, 211, 212, 213, 214, 215, /* latin1 */
      216, 217, 218, 219, 220, 221, 222, 223, 224, 225, /* latin1 */
      226, 227, 228, 229, 230, 231, 232, 233, 234, 235, /* latin1 */
      236, 237, 238, 239, 240, 241, 242, 243, 244, 245, /* latin1 */
      246, 247, 248, 249, 250, 251, 252, 253, 254, 255  /* latin1 */
    ]
  },

  members :
  {
    /**
     *  Add a comment to the database.
     * 
     * @param appId 
     *   This is either a string or number which is the uid of the app to which
     *   this comment is associated.
     * 
     * @param text {String}
     *   The comment text itself.
     * 
     * @param parentTreeId {String}
     *   The parent's treeId.
     * 
     */
    addComment : function(appId, text, parentTreeId, error)
    {
      var             whoami;
      var             commentObj;
      var             commentObjData;
      var             parentAppObj;
      var             parentAppData;
      var             parentCommentObj;
      var             parentCommentData;
      var             parentTreeId;
      var             myTreeId;
      var             parentList;
      var             parentNumChildren;
      var             visitorObj;
      var             visitorDataObj;
        
      // Determine who the logged-in user is
      whoami = this.getWhoAmI();
      
      // Is text empty or just whitespace?
      if ( text === null || text === "" || text.match(/\S/gi) === null)
      {
        // Yes, discard the trash and let the user know.
        error.setCode(3);
        error.setMessage("Empty Comment");
        return error;
      }

      // Begin a transaction so all or no comments' changes are recorded
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          // Get and increment the Parent App's numRootComments and
          // numComments total
          parentAppObj = new aiagallery.dbif.ObjAppData(appId);
          parentAppData = parentAppObj.getData();

          // Was the parent comment's treeId provided?
          if (typeof(parentTreeId) === "undefined" || parentTreeId === null)
          {
            // No, we're going to use the root parent id, ""
            parentTreeId = "";

            // Get what we need
            parentNumChildren = parentAppData.numRootComments || 0;         

            // Increment parent app's # of children
            parentAppData.numRootComments = parentNumChildren + 1;
          }
          else
          {
            // Yes, use it to get the parent comment object.
            parentCommentObj = 
              new aiagallery.dbif.ObjComments([appId, parentTreeId]);

            parentCommentData = parentCommentObj.getData();

            // Was our parentUID invalid, resulting in a new ObjComments?
            if (parentCommentObj.getBrandNew())
            {
              // We can't use an invalid UID as our parent UID!
              error.setCode(1);
              error.setMessage("Unrecognized parent treeId");
              return error;
            }

            // Get what we came for.
            parentNumChildren = parentCommentData.numChildren;
            parentTreeId = parentCommentData.treeId;

            // Increment parent comment's # of children
            parentCommentData.numChildren = parentNumChildren + 1;

            // Save the new # children in the parent comment
            parentCommentObj.put();
          }

          // Increment the total number of comments on the App
          parentAppData.numComments++;

          // Update the parent app and/or comment object. 
          // Congrats! a new baby comment!
          parentAppObj.put();

          // Append our parent's number of children, base160 encoded, to
          // parent's treeId
          myTreeId = parentTreeId + this._numToBase160(parentNumChildren);

          // Get a new ObjComments object, with our appId and newly generated
          // treeId.
          commentObj = new aiagallery.dbif.ObjComments([appId, myTreeId]);

          // Was a comment with this key already in the DB?
          if (!commentObj.getBrandNew())
          {
            // That's an error
            error.setCode(3);
            error.setMessage("Attempted to overwrite existing comment");
            return error;
          }

          // Retrieve a data object to manipulate.
          commentObjData = commentObj.getData();

          // Set up all the rest of the data
          commentObjData.visitor     = whoami.id;
          commentObjData.text        = text;

          // Save this in the database
          commentObj.put();

          // Add his display name, for return.
          commentObjData.displayName     = whoami.displayName;

          // If the author has requested to be notified on app comments 
          // do so now
          // Get the authors updateOnAppComment flag
          visitorObj = new aiagallery.dbif.ObjVisitors(parentAppData.owner); 

          // Author must exist
          if(!visitorObj.getBrandNew())
          {
            // Get the application data
            visitorDataObj = visitorObj.getData();

            // Do they want a notification on likes
            if(visitorDataObj.updateOnAppComment)
            {
              /* FIXME : Frequency not enabled at this time. 
              // Only send an email if the frequency is reached
              if(appDataObj.numLikes % 
                 visitorDataObj.updateCommentFrequency == 0)
              {
              }
              */

              // If we're on App Engine we can use java code 
              // if not we cannot send the email
              switch (liberated.dbif.Entity.getCurrentDatabaseProvider())
              {
                case "appengine":
                  // They do so send an email
                  var props = new java.util.Properties();
                  var session = 
                    javax.mail.Session.getDefaultInstance(props, null);
                  var msgBody = "The application " + parentAppData.title + ", "
                                + " has a new comment by " 
                                + commentObjData.displayName + ". " 
                                + "The comment is: " + commentObjData.text; 

                  var msg = new javax.mail.internet.MimeMessage(session);

                  // The sender email must be either the logged in user or 
                  // an administrator of the project. 
                  msg.setFrom(new javax.mail.internet.InternetAddress(
                              "cpuwhiz11@gmail.com",
                              "App Inventor Gallery Admin"));

                  // Revipient is the owner of the app being liked 
                  msg.addRecipient(javax.mail.Message.RecipientType.TO,
                                   new javax.mail.internet.InternetAddress(
                                     visitorDataObj.email,
                                     "Author or App"));
                  msg.setSubject("An app you authored has been commented on");
                  msg.setText(msgBody);

                  // Send the message
                  javax.mail.Transport.send(msg);

                  break;

                default:
                  // We are not using appengine
                  this.debug("We would have sent an email if "
                             + "we were on appengine."); 
                  break; 
              }
            }
          }

          // Remove the visitor field
          delete commentObjData.visitor;

          // This includes newly-created key
          return commentObjData;  
        },
        [],
        this);
    },
    
    /**
     * Delete a specific individual comment
     * 
     * @param appId {Number}
     *   This is the unique identifier for the app containing the comment to
     *   delete
     * 
     * @param treeId {String}
     *   This is the thread tree identifier for the comment which is to be
     *   deleted
     * 
     * @return {Boolean}
     *   Returns true if deletion was successful. If false is returned, nothing
     *   was deleted.
     */
    deleteComment : function(appId, treeId, error)
    {
      var             commentObj;
      var             parentAppObj;
      var             parentAppData;
      var             parentTreeId;
      var             criteria;
      var             flagsList; 
      
      // Retrieve an instance of this comment entity
      commentObj = new aiagallery.dbif.ObjComments([appId, treeId]);
      
      // Does this comment exist?
      if (commentObj.getBrandNew())
      {
        // It doesn't. Let 'em know.
        return false;
      }
      
      // Find out the App that was commented on and...
      parentAppObj = new aiagallery.dbif.ObjAppData(appId);
      
      parentAppData = parentAppObj.getData();
      
      // Decrement the number of comments attached to this App.
      parentAppData["numComments"]--;

      liberated.dbif.Entity.asTransaction(
        function()
        {
          // Did this comment have any flags related to it
          // if so delete them
          this.__removeFlags(appId, treeId); 
            
          // Save this change
          parentAppObj.put();
      
          // Delete the app
          commentObj.removeSelf();
        }, [], this);
      
      // We were successful
      return true;
    },
    
    /**
     * Get comments associated with an App
     *
     * @param appId {?}
     *   The appId whose comments should be returned
     * 
     * @param resultCriteria {Map}
     *   A result criteria map, as documented at 
     *   {@link liberated.dbif.Entity.query}
     * 
     * @param error {liberated.rpc.error.Error}
     *   All RPCs are passed, as their final argument, an error object. Most
     *   don't use it, but this one does. If the application being requested
     *   is not found (which, since the uid of the specific application is
     *   provided as a parameter, likely means that it was just deleted), an
     *   error is generated back to the client by setting the code and message
     *   in this object.
     * 
     * @return {Array}
     *   An array containing all of the comments related to this app
     *   
     */
    getComments : function(appId, resultCriteria, error)
    {
      var             commentList;
      var             criteria;
  
      // Retrieve all Active comments for this app
      criteria = 
        {
          type : "op",
          method : "and",
          children : 
          [
            {
              type : "element",
              field: "app",
              value: appId
            },
            {
              type: "element",
              field: "status",
              value: aiagallery.dbif.Constants.Status.Active 
            }
          ]
        };

      // Issue a query for all comments, with limit and offset settings applied
      commentList = liberated.dbif.Entity.query("aiagallery.dbif.ObjComments", 
                                                criteria,
                                                resultCriteria);

      try
      {
        commentList.forEach(function(obj)
          {
            // Add this visitor's display name
            obj.displayName = 
              aiagallery.dbif.MVisitors._getDisplayName(obj.visitor, error);
            
            // Did we fail to find this owner?
            if (obj.visitor === error)
            {
              // Yup. Abort the request.
              throw error;
            }
            
            // Remove the visitor field
            delete obj.visitor;
          });
      }
      catch(error)
      {
        return error;
      }
      
      return commentList;
    },
    
    /**
     * Get the list of flagged comments
     * 
     * @return {List}
     *   A list (possibly empty) containing all flagged comments
     */
    getFlaggedComments : function()
    {
      var         criteria;
      var         resultList;
      var         i;
      var         error;
      
      // Create error for when we get display names
      error = new liberated.rpc.error.Error();
      
      // Retrieve all Active comments for this app
      criteria = 
        {
          type     : "element",
          field    : "numCurFlags",
          value    : 0,
          filterOp : ">"  
        };

      // Issue a query for all flagged comments
      resultList = liberated.dbif.Entity.query("aiagallery.dbif.ObjComments", 
                                               criteria,
                                               null);
                                               
      try
      {
        resultList.forEach(function(obj)
          {
            // Add this visitor's display name
            obj.displayName = 
              aiagallery.dbif.MVisitors._getDisplayName(obj.visitor, error);
            
            // Did we fail to find this owner?
            if (obj.visitor === error)
            {
              // Yup. Abort the request.
              throw error;
            }
            
            // Remove the visitor field
            delete obj.visitor;
          });
      }
      catch(error)
      {
        return error;
      }
                                                   
      return resultList; 
    },
    
    /**
     * Set a comment to active (so it can be viewed)
     *
     * @param appId {Number}
     *   This is the unique identifier for the app containing the comment to
     *   delete
     * 
     * @param treeId {String}
     *   This is the thread tree identifier for the comment which is to be
     *   deleted
     * 
     * @return {Boolean}
     *   Returns true if setting comment to active was successful. 
     */
    setCommentActive : function(appId, treeId)
    {
      var             commentObj;
      var             commentObjData;
    
      // Retrieve an instance of this comment entity
      commentObj = new aiagallery.dbif.ObjComments([appId, treeId]);
      
      // Get data
      commentObjData = commentObj.getBrandNew()
      
      // Does this comment exist?
      if (commentObjData)
      {
        // It doesn't. Let 'em know.
        return false;
      } 
      else
      {
        commentObjData = commentObj.getData(); 
      }
      
      liberated.dbif.Entity.asTransaction(
        function()
        {     
            // Change status to active
            commentObjData.status = aiagallery.dbif.Constants.Status.Active;  
            
            // Set number of flags to 0
            commentObjData.numCurFlags = 0;
        
            // Remove any flags related to comment 
            this.__removeFlags(appId, treeId); 
            
            // Commit change
            commentObj.put();
            
        }, [], this); 

      // Success
      return true; 
    },
   
    /**
     * Encode an integer as a string of base160 characters
     * 
     * @param val {Number}
     *   An integer to base160 encode
     * 
     * @return {String}
     *   A string of length 4 containing base160 digits as characters.
     */
    _numToBase160 : function(val)
    {
      var retStr = "";
      
      for (var i = 3; i >= 0 ; i--)
      {
        // Take the number mod 160. Prepend the ASCII char of the result.
        retStr = String.fromCharCode(
          aiagallery.dbif.MComments._base160arr[val % 160]) + retStr;
        val = Math.floor(val / 160);
      }
      
      return retStr;
    },
    /**
     * Increment the base160 number passed. This only augments the farthest
     * right-most 4 characters (base160 digits).
     * 
     * @param base160str {String}
     *   An integer encoded as a string of base160 characters.
     * 
     * @return {String}
     *   An integer encoded as a string of base160 characters. This is the 
     *   argument + 1.
     */
    _incrementBase160 : function(base160str)
    {
      var len = base160str.length;
      var i;
      var notMyPiece = base160str.substr(0, len-4);
      var retStr = "";
      var ch;
      var index;
      
      // We only care about the rightmost 4 digits, one level in the tree.
      for (i = len - 1; i >= len-4 ; i--)
      {
        // Get this digit
        ch = base160str.charCodeAt(i);

        // Find the index of this digit in the encoding array.
        index = aiagallery.dbif.MComments._base160arr.indexOf(ch);
         
        // Is this the last entry in the encoding array?
        if (index === aiagallery.dbif.MComments._base160arr.length - 1)
        {
          // Yup.  This is a carry. This value gets base160arr[0]. We go on to
          // the next higher-order digit by continuing through the for-loop
          retStr = 
            String.fromCharCode(aiagallery.dbif.MComments._base160arr[0]) +
            retStr;
        }
        else
        {
          // No carry. Just add 1, piece everything together, and we're done.
          retStr = 
            String.fromCharCode(
              aiagallery.dbif.MComments._base160arr[index + 1]) +
            retStr;
          retStr = base160str.substring(len - 4, i) + retStr;
          break;
        }
      }
     
      return notMyPiece + retStr;
    },
    
    /**
     * If a comment is being set back to active, or delete, 
     * delete any flags associated with it. 
     * Should be called within a transaction. 
     * 
     * @param appId {Key}
     *   The application id with which the comment is associated
     *
     * @param treeId {String}
     *   The tree id of the comment
     * 
     * @return {Boolean}
     *   True for success
     */
    __removeFlags : function(appId, treeId)
    {
      var             criteria;
      var             flagsList;
      
      // Construct query of flags related to this comment
      criteria = 
      {
        type : "op",
        method : "and",
        children : 
        [
          { 
            type  : "element",
            field : "comment",
            value : treeId
          },
          {
            type  : "element",
            field : "app",
            value : appId
          }
        ]
      };
    
      // Query for the flags of this comment 
      flagsList = liberated.dbif.Entity.query("aiagallery.dbif.ObjFlags",
                                              criteria,
                                              null);
                                              
      // Each of these flags should be removed
      flagsList.forEach(
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
    
    }
  }
});
