/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.PermissionsLoggedOutTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __db : {
      
      visitors:
      {
        "jarjar@binks.org" :
        {
          displayName  : "mynewdisplayname",
          id           : "jarjar@binks.org",
          permissions  : [],
          status       : 2
        }
        
      
      },
      tags:     {},
      search:   {},
      likes:    {},
      flags:    {},
      downloads:{},
      comments: {},
      apps:     {}
     
    },

    // Instantiate this to aiagalelry.dbif.DbifSim.getInstance()
    dbifSim : null,
    
    // This string is to be appended to assertions, to be specific about test conditions
    permissionLevel : "no permissions",
    
    setUp: function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.      
      this.dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      this.dbifSim.setWhoAmI(null);
      
      // Use a personalized database
      liberated.sim.Dbif.setDb(this.__db);
      
      this.currentPermissionsStr = "not logged in";
    },

    tearDown: function() 
    {
      // Reset the db for other tests
      liberated.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    },
    
    "test 01: attempt to getAppList" : function()
    {
      // Must be logged in
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getAppList"),
        "getAppList with " + this.permissionLevel);
    },
    
    "test 02: attempt to addOrEditApp" : function()
    {
      // Must be logged in
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.addOrEditApp"), 
        "addOrEditApp with " + this.permissionLevel);
    },
    
    "test 03: attempt to deleteApp" : function()
    {
      // Check Permissions
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.deleteApp"), 
        "deleteApp with " + this.permissionLevel);
    },
    
    "test 04: attempt to getAppListAll" : function()
    {
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getAppListAll"),
        "getAppListAll with " + this.permissionLevel);
    },
    
    "test 05: attempt to appQuery" : function()
    {
      // Anonymous
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.appQuery"), 
        "appQuery with " + this.permissionLevel);
    },

    "test 06: attempt to getAppInfo" : function()
    {
      // Anonymous
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getAppInfo"), 
        "getAppInfo with " + this.permissionLevel);
    },    
    
    "test 07: attempt to addComment" : function()
    {
      // Must be logged in
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.addComment"),
        "addComment with " + this.permissionLevel);
    },
    
    "test 08: attempt to deleteComment" : function()
    {
      // Check Permissions
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.deleteComment"), 
        "deleteComment with " + this.permissionLevel);
    },    

    "test 09: attempt to getComments" : function()
    {
      // Anonymous
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getComments"),
        "getComments with " + this.permissionLevel);
    },

    "test 10: attempt to mobileRequest" : function()
    {
      // Anonymous
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.mobileRequest"), 
        "mobileRequest with " + this.permissionLevel);
    },

    "test 11: attempt to getCategoryTags" : function()
    {
      // Anonymous
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getCategoryTags"), 
        "getCategoryTags with " + this.permissionLevel);
    },

    "test 12: attempt to addOrEditVisitor" : function()
    {
      // Check Permissions
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.addOrEditVisitor"), 
        "addOrEditVisitor with " + this.permissionLevel);
    },

    "test 13: attempt to deleteVisitor" : function()
    {
      // Check permissions
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.deleteVisitor"),
        "deleteVisitor with " + this.permissionLevel);
    },
    
    "test 14: attempt to getVisitorListAndPGroups" : function()
    {
      // Check permissions
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getVisitorListAndPGroups"), 
        "getVisitorListAndPGroups with " + this.permissionLevel);
    },

    "test 15: attempt to editProfile" : function()
    {
      // Must be logged in
      this.assertFalse(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.editProfile"), 
        "editProfile with " + this.permissionLevel);
    },

    "test 16: attempt to whoAmI" : function()
    {
      // Anonymous
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.whoAmI"), 
        "whoAmI with " + this.permissionLevel);
    } 
    
  }
});
