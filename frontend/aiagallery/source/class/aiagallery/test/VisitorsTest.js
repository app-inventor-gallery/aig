/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.VisitorsTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    // Instantiate this to aiagalelry.dbif.DbifSim.getInstance()
    dbifSim : null,
    

    setUp : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.      
      this.dbifSim = aiagallery.dbif.DbifSim.getInstance();

      // We need an error object
      this.error = new liberated.rpc.error.Error("2.0");
    },
    
    "test 01: Owner Id and Display Name exchange" : function()
    {
      var db =
      {
        visitors:
        {
          1001 :
          {
            id           : 1001,
            displayName  : "Joe Blow",
            email        : "joe@blow.com",
            permissions  : [],
            status       : aiagallery.dbif.Constants.Status.Active
          }
        },
        tags:     {},
        search:   {},
        likes:    {},
        flags:    {},
        downloads:{},
        comments: {},
        apps:     {}
      };

      // Use our test-specific database
      liberated.sim.Dbif.setDb(db);

      this.dbifSim.setWhoAmI(
        {
          id          : 1001,
          email       : "joe@blow.com",
          displayName : "Joe Blow",
          isAdmin     : false
        });
      
      var whoAmI = this.dbifSim.whoAmI();

      var requestDisplayName = aiagallery.dbif.MVisitors._getDisplayName(
        whoAmI.id,
        this.error);

      this.assertEquals(whoAmI.displayName, requestDisplayName, "display name");

      // Reset the db for other tests
      liberated.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    },

    
    "test 02: edit profile with displayName" : function()
    {
      // Log in as a known existing user
      this.dbifSim.setWhoAmI(
        {
          id          : 1001,
          email       : "joe@blow.com",
          displayName : "Joe Blow",
          isAdmin     : false
        });
      
      var result = this.dbifSim.editProfile(
        {
          "displayName" : "Cokehead"
        },
        this.error);
      
      // Retrieve the visitor object for Joe
      var joe = liberated.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                            this.dbifSim.getWhoAmI().id)[0];
      
      // Ensure that his display name is what it should be
      this.assertEquals("Cokehead", joe.displayName);
    }
  }
});
