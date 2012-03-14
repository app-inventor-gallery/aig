/**
 * Copyright (c) 2011 Reed Spool
 * Copyright (c) 2012 Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.KeywordSearchTest",
{
  extend : qx.dev.unit.TestCase,
  
  members :
  {
    "test 01: Keyword Search" : function()
    {
      var queryResults;
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      // We need an error object
      var error = new liberated.rpc.error.Error("2.0");
      
      // This is used for the malformed string tests below
      var badSearchData = 
        "Th.z st!@#$%wef^&*we(() #$% MY!!!!! cala#ity is suppo$ed " +
        "to be malformed";

      dbifSim.setWhoAmI(
        {
          id : "1002",
          email : "billy@thekid.edu",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          displayName :  "Billy The Kid"
        });

      // Ensure the database is properly initialized
      liberated.sim.Dbif.setDb(
        qx.lang.Object.clone(aiagallery.dbif.MSimData.Db, true));

      // Handcrafting a bunch of Apps with various words in their text fields
      var myApps = 
        [
          {
            owner       : "1002",
            description : "This one's beautiful",
            title       : "The Shooting Game",
            tags        : ["shooter", "shooting", "game", "Games"],
            source      : "somerandomstring",
            image1      : "data://xxx"
          },
          
          {
            source      : "somerandomstring",
            owner       : "1002",
            description : "This one's sexy and beautiful",
            title       : "Your Mother Jokes",
            tags        : ["funny", "Business"],
            image1      : "data://xxx"
          },

          {
            source      : "somerandomstring",
            owner       : "1002",
            description : "This one's sexy",
            title       : "Laughapalooza",
            tags        : ["Business"],
            image1      : "data://xxx"
          },
            
          {
            source      : "somerandomstring",
            owner       : "1002",
            description : "This one's not interesting in any way",
            title       : "Microsoft Windows for Android",
            tags        : ["Business", "broken"],
            image1      : "data://xxx"
          },

          {
            source      : "somerandomstring",
            owner       : "1002",
            description : 
              "Th.z st!@#$%wef^&*we(() #$% MY!!!!! cala#ity is suppo$ed " +
              "to be malformed",
            title       : "DROP TABLEz LOLZ",
            tags        : ["Games", "broken"],
            image1      : "data://xxx"
          }
        ];

      myApps.forEach(
        function(obj)
        {
          var ret = dbifSim.addOrEditApp(null, obj, error);
          this.assertNotEquals(error, ret,
                               "addOrEditApp failed: " + error.stringify());
        },
        this);

      var i = 1;

      // Test with one word present in title of 1 app
      queryResults = dbifSim.keywordSearch(["mother"], null, false, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(1, queryResults.length, "#" + i++ + " " +
                        "Expected 1 result; got " + queryResults.length);

      // Test with one word present in 2 apps
      queryResults = dbifSim.keywordSearch(["beautiful"], null, false, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error, "#" + i++ + " " +
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(2, queryResults.length, "#" + i++ + " " +
                        "Expected 2 results; got " + queryResults.length);

      // Test with 2 words present in 1 app, each present in 4 total
      queryResults = dbifSim.keywordSearch(["this", "not"], null, false, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error, "#" + i++ + " " +
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(0, queryResults.length, "#" + i++ + " " +
                        "Both stop words so expect 0 results; got" +
                        queryResults.length);

      // Test with 2 words present in 1 app, each present in 3 total
      queryResults = 
        dbifSim.keywordSearch(["beautiful", "sexy"], null, true, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error, "#" + i++ + " " +
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(3, queryResults.length, "#" + i++ + " " +
                        "Expected 3 results; got " + queryResults.length);
    
      var firstResultDescription = queryResults[0]["description"];
      var descSplit = firstResultDescription.split(" ");
      
      // First result should contain both keywords
      this.assert(qx.lang.Array.contains(descSplit, "beautiful") &&
                  qx.lang.Array.contains(descSplit, "sexy"), "#" + i++ + " " +
                  "Results ordered correctly for 2 keyword search");
      
      //Test with 1 word not present in any app
      queryResults = 
        dbifSim.keywordSearch(["meowmeowmeowcatshisss"], null, false, error);

      // ensure that an error was not returned
      this.assert(queryResults !== error, "#" + i++ + " " +
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(0, queryResults.length, "#" + i++ + " " +
                        "Expected 0 results; got " + queryResults.length);

      // Updating an App to see that old information is disposed
      var appUpdate =
        {
          source      : "somerandomstring",
          owner       : "1002",
          description : "This one's sexy and beautiful",
          title       : "Your Father Jokes",
          tags        : ["funny", "Business"],
          image1      : "data://xxx"
        };
      
      // Test to make sure word from old version of App exists
      queryResults = dbifSim.keywordSearch(["mother"], null, true, error);

      this.assertEquals(queryResults.length, 1, "#" + i++ + " " +
               "Things not right before edit" + error.stringify());

      // Save the UID for later
      var uidToEdit = queryResults[0].uid;

      // Make sure the thing updates fine, first
      var editingApp = dbifSim.addOrEditApp(uidToEdit, appUpdate, error);      
      this.assertNotEquals(error, editingApp, "#" + i++ + " " +
               "Editing App failed: " + error.stringify());

      // Test with one word which is no longer present
      queryResults = dbifSim.keywordSearch(["mother"], null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error, "#" + i++ + " " +
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(0, queryResults.length, "#" + i++ + " " +
                        "Expected 0 results; got " + queryResults.length);
      
      // Looking for bad search data
      var badDataArr = badSearchData.split(" ");
      queryResults = [];

      // Test that bad data gets zero results
      badDataArr.forEach(function(str)
      {
        queryResults = queryResults.concat(dbifSim.keywordSearch([str],
                                     null,
                                     null,
                                     error));
    
        this.assert(queryResults[0] !== error, "#" + i++ + " " +
            "Error: " + error.getCode() + 
            ": " + error.getMessage());
    
        // It's bad if the search word is not valid but there are results
        if (str.match(/[a-z0-9]{2,}/gi) == null)
        {
          this.assert(queryResults.length == 0, 
                      "Bad search data getting through!!: " + str + ", " +
                      queryResults[0]);
        }
      },
      this);

    },
    
        
    "test 02: ObjSearch" : function() 
    {
      // Counter for error number 
      var i = 0;
    
      var queryResults;
     
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      // We need an error object
      var error = new liberated.rpc.error.Error("2.0");
      
      // This is used for the malformed string tests below
      var badSearchData = 
        "Th.z st!@#$%wef^&*we(() #$% MY!!!!! " +
        "cala#ity is suppo$ed to be malformed";

      dbifSim.setWhoAmI(
        {
          id : "1002",
          email : "billy@thekid.edu",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          displayName :  "Billy The Kid"
        });

      // Ensure the database is properly initialized
      liberated.sim.Dbif.setDb(
        qx.lang.Object.clone(aiagallery.dbif.MSimData.Db, true));

      // Our Test App
      var myApps = 
        [
          {
            owner       : "1002",
            description : "The word contains a+b but neither 'a' nor 'b' will"
                          + "be entered. If I quote a word like \"this-one\" "
                          + "then maybe it should get entered as such" 
                          + "(but currently doesn't). We have no escapes. "
                          + "What about 12/25/2012 as a date? or 12-25-2012?",
            title       : "WTF is this?",
            tags        : ["entered", "junk", "not", "Business"],
            source      : "SOURCE",
            image1      : "data://xxx"
          }
        ];
       
      // Make sure the app was added correctly       
      myApps.forEach(
        function(obj)
        {
          var ret = dbifSim.addOrEditApp(null, obj, error);
          this.assertNotEquals(error, ret,
                               "addOrEditApp failed: " + error.stringify());
        },
        this);
        
      // Test Fields      
      // Test Title
      queryResults = dbifSim.keywordSearch(["WTF"], ["title"], null, error);
        
      this.assertNotEquals(
        queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      queryResults = dbifSim.keywordSearch(["is"], ["title"], null, error);
        
      this.assertEquals(
        queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
          
      queryResults = dbifSim.keywordSearch(["this?"], ["title"], null, error);
        
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      // Test Description
      queryResults = 
        dbifSim.keywordSearch(["entered"], ["description"], null, error);
        
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
          
      queryResults = 
        dbifSim.keywordSearch(["should"], ["description"], null, error);
        
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      // Test Tags        
      queryResults = dbifSim.keywordSearch(["junk"], ["tags"], null, error);
        
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
          
      queryResults = dbifSim.keywordSearch(["not"], ["tags"], null, error);
        
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
          
      queryResults = dbifSim.keywordSearch(["Business"], ["tags"], null, error);
        
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
                 
      // Test Combinations of Fields
      // Title + Description 
      queryResults = dbifSim.keywordSearch(["WTF"], 
        ["title", "description"], null, error);
      
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      queryResults = dbifSim.keywordSearch(["this"], 
        ["title", "description"], null, error);
      
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
      
      // Title + Tags
      queryResults = dbifSim.keywordSearch(["entered"], 
        ["title", "tags"], null, error);
      
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      queryResults = dbifSim.keywordSearch(["this"], 
        ["title", "tags"], null, error);
      
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
      
      // Description + Tags 
      queryResults = dbifSim.keywordSearch(["quote"], 
        ["tags", "description"], null, error);
      
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      queryResults = dbifSim.keywordSearch(["no"], 
        ["tags", "description"], null, error);
      
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
      
      // Title + Description + Tags 
      queryResults = dbifSim.keywordSearch(["WTF"], 
        ["title", "description", "tags"], null, error);
      
      this.assertNotEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
        
      queryResults = dbifSim.keywordSearch(["this"], 
        ["title", "description", "tags"], null, error);
      
      this.assertEquals(queryResults.length, 0, "#" + i++ + " " +
        "Word Detected in ObjSearch that should not be there" +
        error.stringify());
    }
  }
});  

