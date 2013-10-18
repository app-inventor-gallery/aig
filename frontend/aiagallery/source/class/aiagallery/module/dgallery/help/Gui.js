/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Vincent Zhang
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the help page
 * 
 */
qx.Class.define("aiagallery.module.dgallery.help.Gui",
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
	  o = new qx.ui.basic.Label("Need help? Check out the forum!");
	  o.set({ 
		  font : fontHeader,
		  paddingTop : 10,
		  paddingBottom : 20
	      });
	  canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("Gallery's <a href='http://groups.google.com/group/app-inventor-gallery/topics' target='_blank'>support forum</a> is a great place to get your opinions heard. You are welcome to post feedback or ask for help in our community at any given time.<br><br><hr>");
	  o.set({ 
		  rich  : true,
		  font  : font,
		  paddingBottom : 10
		  });		  
      canvas.add(o);

      // Add text header
	  o = new qx.ui.basic.Label("Publishing your app to the App Inventor Gallery (Also on <a href='http://www.appinventor.org/galleryHowTo'>AppInventor.org</a>)");
	  o.set({ 
		  rich : true,
		  font : fontHeader,
		  paddingTop : 20,
		  paddingBottom : 20
	      });
	  canvas.add(o);

      // Add video embed code
	  o = new qx.ui.embed.Html("");
	  o.setHtml('<object width="420" height="315"><param name="movie" value="//www.youtube.com/v/4cs1zFFYRYE?hl=en_US&amp;version=3"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="//www.youtube.com/v/4cs1zFFYRYE?hl=en_US&amp;version=3" type="application/x-shockwave-flash" width="420" height="315" allowscriptaccess="always" allowfullscreen="true"></embed></object>');
	  o.set({
		  });		  
	  canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("The MIT App Inventor Gallery is the main site for sharing your App Inventor apps and checking out the apps and blocks of others. It is like Google Play, except open source-- all of the uploaded apps have source code (blocks) that you can study and remix! Think of it as one of the greatest open source learning studios ever created.");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("If you're a teacher or run an after-school program, I encourage you to have your students publish their creative projects there. It is amazing how the motivation level rises when one knows that friends and the general public can view the final product of one's work. When my students present their apps, one of the first things they'll say (or be asked) is how many downloads it has on the gallery.");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("It is also a great place to find apps for remixing. Why start from scratch when you can riff off previous work. Just be sure to give credit (attribution) in the description of your remixed app when you submit it to the gallery.");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("You can use your gmail account to login-- just click the link in the upper right hand corner. To publish your app, click on My Apps and then Add New Application.You'll see the following form:");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);
	  
	  // Add image for submit app form
	  o = new qx.ui.basic.Image("http://www.appinventor.org/assets/img/galleryAddApp.png");
	  o.set({ 
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
	  canvas.add(o);
	  
      // Add text
      o = new qx.ui.basic.Label("<ul><li><b>Title.</b> Just type it in.</li><br/><li><b>Description.</b> Also just type it in.</li><br/><li><b>Category.</b> Pick one from the list.</li><br/><li><b>Source file.</b> This a ZIP archive containing all of the blocks and media in your app. Download it from App Inventor by opening the project manager and choosing More Actions | Download Source.</li><br/><li><b>Image or icon.</b> This will be displayed in the Gallery as the image for your app. Typically this will be a screenshot of your app, or the app's icon.</li><br/><li><b>Tag.</b> Tags can be anything to help people find your app. If you're part of a class or group, you can agree to give all your apps the same tag so you can easily find all of them.</li>");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("After you enter all the fields, click Save Application to submit your app. Then click on the home page and you should see your app in the listing of \"Newest Apps\". Click on your app, and you'll see the public app page for your app.");
	  o.set({ 
		  rich  : true,
	      font  : font,
		  paddingTop : 8,
		  paddingBottom : 8
		  });		  
      canvas.add(o);

      // Add text
      o = new qx.ui.basic.Label("Later, you can edit your app description and upload a new version for it (zip file) by going back to the My Apps page.");
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
