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
      var             vbox;
      var             fsm = module.fsm;
      var             outerCanvas = module.canvas;
      var             scroller;
      var             motdLabel; 
      var             searchTextField;
      var             searchLayout; 
      var             command; 
      var             searchLabel; 
      var             innerCanvas;
      var             newsLabel; 
      
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });
      
      // Specify overall page layout
      var layout = new qx.ui.layout.VBox(30);
      var canvas = new qx.ui.container.Composite(layout);
      canvas.setPadding(20);
      scrollContainer.add(canvas, { flex : 1 });
      
      // Create a large bold font
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(26);

      // Create an hbox for introductory text and the Featured Apps
      hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      
      // Add a left spacer to center the welcome text
      o = new qx.ui.core.Spacer();
      o.set(
        {
          minWidth     : 20
        });
      hbox.add(o, { flex : 1 });

      // Create a vbox to vertically center the introductory text
      vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      hbox.add(vbox);
      
      // Add a top spacer
      vbox.add(new qx.ui.core.Spacer(), { flex : 1 });

      // Inner composite to hold text and search field
      innerCanvas 
        = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      innerCanvas.setWidth(450);

      // Add background
      var homepageBG = new qx.ui.decoration.Background();
      homepageBG.setBackgroundImage("aiagallery/hpbg.png");
      innerCanvas.setDecorator(homepageBG);

      // Put in some welcoming text
      text = 
        [
          "<div style='padding:0 30px 0 0;'>",
          "<div style='text-align:center;'>",
          "<h2>",
          "Welcome to the <br/>MIT App Inventor Community Gallery!",
          "</h2>",
          "</div>",

          "<div style='font-size:larger; font-weight:bold; padding:6px;'>",
          "<b>",
          "<ul><li>Check out mobile apps from all over the world!<br/></li>",
          "<li>Download App Inventor blocks and learn to program!<br/></li>",
          "<li>Join the community of App Inventor programmers!<br/></li></ul>",
          "</div>",
          "</div>" 
        ].join("");
      this.welcomingLabel = new qx.ui.basic.Label();
      this.welcomingLabel.set(
        {
          value        : text,
          rich         : true,
          width        : 434,
          height       : 300      
        });

      innerCanvas.add(this.welcomingLabel);
	  
	  // Add translation / internationalization options
	  // Add UI components
	  var i8nRadioGroup = new qx.ui.form.RadioButtonGroup();
	  
	  // Access all available locales and the currently set locale
	  var localeManager = qx.locale.Manager.getInstance();
	  var locales = localeManager.getAvailableLocales();
	  var currentLocale = localeManager.getLocale();
	  console.log("LOCALE TESTING");
	  console.log(locales);
	  console.log(currentLocale);
	  
	  this.marktr("$$languagename");
	  
	  // create a radio button for every available locale
	  for (var i = 0; i < locales.length; i++) {
	    var locale = locales[i];
	    var languageName = localeManager.translate("$$languagename", [], locale);
	    var localeButton = new qx.ui.form.RadioButton(languageName.toString());
	    // save the locale as model
	    localeButton.setModel(locale);
	    i8nRadioGroup.add(localeButton);
 
	    // preselect the current locale
	    if (currentLocale == locale) {
	      localeButton.setValue(true);
	    }
	  };
	  
	  // get the model selection and listen to its change
	  i8nRadioGroup.getModelSelection().addListener("change", function(e) {
	    // selection is the first item of the data array
	    var newLocale = i8nRadioGroup.getModelSelection().getItem(0);
	    localeManager.setLocale(newLocale);
	  }, this);
	  
	  innerCanvas.add(i8nRadioGroup);
	  
      
      // Create a simple search from the home page
      searchLabel = new qx.ui.basic.Label(this.tr("Search for an App"));
      
      // Create a large bold font
      var searchFont = 
        qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(16);

      searchLabel.setFont(font);
      innerCanvas.add(searchLabel);

      layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);      
      searchLayout = new qx.ui.container.Composite(layout);

      searchTextField = new qx.ui.form.TextField;
      searchTextField.setWidth(300); 

      this.searchButton = new qx.ui.form.Button(this.tr("Search"));

      // Excute a search when the user clicks the button
      this.searchButton.addListener("execute", 
        function(e) {
          
          var searchValue = searchTextField.getValue();
          // Do not execute an empty search 
          if (searchValue == null || searchValue.trim() == "")
          {
            return;
          }

          var query = 
          {
            text : [searchValue]
          }; 

          // Initiate a search
          aiagallery.main.Gui.getInstance().selectModule(
          {
            page  : aiagallery.main.Constant.PageName.FindApps,
            query : qx.lang.Json.stringify(query)
          });
        }, 
      this);

      // Allow 'Enter' to fire a search
      command = new qx.ui.core.Command("Enter");
      this.searchButton.setCommand(command);

      // Add button and search text field to layout
      searchLayout.add(searchTextField);
      searchLayout.add(this.searchButton);

      // Add search layout to inner canvas
      innerCanvas.add(searchLayout);


      var hLayout = new qx.ui.layout.HBox();
      hLayout.setSpacing(5);   
      var vLayout = new qx.ui.layout.VBox();
      vLayout.setSpacing(5);   
      var tagCloudLayout = new qx.ui.container.Composite(vLayout);
      tagCloudLayout.setWidth(450);
      var tagItemsLayout = new qx.ui.container.Composite(new qx.ui.layout.Flow());

      var tagCloudLabel = new qx.ui.basic.Label(this.tr("Most popular tags in the gallery"));
      
      // Create a large bold font

      tagCloudLabel.setFont(font);
      tagCloudLayout.add(tagCloudLabel);

      // An array of pre-filled tagcloud texts, before actual mechanism's done
      // USF static
      // var tagTexts = ["tag1", "Comics", "Entertainment", "*Featured*", "dave"];
      // MIT static
      var tagTexts = ["Games", "Education", "Entertainment", "Productivity", "Communication",
                      "Business", "Social", "Transportation", "Lifestyle", "Finance"];
      // An array of tag items
      var tagItems = [];

      for (var i = 0; i < tagTexts.length; i++) {
        // Add the tag cloud items to the innerCanvas
        var tagItem = new qx.ui.basic.Label();
	tagItem.setMarginRight(5);
        var tagfont = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        tagfont.setSize(16);
        tagfont.set(
          {
            decoration : "underline",
            color      : "#75940c"
          });
        tagItem.set(
          {
            textColor : null, // don't let it override font's color
            font         : tagfont, 
            value        : tagTexts[i],
            rich         : true,
            cursor       : "pointer"
          });

        // Add to the tag cloud canvas
        tagItemsLayout.add(tagItem);
        tagItems.push(tagItem);
      }
      // Comment out for build version 
      //console.log("Printing tagItems");
      //console.log(tagItems.length);

      tagCloudLayout.add(tagItemsLayout);

      for (i = 0; i < tagItems.length; i++) {
        // Add the tag cloud items to the innerCanvas
        var tagItem = tagItems[i];

        // TagItem clicks will launch a search of that tag
        tagItems[i].addListener(
          "click",
          function(e)
          {
            // Prevent the default 'click' behavior
            e.preventDefault();
            e.stop();

            var query = 
            {
              text : [e.getTarget().getValue()]
            }; 
            // Comment out for build
            //console.log(query.text);

            // Initiate a search
            aiagallery.main.Gui.getInstance().selectModule(
            {
              page  : aiagallery.main.Constant.PageName.FindApps,
              query : qx.lang.Json.stringify(query)
            });
          },
          this);
      }


      // Add search layout to inner canvas
      innerCanvas.add(tagCloudLayout);

      // Inner canvas contains intro text and search box
      vbox.add(innerCanvas); 
/*
      // Add a top spacer
      vbox.add(new qx.ui.core.Spacer(), { flex : 1 });
   
      // Put a label indicating the messsage of the day
      motdLabel = new qx.ui.basic.Label(this.tr("Message of the Day:"));
      vbox.add(motdLabel);
      
      // Add a MOTD text 
      this.motdText = new qx.ui.basic.Label();
      this.motdText.set(
        {
          rich         : true,
          width        : 400
        });
      vbox.add(this.motdText, {flex : 1 });
      
      // Add listener to hide motd label if the actual motd is empty
      this.motdText.addListener("changeValue", function(e) 
      {
        if(this.motdText.getValue().trim() == "")
        {
          motdLabel.hide(); 
        } 
        else
        {
          motdLabel.show();
        }          
      }, this); 
      
      //Start out hidden
      motdLabel.hide(); 

      // Add a bottom spacer
      vbox.add(new qx.ui.core.Spacer(), { flex : 1 });

      // Add a right spacer to center the welcome text and right-justify the
      // featured apps.
      o = new qx.ui.core.Spacer();
      o.set(
        {
          minWidth     : 20
        });
      hbox.add(o, { flex : 1 });
*/
      // Featured Apps section
      var featuredAppsLayout = new qx.ui.layout.VBox();
      featuredAppsLayout.set(
        {
          alignX : "center"
        });
      var featuredApps = new qx.ui.container.Composite(featuredAppsLayout);
      featuredApps.set(
        {
          width     : 700,
          decorator : "home-page-ribbon",
          padding   : 20
        });

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
        new qx.ui.container.Composite(new qx.ui.layout.HBox());
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
      newestApps.set(
        {
          decorator : "home-page-ribbon",
          padding   : 20
        });

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
        new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
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
      likedApps.set(
        {
          decorator : "home-page-ribbon",
          padding   : 20
        });

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
        new qx.ui.container.Composite(new qx.ui.layout.HBox());
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

/*        
        // Grab the MOTD as well
        var motd = response.data.result.Motd; 
        
        // Set the motd on the front page
        this.motdText.setValue(motd); 
*/

        // Remove everything from the lists. They're about to be refilled.
        this.featuredAppsContainer.removeAll();
        this.newestAppsContainer.removeAll();
        this.likedAppsContainer.removeAll();

        // Fill the featured apps ribbon with data
        for (i = 0; i < featuredAppsList.length; i++)
        {
          // If this isn't the first one, ...
          if (i > 0)
          {
            // ... then add a spacer between the previous one and this one
            this.featuredAppsContainer.add(new qx.ui.core.Spacer(10));
          }

          // Add the thumbnail for this app
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
          // If this isn't the first one, ...
          if (i > 0)
          {
            // ... then add a spacer between the previous one and this one
            this.newestAppsContainer.add(new qx.ui.core.Spacer(10));
          }

          // Add the thumbnail for this app
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
          // If this isn't the first one, ...
          if (i > 0)
          {
            // ... then add a spacer between the previous one and this one
            this.likedAppsContainer.add(new qx.ui.core.Spacer(10));
          }

          // Add the thumbnail for this app
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
    },

    // Retrieve search button.  Used by fsm on appear/disappear
    // events to enable/disable association with "Enter" key.
    getSearchButton : function()
    {
        return this.searchButton;
    }

  }
});
