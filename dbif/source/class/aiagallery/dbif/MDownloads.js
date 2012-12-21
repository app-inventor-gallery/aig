/**
 * Copyright (c) 2012 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(javax.*)
 */

qx.Mixin.define("aiagallery.dbif.MDownloads",
{
  members :
  {
    /**
     *  Add one to the number of times this app has been downloaded
     *
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being downloaded.
     *
     * @return {Integer}
     *   Returns the new number of downloads upon successfully updating the
     *   number of downloads; -1 upon error.
     */
    _downloadsPlusOne : function(appId)
    {
      // Return the new number of downloads upon successfully updating number
      // of downloads; -1 otherwise.
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          var             appObj;
          var             appDataObj;
          var             visitorObj;
          var             visitorDataObj;

          appObj = new aiagallery.dbif.ObjAppData(appId);

          // If there's no such app, return error
          if (appObj.getBrandNew())
          {
            return -1;
          }

          // Get the application data
          appDataObj = appObj.getData();

          // And increment the download count in the DB
          appDataObj.numDownloads++;

          // If the author has requested to be notified on app downloads do so now
          // Get the authors updateOnAppDownload flag
          visitorObj = new aiagallery.dbif.ObjVisitors(appDataObj.owner); 

          // Author must exist
          if(!visitorObj.getBrandNew())
          {
            // Get the application data
            visitorDataObj = visitorObj.getData();

            // Do they want a notification on likes
            if(visitorDataObj.updateOnAppDownload)
            {
              /* FIXME : Frequency not enabled at this time. 
              // Only send an email if the frequency is reached
              if(appDataObj.numDownloads % visitorDataObj.updateOnAppDownloadFrequency == 0)
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
                  var msgBody = "The application " + appDataObj.title + ", " +
                                " has a been downloaded. You are up to " + 
                                appDataObj.numDownloads + " downloads. Keep up the good work"; 
  
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
                  msg.setSubject("An app you authored has been downloaded");
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
          appObj.put();

          return appDataObj.numDownloads;
        },
        [],
        this);
    }
  }
});
