/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.TagsTest",
{
  extend : aiagallery.test.AbstractRpcTestCase,

  members :
  {
    "test 01: RPC getCategoryTags" : function()
    {
      // There's no finite state machine in this environment. We keep the
      // parameter here for consistency with the working environment.
      var fsm = null;
      
      // Define the service, method, and parameters for the request
      var service = "aiagallery.features";
      var method = "getCategoryTags";
      var params = [];

      // This is the request we'll be making. (It's actually initiated below.)
      var rpc = this.callRpc(fsm, service, method, params);

      // When we see completion, compare the result
      rpc.addListener(
        "completed",
        function(e)
        {
          var response = e.getData();
          
          // Don't compare the id field. It changes on each request.
          delete response["id"]; 
          
          // Compare the rest of the result
          this.assertJsonEquals(
            {
              jsonrpc : "2.0",
              result  :
                [
                  "Business",
                  "Comics",
                  "Communication",
                  "Education",
                  "Entertainment",
                  "Finance",
                  "Games",
                  "Health & Fitness",
                  "Lifestyle",
                  "Media & Video",
                  "Music & Audio",
                  "News & Magazines",
                  "Photography",
                  "Productivity",
                  "Social",
                  "Sports",
                  "Transportation",
                  "Travel & Local",
                  "Weather"
                ]
            },
            response);
        },
        this);

      // Use generic error handling (just throw an error)
      this.setupErrorHandling();

      // Initiate the test!
      rpc.initiateTest();
    }
  }
});
