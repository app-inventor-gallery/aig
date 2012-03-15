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
      var             visitor;
      var             visitorData;
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

      // Get this visitor object to determine his current channels
      visitor = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                            visitorId);

      // Ensure we found a visitor object and that he currently has channels
      if (visitor.length === 0 || 
          ! qx.lang.Type.isArray(visitor[0].channels))
      {
        // Nope. Nothing to do.
        return;
      }

      // Get a reference to the channel service
      ChannelServiceFactory = 
        Packages.com.google.appengine.api.channel.ChannelServiceFactory;
      channelService = ChannelServiceFactory.getChannelService();
      
      // JSON-encode the message
      json = qx.lang.Json.stringify(message);

      // Get quick access to the ChannelMessage class
      ChannelMessage = Packages.com.google.appengine.api.channel.ChannelMessage;
      
      // Send the specified message to each registered client
      visitor[0].channels.forEach(
        function(clientId)
        {
          try
          {
            channelService.sendMessage(new ChannelMessage(clientId, json));
          }
          catch(e)
          {
            // channel is not currently valid
          }
        });
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
          var             data;
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

          // Generate a client ID. We want to support the same user being
          // signed in from multiple sessions, so we include both his visitor
          // ID and a timestamp. This makes the assumption that the same
          // visitor will not sign in to different sessions in the same
          // millisecond. Seems like a reasonable assumption.
          clientId = qx.lang.Json.stringify(
            {
              id : whoami.id,
              ts : aiagallery.dbif.MDbifCommon.currentTimestamp()
            });

          // Update the channel id list for this visitor
          data = visitor.getData();
          if (qx.lang.Type.isArray(data.channels))
          {
            data.channels.push(clientId);
          }
          else
          {
            data.channels = [ clientId ];
          }
          
          //
          // DEPRECATE: Remove obsolete field 
          // (channelTokens was replaced by channels)
          //
          delete data.channelTokens;

          // Save the modified visitor object
          visitor.put();

          // Create a token for the requester
          token = String(channelService.createChannel(clientId));

          // Give 'em the token so they can connect to it
          return token;
        },
        [],
        this);
    },
    
    _updateChannels : function(bConnect, jsonClientId)
    {
      var             clientId;
      
      // Parse the clientId object to determine the visitor id
      clientId = qx.lang.Json.parse(jsonClientId);
      
      // Valid data?
      if (! qx.lang.Type.isObject(clientId) ||
          typeof(clientId.id) == "undefined" ||
          typeof(clientId.ts) == "undefined")
      {
        // Nope. There's nothing we can do.
        java.lang.System.err.println(
          "updateChannels: unrecognized client id: " + clientId);
        return;
      }

      liberated.dbif.Entity.asTransaction(
        function()
        {
          var             i;
          var             minTimeStamp;
          var             visitor;
          var             data;
          var             tempClientId;
          var             tempJsonClientId;

          // Obtain the visitor object
          visitor = new aiagallery.dbif.ObjVisitors(clientId.id);

          // This visitor had better exist!
          if (visitor.getBrandNew())
          {
            java.lang.System.err.println(
              "updateChannels: could not find visitor id: " + clientId.id);
            return;
          }

          // Get the visitor data
          data = visitor.getData();

          // Is there a channels array?
          if (! qx.lang.Type.isArray(data.channels))
          {
            // Nope. Create one.
            data.channels = [];
          }

          // Get the minimum valid timestamp. Anything older than this has
          // already exceeded App Engine's 2-hour limit. (We add a fudge
          // factor, of an hour, in case App Engine doesn't shut connections
          // down exactly on time.)
          minTimeStamp = 
            aiagallery.dbif.MDbifCommon.currentTimestamp() -
            (3 * 1000 * 60 * 60);

          // Loop through the existing channels. Remove this client id (even in
          // the case of a connect, since it could already be there), and also
          // remove any whose timestamps are (well) more than 2 hours old.
          for (i = data.channels.length - 1; i >= 0; i--)
          {
            // Get this one
            tempJsonClientId = data.channels[i];

            // Is this the one currently being connected or disconnected?
            if (tempJsonClientId == jsonClientId)
            {
              // Yup. Remove it.
              data.channels.splice(i, 1);
            }

            // Parse this entry
            tempClientId = qx.lang.Json.parse(tempJsonClientId);

            // Is it out of date?
            if (tempClientId.ts < minTimeStamp)
            {
              // Yup. Remove it.
              data.channels.splice(i, 1);
            }
          }

          // Now, if this is a connect, ...
          if (bConnect)
          {
            // ... add the client id
            data.channels.push(jsonClientId);
          }

          // Write out the modified data
          visitor.put();
        });
    }
  }
});
