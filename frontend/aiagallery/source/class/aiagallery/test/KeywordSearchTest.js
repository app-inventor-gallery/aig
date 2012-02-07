/**
 * Copyright (c) 2011 Reed Spool
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
      
      dbifSim.setWhoAmI(
        {
          id : 1002,
          email : "billy@thekid.edu",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          displayName :  "Billy The Kid"
        });

      // Ensure the database is properly initialized
      liberated.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);

      // Handcrafting a bunch of Apps with various words in their text fields
      var myApps = 
        [
          {
            owner       : 1002,
            description : "This one's beautiful",
            title       : "The Shooting Game",
            tags        : ["shooter", "shooting", "game", "Games"],
            source      : "somerandomstring",
            image1      : "data://xxx"
          },
          
          {
            source      : "somerandomstring",
            owner       : 1002,
            description : "This one's sexy and beautiful",
            title       : "Your Mother Jokes",
            tags        : ["funny", "Development"],
            image1      : "data://xxx"
          },

          {
            source      : "somerandomstring",
            owner       : 1002,
            description : "This one's sexy",
            title       : "Laughapalooza",
            tags        : ["Educational"],
            image1      : "data://xxx"
          },
            
          {
            source      : "somerandomstring",
            owner       : 1002,
            description : "This one's not interesting in any way",
            title       : "Microsoft Windows for Android",
            tags        : ["Development", "broken"],
            image1      : "data://xxx"
          }
        ];

      myApps.forEach(function(obj)
                     {
                         dbifSim.addOrEditApp(null, obj, error);
                     });

      // Test with one word present in title of 1 app
      queryResults = dbifSim.keywordSearch("mother", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(1, queryResults.length,
                        "Expected 1 result; got " + queryResults.length);

      // Test with one word present in 2 apps
      queryResults = dbifSim.keywordSearch("beautiful", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(2, queryResults.length,
                        "Expected 2 results; got " + queryResults.length);

      // Test with 2 words present in 1 app, each present in 4 total
      queryResults = dbifSim.keywordSearch("this not", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(0, queryResults.length,
                        "Both stop words so expect 0 results; got" +
                        queryResults.length);

      // Test with 2 words present in 1 app, each present in 3 total
      queryResults = dbifSim.keywordSearch("beautiful sexy", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(3, queryResults.length,
                        "Expected 3 results; got " + queryResults.length);
    
      var firstResultDescription = queryResults[0]["description"];
      var descSplit = firstResultDescription.split(" ");
      
      // First result should contain both keywords
      this.assert(qx.lang.Array.contains(descSplit, "beautiful") &&
                  qx.lang.Array.contains(descSplit, "sexy"),
                  "Results ordered correctly for 2 keyword search");
      
      //Test with 1 word not present in any app
      queryResults = dbifSim.keywordSearch("meowmeowmeowcatshisss",
                                           null,
                                           null,
                                           error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(0, queryResults.length,
                        "Expected 0 results; got " + queryResults.length);
    }
  }
});  

