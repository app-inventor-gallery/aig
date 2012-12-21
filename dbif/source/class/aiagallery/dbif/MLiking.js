/**
 * Copyright (c) 2011 Reed Spool
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MLiking",
{
  construct : function()
  {
    this.registerService("aiagallery.features.likesPlusOne",
                         this.likesPlusOne,
                         [ "appId" ]);
  },

  members :
  {
    /**
     *  Add one to the number of times this app has been liked
     *
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being liked.
     *
     * @return {Integer || Error}
     *   This is the number of times this app has been liked, or an error if
     *   the app was not found
     *
     */
    likesPlusOne : function(appId, error)
    {
      var            appObj;
      var            appDataObj;
      var            myEmail;
      var            myId;
      var            likesList;
      var            criteria;
      var            likesObj;
      var            likesDataObj;
      var            visitorObj; 
      var            visitorDataObj;

      // Return number of likes (which may or may not have changed)
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          appObj = new aiagallery.dbif.ObjAppData(appId);

          // If there's no such app, return error
          if (appObj.getBrandNew())
          {
            error.setCode(1);
            error.setMessage("App with that ID not found. Unable to like.");
            return error;
          }

          // Get the application data
          appDataObj = appObj.getData();

          // Retrieve my email address and my visitor id
          myEmail = this.getWhoAmI().email;
          myId = this.getWhoAmI().id;

          // Construct query criteria for "likes of this app by current
          // visitor"
          criteria = 
            {
              type : "op",
              method : "and",
              children : 
              [
                {
                  type: "element",
                  field: "app",
                  value: appId
                },
                {
                  type: "element",
                  field: "visitor",
                  value: myId
                }
              ]
            };

          // Query for the likes of this app by the current visitor
          // (an array, which should have length zero or one).
          likesList = liberated.dbif.Entity.query("aiagallery.dbif.ObjLikes",
                                                  criteria,
                                                  null);

          // Only change things if the visitor hasn't already liked this app
          if (likesList.length === 0)
          {
            // Create a new likes object to prevent future re-likes
            likesObj = new aiagallery.dbif.ObjLikes();
            likesDataObj = likesObj.getData();

            // Put app and visitor info into it
            likesDataObj.app = appId;
            likesDataObj.visitor = myId;

            // And increment the like count in the DB
            appDataObj.numLikes++;
 
            // If the the author wants to be notified on likes then do so
            // Get the authors updateOnAppLike flag
            visitorObj = new aiagallery.dbif.ObjVisitors(appDataObj.owner); 

            // Author must exist
            if(!visitorObj.getBrandNew())
            {
              // Get the application data
              visitorDataObj = visitorObj.getData();

              // Do they want a notification on likes
              if(visitorDataObj.updateOnAppLike)
              {
                /* FIXME : Frequency not enabled at this time. 
                // Only send an email if the frequency is reached
                if(appDataObj.numLikes % visitorDataObj.updateOnAppLikeFrequency == 0)
                {
                }
                */

                // If we're on App Engine we can use java code if not we cannot send the email
                switch (liberated.dbif.Entity.getCurrentDatabaseProvider())
                {
                  case "appengine":
                    // They do so send an email
                    var props = new java.util.Properties();
                    var session = javax.mail.Session.getDefaultInstance(props, null);
                    var msgBody = "The application " + appDataObj.title + ", " + " was liked by someone. " +
                                  "Keep up the good work, you are up to " + appDataObj.numLikes + " likes."; 

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
                    msg.setSubject("An app you made was liked");
                    msg.setText(msgBody);

                    // Send the message
                    javax.mail.Transport.send(msg);

                    break;

                  default:
                    // We are not using appengine
                    this.debug("We would have sent an email if we were on appengine."); 
                    break; 
                }
              }
            }

            // Write it back to the database
            likesObj.put();
            appObj.put();
          }

          return appDataObj.numLikes;
        },
        [],
        this);
    }
  }
});
