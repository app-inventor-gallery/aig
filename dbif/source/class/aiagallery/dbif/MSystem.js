/**
 * Copyright (c) 2012 Paul Geromini 
 * Copyright (c) 2012 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(com.google.*)
#ignore(javax.*)
 */

qx.Mixin.define("aiagallery.dbif.MSystem",
{
  construct : function()
  {
    this.registerService("aiagallery.features.getMotd",
                         this.getMotd,
                         []);

    this.registerService("aiagallery.features.setMotd",
                         this.setMotd,
                         [ "motdContent" ]);

    this.registerService("aiagallery.features.sendEmail",
                         this.sendEmail,
                         [ "msg", "subject", "userEmail", "appObj" ]);
  },

  members :
  {
    /** 
     * Create a new motd or set a new message for an already existing motd
     *
     * @param motdContent {String}
     *   The actual string content of the new motd
     *
     * @return {String}
     *   This returns the actual motd string, or an error if
     *   something went wrong
     */
     setMotd : function(motdContent)
     {
       var             systemObj;
       var             systemObjData;
       
       return liberated.dbif.Entity.asTransaction( 
         function()
         {
           // Retrieve or create a new system object which contains the motd 
           systemObj = 
             new aiagallery.dbif.ObjSystem(aiagallery.dbif.ObjSystem.SINGLETON);

           // Get the data
           systemObjData = systemObj.getData();

           // Update content
           systemObjData.motd = motdContent;

           // Put this on the databse   
           systemObj.put(); 

           // If we are running on appengine we need to update memcache
           switch (liberated.dbif.Entity.getCurrentDatabaseProvider())
           {

           case "appengine":
             var  MemcacheServiceFactory =
               Packages.com.google.appengine.api.memcache.MemcacheServiceFactory;
             var syncCache = MemcacheServiceFactory.getMemcacheService();
             //syncCache.setErrorHandler(ErrorHandlers.getConsistentLogAndContinue(Level.INFO));

             // read from cache, -1 is magic number to get homeRibbonData, motd is stored here
             var value = syncCache.get(-1); 

             // If nothing is in the cache, do nothing 
             if (value == null) {
                 break;
             }

             // Stored as JSON string, so parse back to map
             value = JSON.parse(value);

             // Update motd with new value
             value.Motd = motdContent;   

             // Store back onto memcache
             // Convert back to JSON string
             value = JSON.stringify(value);

             // Create a Java date object and add one day to set the expiration time
             var calendarClass = java.util.Calendar;
             var date = calendarClass.getInstance();  
             date.add(calendarClass.DATE, 1); 

             var expirationClass = com.google.appengine.api.memcache.Expiration;
             var expirationDate = expirationClass.onDate(date.getTime());
             syncCache.put(-1, value, expirationDate);

           default:
             // We are not using appengine
             break; 

           }

           // Return new motdData string
           return systemObjData.motd; 
         }); 
     },
     
    /** 
     * Get the existing motd
     *
     * @return {String}
     *   This returns the actual motd content, or an error if
     *   something went wrong
     */
     getMotd : function()
     {
       var             systemObj;
       var             systemObjData;
       
       // Get the system object
       systemObj = 
         new aiagallery.dbif.ObjSystem(aiagallery.dbif.ObjSystem.SINGLETON);

       // Get the system object
       systemObjData = systemObj.getData();

       // Return the string motd
       return systemObjData.motd || ""; 
     
     },

    /**
     * Send an email to notify a user of an event
     * 
     * @param msg {String} the string message body to be sent
     * 
     * @param subject {String} the email subject line
     * 
     * @param userEmail {String} the user email to send mail to
     * 
     * @param appObj {ObjAppData} app related to msg. If included
     *   add link info to msg
     * 
     */
     sendEmail : function(msg, subject, userEmail, appObj)
     {
       // If we're on App Engine we can use java code 
       // if not we cannot send the email, write to console
       switch (liberated.dbif.Entity.getCurrentDatabaseProvider())
       {
         case "appengine":
           // They do so send an email
           var props = new java.util.Properties();
           var session = 
             javax.mail.Session.getDefaultInstance(props, null);

           var msgFinal = new javax.mail.internet.MimeMessage(session);

           // The sender email must be either the logged in user or 
           // an administrator of the project. 
           msgFinal.setFrom(new javax.mail.internet.InternetAddress(
                       "vincentaths@gmail.com",
                       "App Inventor Gallery Admin"));

           // Revipient is the owner of the app being liked 
           msgFinal.addRecipient(javax.mail.Message.RecipientType.TO,
                           new javax.mail.internet.InternetAddress(
                             userEmail,
                             "Author of App"));

           msgFinal.setSubject(subject);
            
           // If there is an included appObj construct the app link
           // to include with the msg
           if(appObj)
           {
             var appLink = "http://gallery.appinventor.mit.edu/#page";

             // Test link 
             //var appLink = 
             //"http://paulstest02.usf-appinventor-gallery.appspot.com/#page";
             var appLinkFrag = "=App&uid=" + appObj.uid
                                + "&label=" + appObj.title; 

             appLink += encodeURIComponent(appLinkFrag);

             msg += "<br>Visit your app: " + appLink; 
           }

           // Add in unsubscribe info
           var profileUrl = "http://gallery.appinventor.mit.edu/#page";

           var profileUrlFrag = "%3DProfile"; 
           profileUrl += encodeURIComponent(profileUrlFrag);

           msg += "<font size =\"1\" >"
                  +"<br><br>To unsubscribe to gallery notifications,"
		  + " please visit your profile page at: " 
                  + profileUrl + "</font>"; 

           msgFinal.setContent(msg, "text/html");

           // Send the message
           javax.mail.Transport.send(msgFinal);

           break;

         default:
           // We are not using appengine
           this.debug("We would have sent an email if "
                      + "we were on appengine."); 
           break; 
       }
     }
  } 
}); 
