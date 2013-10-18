/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Vincent Zhang
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the activities page
 * 
 */
qx.Class.define("aiagallery.module.dgallery.activities.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
      var             outerCanvas = module.canvas;
	  var			  canvas;

      // Put whole page in a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      // Layout to hold intro and canvas
      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox());
	  canvas.set({ paddingLeft : 20, paddingRight : 20 });
      scrollContainer.add(canvas, { flex : 1 });  
      
      // Create a large bold font for headers
      var fontHeader = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      fontHeader.setSize(18);
      // Create a medium font for content
      var font = new qx.bom.Font(14, ["Helvetica", "Arial"]);

      // Add text header
	  o = new qx.ui.basic.Label("UnX platform promotional header here - Oct 18th 2013");
	  o.set({ 
		  rich  : true,
		  font : fontHeader,
		  paddingTop : 10,
		  paddingBottom : 20
	      });
	  canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("We can put some text / link / information here to inform our community about the upcoming UnX event and encourage them to publish more apps.<br><br><hr>");
	  o.set({ 
		  rich  : true,
		  font  : font,
		  paddingBottom : 10
		  });		  
      canvas.add(o);

      // Add text header
	  o = new qx.ui.basic.Label("2012 MIT App Inventor App Contest - Dec 23rd, 2012");
	  o.set({ 
		  rich : true,
		  font : fontHeader,
		  paddingTop : 10,
		  paddingBottom : 10
	      });
	  canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("The 2012 MIT App Inventor App Contest had 125 submissions in four categories: K-8, High School, College/University, and Open. Google Nexus 7 Tablets are being awarded to the 1st place winners, with App Inventor books given for second place. Participants included students as young as third grade, college students, hobbyists, professional developers, and even some self-described \"retired old ladies\"! The following are the prize winners and a few of the other notable apps. <a href='#'>Please click here to read the full report.</a>");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);
	  

	  /* End of buildGui() */
    },

    
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },

    /** Add a link to the user profile and set the cursor to a pointer*/
    addUserLink : function(label)
    {
      label.setCursor("pointer");

      label.addListener(
        "click",
        function(e)
        {
          var query;
          var displayName;

          // Prevent the default 'click' behavior
          //e.preventDefault();
          //e.stop();

          // Remove "by" from displayName
          //displayName = e.getTarget().getValue().substring(8); 
          displayName = e.getTarget().getUserData("username"); 

          // Launch user page module
          aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
            displayName);
        }); 
    }
  }
});
