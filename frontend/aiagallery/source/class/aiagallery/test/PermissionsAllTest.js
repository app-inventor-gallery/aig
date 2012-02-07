/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.PermissionsAllTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __db : {
      
      visitors:
      {
        2000 :
        {
          id           : 2000,
          displayName  : "mynewdisplayname",
          email        : "jarjar@binks.org",
          permissions  : ["getAppList", "addOrEditApp", "deleteApp", "getAppListAll",
                          "appQuery", "getAppInfo", "addComment", "deleteComment",
                          "getComments", "mobileRequest", "getCategoryTags", 
                          "addOrEditVisitor", "deleteVisitor", "getVisitorList",
                         "editProfile", "whoAmI"],
          status       : 2
        }
      },
      "permissiongroup" :
      {
        "ALL" :
        {
          "name" : "ALL",
          "permissions" : ["addOrEditApp", "deleteApp", 
                         "getAppListAll", "addComment", "deleteComment", 
                         "flagIt", "addOrEditVisitor", "deleteVisitor", 
                         "getVisitorList", "likesPlusOne", 
                         "getDatabaseEntities"],
          "description" : "All permissions"
        },
        "SOME" :
        {
          "name" : "SOME",
          "permissions" : ["addOrEditApp", "deleteApp", 
                         "getAppListAll", "addComment", "deleteComment", 
                         "flagIt", "likesPlusOne"],
          "description" : "Some permissions"
        },
         "ONE" :
        {
          "name" : "SOME",
          "permissions" : ["addOrEditApp"],
          "description" : "Some permissions"
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
    
    // This string is to be appended to assertions, to be specific about test
    // conditions
    permissionLevel : "all permissions",
    
    setUp: function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.      
      this.dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      this.dbifSim.setWhoAmI(
        {
          id          : 2000,
          email       : "jarjar@binks.org",
          isAdmin     : false,
          logoutUrl   : "undefined",
          permissions : this.dbifSim.getGroupPermissions("ALL").permissions,
          displayName : "nameSetWhoAmI"
        });
      
      // Use a personalized database
      liberated.sim.Dbif.setDb(this.__db);
      
      this.currentPermissionsStr = "no permissions";
    },

    tearDown: function() 
    {
      // Reset the db for other tests
      liberated.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    },
    
    // Unit tests for Individual Permissions
    
    "test 01: attempt to getAppList" : function()
    {
      // Must be logged in
      this.assert(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getAppList"),
        "getAppList with " + this.permissionLevel);
    },
    
    "test 02: attempt to addOrEditApp" : function()
    {
      // Must be logged in
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.addOrEditApp"),
        "addOrEditApp with " + this.permissionLevel);
    },
    
    "test 03: attempt to deleteApp" : function()
    {
      // Check Permissions
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.deleteApp"), 
        "deleteApp with " + this.permissionLevel);
    },
    
    "test 04: attempt to getAppListAll" : function()
    {
      // FIXME: TEMPORARILY ANON, SHOULD BE CHECK PERMISSIONS
      this.assertTrue(
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
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.addComment"), 
        "addComment with " + this.permissionLevel);
    },
    
    "test 08: attempt to deleteComment" : function()
    {
      // Check Permissions
      this.assertTrue(
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
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.addOrEditVisitor"), 
        "addOrEditVisitor with " + this.permissionLevel);
    },

    "test 13: attempt to deleteVisitor" : function()
    {
      // Check permissions
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.deleteVisitor"),
        "deleteVisitor with " + this.permissionLevel);
    },
    
    "test 14: attempt to getVisitorList" : function()
    {
      // Check permissions
      this.assertTrue(
        aiagallery.dbif.MDbifCommon.authenticate(
          "aiagallery.features.getVisitorList"), 
        "getVisitorList with " + this.permissionLevel);
    },

    "test 15: attempt to editProfile" : function()
    {
      // Must be logged in
      this.assertTrue(
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
    }, 
    
    // Unit Tests for Group Permissions
    
    "test 17: succeed permission test with addOrEditApp (PGroups)" : function()
    {
      //Start with fresh DB
      var myDB = qx.lang.Object.clone(this.__db, true);
        
      // Use a personalized database
      liberated.sim.Dbif.setDb(myDB);
        
      //Get instance
      myDB = aiagallery.dbif.DbifSim.getInstance();
       
      // Create new objVisitor
      var visitor = new aiagallery.dbif.ObjVisitors("paul@thetester.com");
    
      // Provide the new data
      visitor.setData(
        {
          id          : 2001,
          email       : "paul@thetester.com",
          displayName : "paulissocool",
          permissions :  [],
          permissionGroups : ["ALL"],
          status : 2
        });
      
       // Write the new data
       visitor.put();
    
       myDB.setWhoAmI(
       {
         id               : 2001,
         email            : "paul@thetester.com",
         isAdmin          : false,
         logoutUrl        : "undefined",
         permissions      : [],
         permissionGroups : ["ALL"],
         displayName      : "pGroupTests"
       });
    
      var myObjData = 
        new aiagallery.dbif.ObjVisitors("paul@thetester.com").getData();
    
      this.assertTrue(aiagallery.dbif.MDbifCommon._deepPermissionCheck(
        "addOrEditApp"), "with permission group: " + 
          myObjData.permissionGroups);
    },
    
    "test 18: fail permission test with addOrEditApp (PGroups)" : function()
    {
    
      //Start with fresh DB
      var myDB = qx.lang.Object.clone(this.__db, true);
        
      // Use a personalized database
      liberated.sim.Dbif.setDb(myDB);
        
      //Get instance
      myDB = aiagallery.dbif.DbifSim.getInstance();
       
      // Create new objVisitor
      var visitor = new aiagallery.dbif.ObjVisitors("paul@thetester.com");
    
      // Provide the new data
      visitor.setData(
        {
          id          : 2001,
          email       : "paul@thetester.com",
          displayName : "paulissocool",
          permissions :  [],
          permissionGroups : [],
          status : 2
        });
      
       // Write the new data
       visitor.put();
    
       myDB.setWhoAmI(
       {
         id               : 2001,
         email            : "paul@thetester.com",
         isAdmin          : false,
         logoutUrl        : "undefined",
         permissions      : [],
         permissionGroups : [],
         displayName      : "pGroupTests"
       });
        
      var myObjData = 
        new aiagallery.dbif.ObjVisitors("paul@thetester.com").getData();
    
      this.assertFalse(aiagallery.dbif.MDbifCommon._deepPermissionCheck(
        "addOrEditApp"), "with permission group: " + 
          myObjData.permissionGroups);
    },
    
    "test 19: User has two pGroups, second one has valid permission (PGroups)" 
      : function()
    {
    
      //Start with fresh DB
      var myDB = qx.lang.Object.clone(this.__db, true);
        
      // Use a personalized database
      liberated.sim.Dbif.setDb(myDB);
        
      //Get instance
      myDB = aiagallery.dbif.DbifSim.getInstance();
       
      // Create new objVisitor
      var visitor = new aiagallery.dbif.ObjVisitors("paul@thetester.com");
    
      // Provide the new data
      visitor.setData(
        {
          id          : 2001,
          email       : "paul@thetester.com",
          displayName : "paulissocool",
          permissions :  [],
          permissionGroups : ["SOME", "ALL"],
          status : 2
        });
      
       // Write the new data
       visitor.put();
    
       myDB.setWhoAmI(
       {
         id               : 2001,
         email            : "paul@thetester.com",
         isAdmin          : false,
         logoutUrl        : "undefined",
         permissions      : [],
         permissionGroups : ["SOME", "ALL"],
         displayName      : "pGroupTests"
       });
        
      var myObjData = 
        new aiagallery.dbif.ObjVisitors("paul@thetester.com").getData();
    
      this.assertTrue(aiagallery.dbif.MDbifCommon._deepPermissionCheck(
        "getDatabaseEntities"), "with permission group: " + 
          myObjData.permissionGroups);
    },
    
    "test 20: User has two pGroups, neither has valid permissions (PGroups)" 
      : function()
    {
    
      //Start with fresh DB
      var myDB = qx.lang.Object.clone(this.__db, true);
        
      // Use a personalized database
      liberated.sim.Dbif.setDb(myDB);
        
      //Get instance
      myDB = aiagallery.dbif.DbifSim.getInstance();
       
      // Create new objVisitor
      var visitor = new aiagallery.dbif.ObjVisitors("paul@thetester.com");
    
      // Provide the new data
      visitor.setData(
        {
          id          : "paul@thetester.com",
          displayName : "paulissocool",
          permissions :  [],
          permissionGroups : ["SOME", "ONE"],
          status : 2
        });
      
       // Write the new data
       visitor.put();
    
       myDB.setWhoAmI(
       {
         id               : 2001,
         email            : "paul@thetester.com",
         isAdmin          : false,
         logoutUrl        : "undefined",
         permissions      : [],
         permissionGroups : ["SOME", "ONE"],
         displayName      :  "pGroupTests"
        });
        
      var myObjData = 
        new aiagallery.dbif.ObjVisitors("paul@thetester.com").getData();
    
      this.assertFalse(aiagallery.dbif.MDbifCommon._deepPermissionCheck(
        "getDatabaseEntities"), "with permission group: " + 
          myObjData.permissionGroups);
    },
     "test 21: User has a pgroup, but does not have valid permission (PGroups)" 
      : function()
    {
    
      //Start with fresh DB
      var myDB = qx.lang.Object.clone(this.__db, true);
        
      // Use a personalized database
      liberated.sim.Dbif.setDb(myDB);
        
      //Get instance
      myDB = aiagallery.dbif.DbifSim.getInstance();
       
      // Create new objVisitor
      var visitor = new aiagallery.dbif.ObjVisitors("paul@thetester.com");
    
      // Provide the new data
      visitor.setData(
        {
          id          : 2001,
          email       : "paul@thetester.com",
          displayName : "paulissocool",
          permissions :  [],
          permissionGroups : ["SOME"],
          status : 2
        });
      
       // Write the new data
       visitor.put();
    
       myDB.setWhoAmI(
       {
         id               : 2001,
         email            : "paul@thetester.com",
         isAdmin          : false,
         logoutUrl        : "undefined",
         permissions      : [],
         permissionGroups : ["SOME"],
         displayName      : "pGroupTests"
        });
        
      var myObjData = 
        new aiagallery.dbif.ObjVisitors("paul@thetester.com").getData();
    
      this.assertFalse(aiagallery.dbif.MDbifCommon._deepPermissionCheck(
        "addOrEditVisitor"), "with permission group: " + 
          myObjData.permissionGroups);
    }
  }
});
