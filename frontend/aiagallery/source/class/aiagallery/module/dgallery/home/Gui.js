/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery home page
 */
qx.Class.define("aiagallery.module.dgallery.home.Gui",
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
      var             text;
      var             font;
      var             hbox;
      var             fsm = module.fsm;
      var             outerCanvas = module.canvas;
      var             scroller;
      
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });
      
      // Specify overall page layout
      var layout = new qx.ui.layout.VBox(30);
      var canvas = new qx.ui.container.Composite(layout);
      canvas.setPadding(20);
      scrollContainer.add(canvas, { flex : 1 });
      
/*
      // Create the top row (welcome and general info about AIA/Gallery)
      var welcomeLayout = new qx.ui.layout.HBox();
      welcomeLayout.setSpacing(20);
      var welcomeRow = new qx.ui.container.Composite(welcomeLayout);
      
      // Create an image (temporary one for now)
      var homeImage = new qx.ui.basic.Image("aiagallery/homepage2.png");
      welcomeRow.add(homeImage);

      // Create a welcome message      
      var message = new qx.ui.basic.Label();
      text = 
        [
          "<h2>Welcome to the App Inventor Community Gallery!</h2>",

	  "You can:",
	  "<ul>",
	  "<p><li>Browse and download App Inventor projects",

	  "<p><li>Contribute your App Inventor project to share it with others",

	  "<p><li>Discuss projects you like and encourage new ideas!",

	  "</ul>",

	  "<p>Get started by clicking on <b>Find Apps</b>, and go ahead ",
	  "and add your own projects by clicking on <b>My Apps</b>.",

	  "<p>Also, you can browse projects from your ",
	  "Android phone by using our companion ",
	  '<a href="http://www.appinventor.org/mobile-gallery" target="new">',
          "Mobile Community Gallery</a> ",
	  "app!"
        ].join("");
      message.set(
        {
          value         : text,
          rich          : true,
          minWidth      : 150,
          allowStretchX : true
        });
      welcomeRow.add(message, { flex : 1 });
      
      // Add the welcome row to the page
      canvas.add(welcomeRow);
      
      // Create a row of links to the other main tabs
      var linkRowLayout = new qx.ui.layout.HBox();
      linkRowLayout.setSpacing(20);
      var linkRow = new qx.ui.container.Composite(linkRowLayout);

      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
      
      // Add "Find Apps" box to link row
      text =
        [
	  "Use <b>Find Apps</b> to browse apps by tag, or search for them ",
          "using a variety of parameters."
        ].join("");
      var findApps = new aiagallery.module.dgallery.home.LinkBox(
        "<b>Find Apps</b><br>" + text,
        "aiagallery/findApps.png");
      findApps.addListener("click", fsm.eventListener, fsm);
      linkRow.add(findApps);
      fsm.addObject("Find Apps", findApps);
      
      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });

      // Add "My Apps" box to link row
      text =
        [
	 "Go to <b>My Apps</b> to review and change your uploaded projects."
        ].join("");
      var myApps = new aiagallery.module.dgallery.home.LinkBox(
        "<b>My Apps</b><br>" + text,
        "aiagallery/myStuff.png");
      myApps.addListener("click", fsm.eventListener, fsm);
      linkRow.add(myApps);
      fsm.addObject("My Apps", myApps);

      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });

      // Add the link row to the page
      canvas.add(linkRow);
*/
      
      // Create a large bold font
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(26);

      // Create an hbox for introductory text and the Featured Apps
      hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      
      // Put in some random text
      o = new qx.ui.basic.Label("Some text and/or images go here");
      hbox.add(o);
      
            // Featured Apps section
      var featuredAppsLayout = new qx.ui.layout.VBox();
      featuredAppsLayout.set(
        {
          alignX : "center"
        });
      var featuredApps = new qx.ui.container.Composite(featuredAppsLayout);

      // Featured Apps heading
      var featuredAppsHeader = new qx.ui.basic.Label();
      featuredAppsHeader.set(
        {
          value : "Featured Apps",
          font  : font,
          decorator : "home-page-header"
        });
      featuredApps.add(featuredAppsHeader);
      
      // Create the container in which the apps will be placed
      this.featuredAppsContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      this.featuredAppsContainer.set(
          {
            height : 420
          });
      featuredApps.add(this.featuredAppsContainer);
      
      // add Featured Apps section to the top hbox
      hbox.add(featuredApps);

      // Add the top hbox to the page
      canvas.add(hbox);

      // Newest Apps section
      var newestAppsLayout = new qx.ui.layout.VBox();
      newestAppsLayout.set(
        {
          alignX : "center"
        });
      var newestApps = new qx.ui.container.Composite(newestAppsLayout);

      // Newest Apps heading
      var newestAppsHeader = new qx.ui.basic.Label();
      newestAppsHeader.set(
        {
          value : "Newest Apps",
          font  : font,
          decorator : "home-page-header"
        });
      newestApps.add(newestAppsHeader);
      
      // slide bar of Newest Apps
      scroller = new qx.ui.container.Scroll();
      newestApps.add(scroller);
      
      // Scroll container can hold only a single child. Create that child.
      this.newestAppsContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      this.newestAppsContainer.set(
          {
            height : 210
          });
      scroller.add(this.newestAppsContainer);
      
      // add Newest Apps section to the page
      canvas.add(newestApps);

      // Most Liked Apps section
      var likedAppsLayout = new qx.ui.layout.VBox();
      likedAppsLayout.set(
        {
          alignX : "center"
        });
      var likedApps = new qx.ui.container.Composite(likedAppsLayout);

      // Liked Apps heading
      var likedAppsHeader = new qx.ui.basic.Label();
      likedAppsHeader.set(
        {
          value : "Most Liked Apps",
          font  : font,
          decorator : "home-page-header"
        });
      likedApps.add(likedAppsHeader);
      
      // slide bar of liked Apps
      scroller = new qx.ui.container.Scroll();
      likedApps.add(scroller);
      
      // Scroll container can hold only a single child. Create that child.
      this.likedAppsContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      this.likedAppsContainer.set(
          {
            height : 210
          });
      scroller.add(this.likedAppsContainer);
      
      // add Liked Apps section to the page
      canvas.add(likedApps);
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
      var             i;

      if (response.type == "failed")
      {
        // FIXME: Handle the failure somehow
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getHomeRibbonData":
        // Retrieve the app lists
        var featuredAppsList = response.data.result.Featured;
        var newestAppsList = response.data.result.Newest;
        var likedAppsList = response.data.result.MostLiked;

        // Remove everything from the lists. They're about to be refilled.
        this.featuredAppsContainer.removeAll();
        this.newestAppsContainer.removeAll();
        this.likedAppsContainer.removeAll();

        // Fill the featured apps ribbon with data
        for (i = 0; i < featuredAppsList.length; i++)
        {
          var appFeatured = featuredAppsList[i];
          var appThumbFeatured = 
            new aiagallery.widget.SearchResult("featured", appFeatured);
          this.featuredAppsContainer.add(appThumbFeatured);

          // Associate the app data with the UI widget so it can be passed
          // in the click event callback
          appThumbFeatured.setUserData("App Data", appFeatured);
          
          // Fire an event specific to this application, sans a friendly name.
          appThumbFeatured.addListener(
            "click", 
            function(e)
            {
              fsm.fireImmediateEvent(
                "homeRibbonAppClick", 
                this, 
                e.getCurrentTarget().getUserData("App Data"));
            });
        }

        // Hide the featured apps ribbon if it's empty
        this.featuredAppsContainer.setVisibility(
          featuredAppsList.length == 0 ? "excluded" : "visible");

        // Fill the newest apps ribbon with data
        for (i = 0; i < newestAppsList.length; i++)
        {
          var appNewest = newestAppsList[i];
          var appThumbNewest = 
            new aiagallery.widget.SearchResult("homeRibbon", appNewest);
          this.newestAppsContainer.add(appThumbNewest);

          // Associate the app data with the UI widget so it can be passed
          // in the click event callback
          appThumbNewest.setUserData("App Data", appNewest);
          
          // Fire an event specific to this application, sans a friendly name.
          appThumbNewest.addListener(
            "click", 
            function(e)
            {
              fsm.fireImmediateEvent(
                "homeRibbonAppClick", 
                this, 
                e.getCurrentTarget().getUserData("App Data"));
            });
        }

        // Fill the most liked apps ribbon with data
        for (i = 0; i < likedAppsList.length; i++)
        {
          var appLiked = likedAppsList[i];
          var appThumbLiked = 
            new aiagallery.widget.SearchResult("homeRibbon", appLiked);
          this.likedAppsContainer.add(appThumbLiked);

          // Associate the app data with the UI widget so it can be passed
          // in the click event callback
          appThumbLiked.setUserData("App Data", appLiked);
          
          // Fire an event specific to this application, sans a friendly name.
          appThumbLiked.addListener(
            "click", 
            function(e)
            {
              fsm.fireImmediateEvent(
                "homeRibbonAppClick", 
                this, 
                e.getCurrentTarget().getUserData("App Data"));
            });
        }
       
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
