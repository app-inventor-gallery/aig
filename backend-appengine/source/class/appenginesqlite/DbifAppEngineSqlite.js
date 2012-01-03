/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("appenginesqlite.DbifAppEngineSqlite",
{
  extend  : liberated.jetty.SqliteDbif,
  type    : "singleton",

  include : 
  [
    aiagallery.dbif.MDbifCommon
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Prepare for remote procedure calls to qooxdoo.test.*
    this.__rpc = new liberated.jetty.Rpc([ "aiagallery", "features" ], "/rpc");
  },
  
  members :
  {
    /** The remote procedure call instance */
    __rpc : null,

    /**
     * Register a service name and function.
     *
     * @param serviceName {String}
     *   The name of this service within the <[rpcKey]> namespace.
     *
     * @param fService {Function}
     *   The function which implements the given service name.
     * 
     * @param paramNames {Array}
     *   The names of the formal parameters, in order.
     */
    registerService : function(serviceName, fService, paramNames)
    {
      // Register with the RPC provider
      this.__rpc.registerService(serviceName, fService, this, paramNames);
    },

    /**
     * Process an incoming request which is presumably a JSON-RPC request.
     * 
     * @param jsonData {String}
     *   The data provide in a POST request
     * 
     * @return {String}
     *   Upon success, the JSON-encoded result of the RPC request is returned.
     *   Otherwise, null is returned.
     */
    processRequest : function(jsonData)
    {
      return this.__rpc.processRequest(jsonData);
    }
  },

  defer : function()
  {
    // Register the selected database interface entry points
    liberated.dbif.Entity.registerDatabaseProvider(
      liberated.jetty.SqliteDbif.query,
      liberated.jetty.SqliteDbif.put,
      liberated.jetty.SqliteDbif.remove,
      liberated.jetty.SqliteDbif.getBlob,
      liberated.jetty.SqliteDbif.putBlob,
      liberated.jetty.SqliteDbif.removeBlob,
      liberated.jetty.SqliteDbif.beginTransaction,
      { 
        dbif        : "appenginesqlite"
      });
    
    // Initialize the database
    liberated.jetty.SqliteDbif.init("/tmp/aiagallery.db");
  }
});
