/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(environment)
#ignore(process)
#ignore(JavaAdapter)
*/

qx.Class.define("appenginesqlite.Application",
{
  extend : qx.application.Basic,

  statics :
  {
    /** The database (and remote procedure call) interface instance */
    dbif : null,

    /**
     * Process a POST request. These are the standard GUI-initiated remote
     * procedure calls.
     *
     * @param request {Packages.javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {Packages.javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    doPost : function(request, response)
    {
      var             rpcResult;
      var             out;
      var             reader;
      var             line;
      var             input = [];
      var             jsonInput;

      // Retrieve the JSON input from the POST request. First, get the input
      // stream (the POST data)
      reader = request.getReader();

      // Read the request data, line by line.
      for (line = reader.readLine(); line != null; line = reader.readLine())
      {
        input.push(String(line));
      }

      // Convert the input lines to a single string
      jsonInput = String(input.join("\n"));

      // Process this request
      rpcResult = appenginesqlite.Application.dbif.processRequest(jsonInput);

      // Ignore null results, which occur if the request is a notification.
      if (rpcResult !== null)
      {
        // Generate the response.
        response.setContentType("application/json");
        out = response.getWriter();
        out.println(rpcResult);
      }
    },


    /**
     * Process a GET request. These are used for ancillary requests.
     *
     * @param request {Packages.javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {Packages.javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    doGet : function(request, response)
    {
      var             dbif;
      var             entry;
      var             entity;
      var             queryString = request.getQueryString();
      var             querySplit;
      var             argSplit;
      var             jsonInput;
      var             rpcResult;
      var             decodeResult;
      var             out;
      var             Db;

      // We likely received something like:
      //   tag=by_developer%3AJoe%20Blow%3A0%3A10%3AuploadTime
      // which decodes to this:
      //   tag=by_developer:Joe Blow:0:10:uploadTime
      //
      // Decode it and split the command (tag, in this case) from the
      // parameter. We'll ignore any commands other than the first,
      // i.e. anything including and following an ampersand.
      querySplit = decodeURIComponent(queryString).split(/[=&]/);

      // See what was requested.
      switch(querySplit[0])
      {
      case "ls":               // File listing
        var             entities;

        // Get the database interface instance
        dbif = appenginesqlite.Application.dbif;

        if (false)
        {
          // Identify ourself (find out who's logged in)
          dbif.identify();

          // Only an administrator can do this
          if (! aiagallery.dbif.MDbifCommon.__whoami ||
              ! aiagallery.dbif.MDbifCommon.__whoami.isAdmin)
          {
            java.lang.System.out.println("not administrator");    
            return;
          }
        }
        else
        {
          this.warn("ALLOWING ALL USERS!");
        }

        // Gain easy access to our output writer
        out = response.getWriter();

        var target = querySplit[1] || ".";
        var dir = new java.io.File(target);
        var children = dir.list();
        if (children == null)
        {
          out.println("Not found");
          return;
        }

        out.println("Children of " + target + ":");
        for (var i = 0; i < children.length; i++)
        {
          out.println("  " + i + ": " + children[i]);
        }

        break;

      case "flushDB":               // flush the entire database
        var             entities;

        // Get the database interface instance
        dbif = appenginesqlite.Application.dbif;

        if (false)
        {
          // Identify ourself (find out who's logged in)
          dbif.identify();

          // Only an administrator can do this
          if (! aiagallery.dbif.MDbifCommon.__whoami ||
              ! aiagallery.dbif.MDbifCommon.__whoami.isAdmin)
          {
            java.lang.System.out.println("not administrator");    
            return;
          }
        }
        else
        {
          this.warn("ALLOWING ALL USERS!");
        }

        // AppData
        entities = liberated.dbif.Entity.query("aiagallery.dbif.ObjAppData");
        entities.forEach(
          function(entity)
          {
            var obj =
              new aiagallery.dbif.ObjAppData(entity.uid);
            obj.removeSelf();
          });

        // Comments
        entities = liberated.dbif.Entity.query("aiagallery.dbif.ObjComments");
        entities.forEach(
          function(entity)
          {
            var obj = 
              new aiagallery.dbif.ObjComments([ entity.app, entity.treeId ]);
            obj.removeSelf();
          });

        // Search
        entities = liberated.dbif.Entity.query("aiagallery.dbif.ObjSearch");
        entities.forEach(
          function(entity)
          {
            var obj = 
              new aiagallery.dbif.ObjSearch([ 
                                              entity.word,
                                              entity.appId,
                                              entity.appField
                                            ]);
            obj.removeSelf();
          });

        // Tags
        entities = liberated.dbif.Entity.query("aiagallery.dbif.ObjTags");
        entities.forEach(
          function(entity)
          {
            var obj =
              new aiagallery.dbif.ObjTags(entity.value);
            obj.removeSelf();
          });

        // Visitors
        entities = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors");
        entities.forEach(
          function(entity)
          {
            var obj =
              new aiagallery.dbif.ObjVisitors(entity.id);
            obj.removeSelf();
          });

        // Now add the category tags, required for uploading an application
        qx.Class.include(appenginesqlite.DbifAppEngineSqlite,
                         aiagallery.dbif.MSimData);
        Db = aiagallery.dbif.MSimData.Db;

        for (entry in Db.tags)
        {
          // Exclude normal tags. We want only special and category tags
          if (Db.tags[entry].type == "normal")
          {
            continue;
          }

          // Reset the count
          Db.tags[entry].count = 0;

          // Create and save an entity
          entity = new aiagallery.dbif.ObjTags(entry);
          entity.setData(Db.tags[entry]);
          entity.put();
        }

        break;

      case "addSimData": // regenerate all simulation data (derrell only)
        //
        // Add the simulation data to the App Engine database
        //

        // Get the database interface instance
        dbif = appenginesqlite.Application.dbif;

        if (false)
        {
          // Identify ourself (find out who's logged in)
          dbif.identify();

          // Only an administrator can do this
          if (! aiagallery.dbif.MDbifCommon.__whoami ||
              ! aiagallery.dbif.MDbifCommon.__whoami.isAdmin)
          {
            java.lang.System.out.println("not administrator");    
            return;
          }
        }
        else
        {
          this.warn("ALLOWING ALL USERS!");
        }

        qx.Class.include(appenginesqlite.DbifAppEngineSqlite,
                         aiagallery.dbif.MSimData);
        Db = aiagallery.dbif.MSimData.Db;

        for (entry in Db.visitors)
        {
          entity = new aiagallery.dbif.ObjVisitors(entry);
          entity.setData(Db.visitors[entry]);
          entity.put();
        }

        for (entry in Db.tags)
        {
          entity = new aiagallery.dbif.ObjTags(entry);
          entity.setData(Db.tags[entry]);
          entity.put();
        }

        for (entry in Db.apps)
        {
          // UID is a number, so retrieve it
          var uid = Db.apps[entry].uid;

          entity = new aiagallery.dbif.ObjAppData(uid);

          // Kludge in the numRootComments field since it's not in MSimData
          Db.apps[entry].numRootComments = 0;

          entity.setData(Db.apps[entry]);
          entity.put();
        }

        for (entry in Db.downloads)
        {
          entity = new aiagallery.dbif.ObjDownloads(entry);
          entity.setData(Db.downloads[entry]);
          entity.put();
        }

        for (entry in Db.comments)
        {
          entity = new aiagallery.dbif.ObjComments(entry);
          entity.setData(Db.comments[entry]);
          entity.put();
        }

        for (entry in Db.likes)
        {
          entity = new aiagallery.dbif.ObjLikes(entry);
          entity.setData(Db.likes[entry]);
          entity.put();
        }

        for (entry in Db.flags)
        {
          entity = new aiagallery.dbif.ObjFlags(entry);
          entity.setData(Db.flags[entry]);
          entity.put();
        }
        break;

      case "clearSimData":  // destroy all simulation data(derrell only)
        //
        // Remove ALL data sitting in simulation database.
        //

        // Get the database interface instance
        dbif = appenginesqlite.Application.dbif;

        if (false)
        {
          // Identify ourself (find out who's logged in)
          dbif.identify();

          // Only an administrator can do this
          if (! aiagallery.dbif.MDbifCommon.__whoami ||
              ! aiagallery.dbif.MDbifCommon.__whoami.isAdmin)
          {
            java.lang.System.out.println("not administrator");    
            return;
          }
        }
        else
        {
          this.warn("ALLOWING ALL USERS!");
        }

        qx.Class.include(appenginesqlite.DbifAppEngineSqlite,
                         aiagallery.dbif.MSimData);
        Db = aiagallery.dbif.MSimData.Db;

        for (entry in Db.visitors)
        {
          entity = new aiagallery.dbif.ObjVisitors(Db.visitors[entry].id);
          entity.removeSelf();
        }

        for (entry in Db.tags)
        {
          entity = new aiagallery.dbif.ObjTags(Db.tags[entry].value);
          entity.removeSelf();
        }

        for (entry in Db.apps)
        {
          entity = new aiagallery.dbif.ObjAppData(Db.apps[entry].uid);
          entity.removeSelf();
        }
        for (entry in Db.downloads)
        {
          entity = new aiagallery.dbif.ObjDownloads(Db.downloads[entry].apps);
          entity.removeSelf();
        }

        for (entry in Db.comments)
        {
          entity = new aiagallery.dbif.ObjComments(Db.comments[entry].app);
          entity.removeSelf();
        }

        for (entry in Db.likes)
        {
          entity = new aiagallery.dbif.ObjLikes(Db.likes[entry].app);
          entity.removeSelf();
        }

        for (entry in Db.flags)
        {
          entity = new aiagallery.dbif.ObjFlags(Db.flags[entry].app);
          entity.removeSelf();
        }

        break;

      case "tag":              // mobile client request
        // Simulate a real RPC request
        jsonInput = 
          '{\n' +
          '  "id"      : "tag",\n' +
          '  "service" : "aiagallery.features",\n' +
          '  "method"  : "mobileRequest",\n' +
          '  "params"  : [ "' + querySplit[1] + '" ]\n' +
          '}';

        // Process this request
        dbif = appenginesqlite.DbifAppEngineSqlite.getInstance();
        rpcResult = dbif.processRequest(jsonInput);

        // Generate the response.
        response.setContentType("application/json");
        out = response.getWriter();
        out.println(rpcResult);
        break;


      case "getdata":            // Request for a base 64 encoded URL

        /* 
         * The call here looked like this to begin with:
         * 
         * getdata=appId:urlField
         * 
         * Above, we split this by the equal sign to determine which call was
         * made, and now we split the second part of that by colons, to get
         * our parameters.
         */
        argSplit = querySplit[1].split(":");

        // Call the (static) decoder method, which takes an appId and a field
        decodeResult = 
          aiagallery.dbif.Decoder64.getDecodedURL(argSplit[0], argSplit[1]);

        if (decodeResult === null)
        {
          response.sendError(404, "No data found. Field may be empty, or App " +
                                  "may not exist.");
        }
        else
        { 
          // decodeResult is a map with a "mime" member and a "content" member.
          // Just pass them where they're needed and we're done.
          response.setContentType(decodeResult.mime);
          response.setHeader(
            "Content-disposition",
            "attachment; filename=\"" + decodeResult.name + "\"");
          out = response.getWriter();
          out.print(decodeResult.content);
        }
        break;
      }
    },


    /**
     * Given a Javascript array of objects return a Java array of objects of
     * the given type.  This is used to create Java arrays to send to the
     * Jetty API.
     *
     * @param type {Packages.*}
     *   The Java class of the array being created
     *
     * @param objects {Array}
     *   The JavaScript array being converted to a Java array
     *
     * @return {java.lang.Array}
     *   The Java array which is a copy of provided the JavaScript array
     */
    toJArray : function(type, objects) 
    {
      var jarray = java.lang.reflect.Array.newInstance(type, objects.length);

      for (var i = 0; i < objects.length; ++i) 
      {
        jarray[i] = objects[i];
      }

     return jarray;
    }
  },

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      var             _this = this;
      var             server;
      var             handlers;
      var             rpcHandler;
      var             resourceHandler;

      if (qx.core.Environment.get("runtime.name") == "rhino") 
      {
        qx.log.Logger.register(qx.log.appender.RhinoConsole);
      }
      else if (qx.core.Environment.get("runtime.name") == "node.js") 
      {
        qx.log.Logger.register(qx.log.appender.NodeConsole);
      }

      if (window.arguments) 
      {
        try 
        {
          this._argumentsToSettings(window.arguments);
        }
        catch(ex) 
        {
          this.error(ex.toString());
          return;
        }
      }

      // Create a Jetty server instance
      server = new Packages.org.eclipse.jetty.server.Server(3000);

      //
      // Static File Handler
      //

      // Create a resource handler to deal with static file requests
      resourceHandler = 
        new Packages.org.eclipse.jetty.server.handler.ResourceHandler();

      // If a request on the root path is received, serve a default file.
      resourceHandler.setWelcomeFiles(
        appenginesqlite.Application.toJArray(java.lang.String,
                                             [ "index.html" ]));

      // Serve files from our build directory (for now)
      resourceHandler.setResourceBase("./build");

      //
      // Remote Procedure Call handler
      //

      // Instantiate a new handler to handle RPCs
      rpcHandler = new JavaAdapter(
        Packages.org.eclipse.jetty.server.handler.AbstractHandler, 
        {
          handle: function(target, baseRequest, request, response) 
          {
            var             f;
            var             bIsRpc;

            // Is this a remote procedure call request?
            bIsRpc =
              target == "/rpc" ||
              (target.length >= 5 &&
               (target.substring(0, 5) == "/rpc?" &&
                target.substring(0, 5) == "/rpc/"));

            if (! bIsRpc)
            {
              // Nope. Let someone else handle it.
              return;
            }

            // Determine the request method. We currently support POST and GET.
            // Bind the functions to our application instance to allow them to
            // easily generate log messages.
            if (request.getMethod().equals("POST"))
            {
              f = qx.lang.Function.bind(appenginesqlite.Application.doPost,
                                        _this);
            }
            else if (request.getMethod().equals("GET"))
            {
              f = qx.lang.Function.bind(appenginesqlite.Application.doGet,
                                        _this);
            }
            else
            {
              print("Unexpected RPC data (not POST or GET)");
              return;
            }

            // Call the appropriate function
            f(request, response);

            // We've handled this request
            baseRequest.setHandled(true);
          }
        });

      //
      // We have multiple handlers, so we need a handler collection
      //

      // Instantiate a handler collection
      handlers = 
        new Packages.org.eclipse.jetty.server.handler.HandlerCollection();

      // Add the two handlers. The RPC handler comes first. If it can't
      // handle the request, then the resource handler will be called.
      handlers.setHandlers(appenginesqlite.Application.toJArray(
                             Packages.org.eclipse.jetty.server.Handler,
                             [ rpcHandler, resourceHandler ]));

      // Now we can set the handlers for our server
      server.setHandler(handlers);

      // Initialize the database and remote procedure call server
      appenginesqlite.Application.dbif = 
        appenginesqlite.DbifAppEngineSqlite.getInstance();

      // Start up the server. We're ready to go!
      server.start();
      server.join();
    },

    /**
     * Converts the value of the "settings" command line option to qx settings.
     *
     * @param args {String[]} Rhino arguments object
     */
    _argumentsToSettings : function(args)
    {
      var opts;

      for (var i=0, l=args.length; i<l; i++) 
      {
        if (args[i].indexOf("settings=") == 0) 
        {
          opts = args[i].substr(9);
          break;
        }
        else if (args[i].indexOf("'settings=") == 0) 
        {
          opts = /'settings\=(.*?)'/.exec(args[i])[1];
          break;
        }
      }

      if (opts) 
      {
        opts = opts.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
        try 
        {
          opts = qx.lang.Json.parse(opts);
        } 
        catch(ex)
        {
          var msg =
            ex.toString() + 
            "\nMake sure none of the settings configured" +
            " in simulation-run/environment contain paths with spaces!";
          throw new Error(msg);
        }
        
        for (var prop in opts) 
        {
          var value = opts[prop];
          if (typeof value == "string") 
          {
            value = value.replace(/\$/g, " ");
          }
          try 
          {
            qx.core.Environment.add(prop, value);
          }
          catch(ex) 
          {
            this.error("Unable to define command-line setting " + prop +
                       ": " + ex);
          }
        }
      }
    }
  }
});
