/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MChannel",
{
  construct : function()
  {
    this.registerService("aiagallery.features.getChannelToken",
                         this.getChannelToken,
                         []);
  },

  members :
  {
    /**
     * Build a channel client id given a visitor id.
     * 
     * @return {String}
     *   The new client id built from the provided visitor id.
     */
    __makeClientId : function(visitorId)
    {
      // FIXME: Currently only a single client for any one user is
      // supported, so we use just the email address. Ultimately, this
      // should be some value (possibly including the email address) that
      // is unique to a user's client environment, not just to the user.
      return visitorId;
    },

    /**
     * Send a message to a specified visitor.
     * 
     * @param visitorId {String}
     *   An email address identifying a particular visitor
     * 
     * @param message {Object}
     *   The message contents. This object is JSON-encoded before being sent.
     */
    _messageToClient : function(visitorId, message)
    {
      var             clientId;
      var             json;
      var             channelService;
      var             messageBus;
      var             ChannelServiceFactory;
      var             ChannelMessage;
      
      // At present, only the App Engine backend supports channels
      if (liberated.dbif.Entity.getCurrentDatabaseProvider() != "appengine")
      {
        // Not App Engine. In the debug environment, with the backend running
        // in the browser, dispatch the same message on the message bus that
        // receiving it on the channel would have done.
        if (qx.core.Environment.get("qx.debug"))
        {
          // Dispatch a message for any subscribers of the type
          messageBus = qx.event.message.Bus.getInstance();
          messageBus.dispatchByName(message.type, message);
        }

        return;
      }

      // Get a reference to the channel service
      ChannelServiceFactory = 
        Packages.com.google.appengine.api.channel.ChannelServiceFactory;
      channelService = ChannelServiceFactory.getChannelService();
      
      // Obtain the client id
      clientId = this.__makeClientId(visitorId);

      // JSON-encode the message
      json = qx.lang.Json.stringify(message);

      // Send the specified message
      ChannelMessage =
        Packages.com.google.appengine.api.channel.ChannelMessage;
      channelService.sendMessage(new ChannelMessage(clientId, json));
    },

    /**
     * Get a channel token, if a user is logged in and channels are
     * supported; null otherwise
     * 
     * @return {String|null}
     *   The channel token, or null if no user was logged in or channels are
     *   not supported in the backend.
     */
    getChannelToken : function()
    {
      var             whoami;

      // At present, only the App Engine backend supports channels
      if (liberated.dbif.Entity.getCurrentDatabaseProvider() != "appengine")
      {
        // Not App Engine, so just return null
        return null;
      }

      // Get the object indicating who we're logged in as
      whoami = this.getWhoAmI();
      
      // Is someone logged in?
      if (! whoami)
      {
        // Nope.
        return null;
      }
      
      // Do the rest within a transaction, to keep the Visitor object intact
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          var             clientId;
          var             token;
          var             visitor;
          var             channelService;
          var             ChannelServiceFactory;

          // Get the current visitor object
          visitor = new aiagallery.dbif.ObjVisitors(whoami.id);

          // This visitor had better exist!
          if (visitor.getBrandNew())
          {
            java.lang.System.err.println(
              "getChannelToken: visitor missing: " +
              whoami.id + "(" + whoami.email + ")");
            return null;
          }

          // Get a reference to the channel service
          ChannelServiceFactory = 
            Packages.com.google.appengine.api.channel.ChannelServiceFactory;
          channelService = ChannelServiceFactory.getChannelService();

          // Build a client id. The same user could be logged in in more than
          // one place, so use his id and a (hopefully) unique timestamp
          clientId = this.__makeClientId(whoami.id);

          // Create a token 
          token = String(channelService.createChannel(clientId));

          // Update the channel tokens for this visitor
          //
          // FIXME: This is supposed to be an array of active channel tokens,
          // allowing for the same user to be logged in in multiple clients.
          visitor.channelTokens = [ token ];

          // Give 'em the token so they can connect to it
          return token;
        },
        [],
        this);
    }
  }
});
