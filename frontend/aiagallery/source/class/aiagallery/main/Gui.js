/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#asset(aiagallery/*)
#ignore(goog.*)
*/

/**
 * The graphical user interface for the main menu
 */
qx.Class.define("aiagallery.main.Gui",
{
  type    : "singleton",
  extend  : qx.ui.core.Widget,

  members :
  {
    /** The currently used canvas (depends on what module is selected) */
    currentCanvas : null,

    /** Our copy of the module list */
    moduleList : null,

    buildGui : function(moduleList, iconList, functionList)
    {
      var             i;
      var             o;
      var             font;
      var             hbox;
      var             label;
      var             header;
      var             menuItem;
      var             moduleName;
      var             application;
      var             page;
      var             subTabs;
      var             subPage;
      var             canvas;
      var             numModules;
      var             whoAmI;
      var             hierarchy;
      var             pagePane;
      var             pageSelectorGroup;
      var             pageSelectorBar;
      var             thisPage;
      var             lookingAt;
      var             displayedHierarchy;
      var             _this = this;

      // Retrieve the previously-created top-level tab view
      var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

      // Did it exist?
      if (! mainTabs)
      {
        //
        // Nope. This is the first time in, and we're creating the whole gui.
        //

        // Save a reference to the module list
        this.moduleList = moduleList;

        // Create the VBox layout for the application structure
        o = new qx.ui.layout.VBox();
        o.set(
          {
            spacing       : 10
          });
        application = new qx.ui.container.Composite(o);
        this.getApplicationRoot().add(application, { edge : 0 });

        // Create a horizontal box layout for the title
        header = new qx.ui.container.Composite(new qx.ui.layout.HBox(6));
        header.set(
          {
            height          : 40
          });

        // Add the logo to the header
        o = new qx.ui.basic.Image("aiagallery/aicg.png");
        o.set(
          {
            height : 57,
            width  : 183,
            cursor : "pointer"
          });
        o.addListener(
          "click",
          function(e)
          {
            // Initiate a search
            this.selectModule(
              {
                page  : aiagallery.main.Constant.PageName.Home
              });
          },
          this);
        header.add(o);

        // Create a small spacer after the logo
        o = new qx.ui.core.Spacer(20);
        header.add(o);

        // Add a label to the header
        o = new qx.ui.basic.Label(
          "<div>" +
          "<center>" +
          "App Inventor" +
          "<br />" +
          "Community Gallery" +
          "</center>" +
          "</div>");
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.setSize(22);
        o.set(
          {
            rich : true,
            font : font
          });
        header.add(o);

        // Create a small spacer after the logo label
        o = new qx.ui.core.Spacer(20);
        header.add(o);

        // Add another label to header for release note + forum helper text
        o = new qx.ui.basic.Label(
          "<div><br/>" +
          "Welcome to the gallery! See <a href=\"https://docs.google.com/document/d/1sZ3rRdjsuicLbiaarLzbdspsmdfkllxRhWzY-y62sZk/edit\" target=\"_blank\" >Release Notes</a><br/>" +
          "and post feedback / bug reports to the " +
          "<a href=\"http://groups.google.com/group/app-inventor-gallery/topics\" target=\"_blank\" >Forum</a>." + 
          "</div>");
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        o.set(
          {
            rich : true,
            font : font
          });
        header.add(o);

        // Add a flexible spacer to take up the whole middle
        o = new qx.ui.core.Widget();
        o.setMinWidth(1);
        header.add(o, { flex : 1 });

        // Create a label to hold the user's login info and a logout button
        if (false)
        {
          this.whoAmI = new qx.ui.basic.Label("");
          this.whoAmI.setRich(true);
        }
        else
        {
          this.whoAmI = new aiagallery.main.WhoAmI();
          this.whoAmI.set(
            {
              marginTop : 12
            });
        }
        header.add(this.whoAmI);

        // Save a copy for global access
        qx.core.Init.getApplication().setUserData("whoAmI", this.whoAmI); 

        // Add a flexible spacer to take up the whole middle
        o = new qx.ui.core.Widget();
        o.setMinWidth(1);
        header.add(o, { flex : 1 });

        // Add a checkbox to enable/disable RPC simulation.
        var simulate = new qx.ui.form.CheckBox(this.tr("Simulate"));
        simulate.addListener(
          "changeValue",
          function(e)
          {
            liberated.sim.remote.MRpc.SIMULATE = e.getData();
          },
          this);

        // Enable simulation by default in the source version, disabled in the
        // build version (unless qx.debug is specifically set in the config
        // file). Set value to true then false initially, to ensure that
        // changeValue handler gets called.
        simulate.setValue(true);
        simulate.setValue(false);
        if (qx.core.Environment.get("qx.debug"))
        {
          simulate.setValue(true);
        }

        // For now, do not display the simulate button
        simulate.setVisibility("excluded");

        header.add(simulate);

        // Add the header to the application
        application.add(header);

        // Create the page pane
        pagePane = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
        pagePane.set(
          {
            appearance : "pagepane"
          });
        application.add(pagePane, { flex : 1 });

        // Create a horizontal box for the page hierarchy and right-justified
        // page selector
        hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox());

        // Add a spacer to remove the hierarchy from the pane edig
        o = new qx.ui.core.Spacer(20);
        hbox.add(o);

        // Create the hierarchy label to show where in the site we are
        hierarchy = new aiagallery.widget.PageHierarchy([ "Home" ]);
        
        //
        // Hierarchy is broken for app-to-app changes. Hide it for now.
        //
        hierarchy.setVisibility("excluded");

        hbox.add(hierarchy);
        this.setUserData("hierarchy", hierarchy);

        /*
         * The hierarchy is excluded. Do not, for now, right-justify links,
         * allowing space for an app title to be displayed as a link on the
         * right without moving the other links...
         * 
         */
        if (false)
        {
          // Right-justify the links
          o = new qx.ui.core.Widget();
          o.set(
            {
              height    : 1,
              minHeight : 1
            });
          hbox.add(o, { flex : 1 });
        }

        // Obtain or create the pageSelectorBar
        pageSelectorBar = this.getUserData("pageSelectorBar");
        pageSelectorBar = new qx.ui.form.RadioButtonGroup();
        pageSelectorBar.setLayout(new qx.ui.layout.HBox(10));
        this.setUserData("pageSelectorBar", pageSelectorBar);
        hbox.add(pageSelectorBar);

        // Add the right-justified page selector bar to the application
        pagePane.add(hbox);

        mainTabs = new qx.ui.tabview.TabView();
        mainTabs.setAppearance("radioview");

        // We're going to control the tab view via the link bar
        mainTabs.getChildControl("bar").exclude();

        pagePane.add(mainTabs, { flex : 1 });

        // Make the tab view globally accessible
        qx.core.Init.getApplication().setUserData("mainTabs", mainTabs);

        // Issue a pair of side-band RPCs:
        //  - find out who we are, and a logout URL
        //  - get a channel for server push
        qx.util.TimerManager.getInstance().start(
        function(userData, timerId)
        {
          var             rpc;

          rpc = new qx.io.remote.Rpc();
          rpc.setProtocol("2.0");
          rpc.set(
            {
              url         : aiagallery.main.Constant.SERVICES_URL,
              timeout     : 30000,
              crossDomain : false,
              serviceName : "aiagallery.features"
            });

          // Issue the request to find out who we are
          rpc.callAsync(
          function(e)
          {
            var             bAllowed;
            var             moduleList;
            var             module;
            var             bAddModules;

            // Create a global function accessible via <a href=
            window.editProfile = function()
              {
                // Take us to the user's edit page
                aiagallery.main.Gui.getInstance().selectModule(
                  {
                    page : aiagallery.main.Constant.PageName.User
                  });
              };

            // Set the header to display just-retrieved values
            _this.whoAmI.setId(e.id);
            _this.whoAmI.setIsAdmin(e.isAdmin);
            _this.whoAmI.setEmail(e.email);
            _this.whoAmI.setDisplayName(e.displayName);
            _this.whoAmI.setHasSetDisplayName(e.hasSetDisplayName);
            _this.whoAmI.setLogoutUrl(e.logoutUrl);
            _this.whoAmI.setIsAnonymous(e.isAnonymous);

            // Save the user's permissions
            application = qx.core.Init.getApplication();
            application.setUserData("permissions", e.permissions);

            // Update the saved whoami
            qx.core.Init.getApplication().setUserData("whoAmI", _this.whoAmI); 

            // Prepare to add user/management modules if permissions allow it.
            moduleList = {};
            bAddModules = false;

            // Add My Apps module if the user has permission
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "addOrEditApp",
              "deleteApp", 
              "getAppList",
              "appQuery",
              "intersectKeywordAndQuery",
              "getAppListByList",
              "getAppInfo"
              
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed || !e.isAnonymous)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "My Apps",
                "aiagallery/module/emblem-favorite.png",
                "My Apps",
                aiagallery.main.Constant.PageName.MyApps,
                aiagallery.module.dgallery.myapps.MyApps);

              moduleList["My Apps"] = {}; 	
              moduleList["My Apps"]["My Apps"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }

            // Add Profile page if user has permission
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "getUserProfile"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed || !e.isAnonymous)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Profile",
                "aiagallery/module/emblem-favorite.png",
                "Profile",
                aiagallery.main.Constant.PageName.User,
                aiagallery.module.dgallery.user.User);

              moduleList["Profile"] = {}; 	      
              moduleList["Profile"]["Profile"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }
            
            // Determine whether they have access to the database
            // management page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "getDatabaseEntities"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/test.png",
                "Database",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.db.Db);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["Database"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }

            // Determine whether they have access to the user management
            // page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "addOrEditVisitor",
              "deleteVisitor",
              "getVisitorList"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/module/configure.png",
                "Users",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.users.Users);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["Users"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }

            // Determine whether they have access to the application
            // management page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "getAppListAll"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/test.png",
                "Applications",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.applications.Applications);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["Applications"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }      

            // Determine whether they have access to the permission
            // management page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "addOrEditPermissionGroup",
              "deletePermissionGroup",
              "whitelistVisitors"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/test.png",
                "Permissions",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.permissions.Permissions);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["Permissions"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }

            // Determine whether they have access to the Featured Apps
            // management page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "setFeaturedApps"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/test.png",
                "Featured Apps",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.featured.Featured);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["Featured Apps"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }
            
            // Determine whether they have access to the message of
            // the day management page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "setMotd"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/test.png",
                "MOTD",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.motd.Motd);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["MOTD"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }
            
            // Determine whether they have access to the comment
            // management page.
            bAllowed = false;
            [ 
              // These permissions allow access to the page
              "deleteComment"
            ].forEach(
              function(rpcFunc)
              {
                if (qx.lang.Array.contains(e.permissions, rpcFunc))
                {
                  bAllowed = true;
                }
              });

            // If they're allowed access to the page...
            if (e.isAdmin || bAllowed)
            {
              // ... then create it
              module = new aiagallery.main.Module(
                "Management",
                "aiagallery/test.png",
                "Comments",
                aiagallery.main.Constant.PageName.Management,
                aiagallery.module.mgmt.comments.Comments);

              // Start up the new module
              if (! moduleList["Management"])
              {
                moduleList["Management"] = {};
              }
              moduleList["Management"]["Comments"] = module;

              // We've instantiated a new module which needs to be added
              bAddModules = true;
            }

            // If we instantiated at least one of the management modules...
            if (bAddModules)
            {
              // ... then add them.
              aiagallery.Application.addModules(moduleList);
            }

            // Init bookmarking after modules loaded 
            // Have to wait for the rpc to finish since
            // we may have to switch to a particular module
            // which may or may not be loaded give a user's permissions
            var          mainTabs;

            // Init history support
            _this.__historyInit();

            // Retrieve the previously-created top-level tab view
            mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

            // Add listener to detect page changes
            mainTabs.addListener("changeSelection", 
                                 _this.__onTabSelectionChanged);
          },
          "whoAmI",
          []);
        });

        // Create the footer, containing links to terms of service,
        // privacy policy, and supported browsers pages.
        // Put spacers surrounding and between these links

        hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        // Font for footer links
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.setDecoration("underline");

        // Spacer
        hbox.add(new qx.ui.core.Spacer(10, 10), { flex : 2 });

        // Add a link to the terms of service
        o = new qx.ui.basic.Label("Terms of Use");
        o.set(
          {
            font   : font,
            height : 20,
            cursor : "pointer"
          });
        o.addListener(
          "click",
          function(e)
          {
            window.open("TOU.html",
                        "App Inventor Gallery Terms of Use");
          });
        hbox.add(o);

        // Spacer
        hbox.add(new qx.ui.core.Spacer(10, 10), { flex : 1 });

        // Add a link to the privacy policy
        o = new qx.ui.basic.Label("Privacy Policy");
        o.set(
          {
            font   : font,
            height : 20,
            cursor : "pointer"
          });
        o.addListener(
          "click",
          function(e)
          {
            window.open("privacy.html",
                        "App Inventor Gallery Privacy Policy");
          });
        hbox.add(o);

        // Spacer
        hbox.add(new qx.ui.core.Spacer(10, 10), { flex : 1 });

        // Add a link to the supported browser page
        o = new qx.ui.basic.Label("Supported Browsers");
        o.set(
          {
            font   : font,
            height : 20,
            cursor : "pointer"
          });
        o.addListener(
          "click",
          function(e)
          {
            window.open("browsers.html",
                        "App Inventor Gallery Supported Browsers");
          });
        hbox.add(o);

        // Spacer
        hbox.add(new qx.ui.core.Spacer(10, 10), { flex : 2 });

        // Add the hbox to the application
        application.add(hbox);

        }
      // Get the page hierarchy
      hierarchy = this.getUserData("hierarchy");

      // for each menu button...
      for (menuItem in moduleList)
      {
        // Create a page (canvas) to associate with this button
        page =
        new qx.ui.tabview.Page(menuItem, iconList[menuItem]);
        page.setLayout(new qx.ui.layout.VBox(4));

        // If this is an ephemeral page...
        if (menuItem.charAt(0) == "-")
        {
          // ... then add it to the hierarchy without adding a button for it
          displayedHierarchy = qx.lang.Array.clone(hierarchy.getHierarchy());
          displayedHierarchy.push(menuItem);
          hierarchy.setHierarchy(displayedHierarchy);
        }
        else
        {
          // It's not ephemeral. Add it to the page hierarchy
          o = new qx.ui.form.RadioButton(menuItem);
          o.setUserData("page", page);
          o.set(
            {
              appearance : "pageselector",
              cursor     : "pointer"
            });

          o.addListener(
            "execute",
            function(e)
            {
              var             page = this.getUserData("page");
              var             label = page.getChildControl("button").getLabel();

              // Set this page to be the selected (visible) one
              mainTabs.setSelection([ this.getUserData("page") ]);

              // Reinitialize the hierarchy to show only this page
              hierarchy.setHierarchy([ label ]);
              
              // Remove any ephemeral pages
              _this.removeEphemeralPages();
            });
          this.getUserData("pageSelectorBar").add(o);
        }

        // See how many modules there are associated with this menu item
        numModules = 0;

        for (moduleName in moduleList[menuItem])
        {
          // If its an app add the uid as user data
          if (numModules === 0 && moduleList[menuItem][moduleName].pageId ==
              aiagallery.main.Constant.PageName.AppInfo) 
          {
            page.setUserData("app_uid", 
            moduleList[menuItem][moduleName].getUserData("app_uid"));
          } 
          else if(numModules === 0 && moduleList[menuItem][moduleName].pageId ==
              aiagallery.main.Constant.PageName.PublicUser)
          {
            page.setUserData("user", 
              moduleList[menuItem][moduleName].getUserData("user")); 
          }

          // We found a module.  Increment our counter
          numModules++;
        }

        var DebugFlags = qx.util.fsm.FiniteStateMachine.DebugFlags;
        var bInitialDebug = false;
        if (bInitialDebug)
        {
          var initialDebugFlags =
            (DebugFlags.EVENTS |
             DebugFlags.TRANSITIONS |
             DebugFlags.FUNCTION_DETAIL |
             DebugFlags.OBJECT_NOT_FOUND);
        }
        else
        {
          var initialDebugFlags = 0;
        }

        // If there are multiple modules, we need to create a Tab View.
        if (numModules > 1)
        {
          // Yup.  Create a method to select this menu item.
          subTabs = new aiagallery.widget.radioview.RadioView();

          if (false)
          {
            // Use a single row if there are an odd number of submodules or two
            // submodules; two rows if there are an even number greater than 2.
            if (numModules == 2 || numModules % 2 == 1)
            {
              subTabs.setRowCount(1);
            }
            else
            {
              subTabs.setRowCount(2);
            }
          }
          else
          {
            // Use a single row for subtabs
            subTabs.setRowCount(1);
          }

          subTabs.setContentPadding(0);
          page.add(subTabs, { flex : 1 });

          // For each module associated with the just-added button...
          for (moduleName in moduleList[menuItem])
          {
            // Create a page for this module
            subPage = new aiagallery.widget.radioview.Page(moduleName);

            // Save this page's id, used for the bookmark fragment
            subPage.setUserData("pageId", 
                                moduleList[menuItem][moduleName].pageId);

            // Add the fragment id to the subPage container
            page.setUserData("pageId",
                             moduleList[menuItem][moduleName].pageId); 

            var layout=new qx.ui.layout.VBox(4);
            subPage.setLayout(layout);
            subTabs.add(subPage, { flex : 1 });

            // Save the canvas
            moduleList[menuItem][moduleName].canvas = canvas = subPage;

            var fsm = moduleList[menuItem][moduleName].fsm;
            fsm.setDebugFlags(initialDebugFlags);
            fsm.addObject("main.canvas", canvas);
            canvas.addListener("appear", fsm.eventListener, fsm);
            canvas.addListener("disappear", fsm.eventListener, fsm);
          }

          // Make the main gallery subtabs globally accessible
          if (menuItem == "Gallery") 
          {
            qx.core.Init.getApplication().setUserData("subTabs", subTabs);
          }
        }
        else
        {
          // Save this page's id, used for the bookmark fragment
          page.setUserData("pageId", 
                          moduleList[menuItem][moduleName].pageId);
          // Save the canvas
          moduleList[menuItem][moduleName].canvas = canvas = page;

          var fsm = moduleList[menuItem][moduleName].fsm;
          fsm.setDebugFlags(initialDebugFlags);
          fsm.addObject("main.canvas", canvas);
          canvas.addListener("appear", fsm.eventListener, fsm);
          canvas.addListener("disappear", fsm.eventListener, fsm);
        }

        // Now that we've added the page IDs, we can add this page, which will
        // generate a changeSelection event which requires that the page IDs
        // be in place.
        mainTabs.add(page);

        // See if there are any functions to be called, e.g. to add
        // buttons to the radio view's button bar
        var thisFunctionList = functionList[menuItem];
        if (thisFunctionList)
        {
          for (i = 0; i < thisFunctionList.length; i++)
          {
            thisFunctionList[i](menuItem, page, subTabs);
          }
        }
      }
    },

    /**
    * Remove any ephemeral pages. Ephemeral pages are identified by a label
    * that begins with a dash. (Ephemeral pages do not have buttons created
    * for them, so the dash is never visible to the user.
    */
    removeEphemeralPages : function()
    {
      var             i;
      var             mainTabs;
      var             children;
      var             thisPage;
      var             lookingAt;
      var             hierarchy;

      // Make the tab view globally accessible
      mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

      // Get the page hierarchy
      hierarchy = this.getUserData("hierarchy");

      // Remove any ephemeral page
      for (children = mainTabs.getChildren(), i = 0;
          i < children.length;
          i++)
      {
        thisPage = children[i];
        lookingAt = thisPage.getChildControl("button").getLabel();
        if (lookingAt.charAt(0) == "-")
        {
          // We found an ephemeral page. Remove it.
          mainTabs.remove(thisPage);
          thisPage.dispose();

          // Retrieve the displayed hierarchy and pop the ephemeral page
          hierarchy.getHierarchy().pop();

          // Clone the new hierarchy and re-set it for display
          hierarchy.setHierarchy(qx.lang.Array.clone(hierarchy.getHierarchy()));

          // FIXME: Remove this item from the Module list too. effectively
          // do this: delete aiagallery.main.Module._list[menuItem] (but
          // create some function in the Module class to do it.
          // See also issue #52 for an alternative solution.

          // There can only ever be one ephemeral page. See ya!
          break;
        }
      }
    },

    setFsmDebug : function(bTurnOn)
    {
      var             menuItem;
      var             moduleName;
      var             moduleList = this.moduleList;

      // for each menu button...
      for (menuItem in moduleList)
      {
        // For each module associated with the
        // just-added button...
        for (moduleName in moduleList[menuItem])
        {
          var fsm = moduleList[menuItem][moduleName].fsm;
          if (bTurnOn)
          {
            var DebugFlags = qx.util.fsm.FiniteStateMachine.DebugFlags;
            fsm.setDebugFlags(DebugFlags.EVENTS |
                            DebugFlags.TRANSITIONS |
                            DebugFlags.FUNCTION_DETAIL |
                            DebugFlags.OBJECT_NOT_FOUND);
          }
          else
          {
            fsm.setDebugFlags(0);
          }
        }
      }
    },
    
    /**
    * Initialize Back button and bookmark support. Also look at the fragment
    * of the current URL to see if we need to go to a particular module.
    */
    __historyInit : function()
    {
      var             messageBus;
      var             fragment;

      // All history is maintained in this History class
      // By calling this function a '#' is placed on the
      // URL. 
      this.__history = qx.bom.History.getInstance();
      
      // Add listener for back button
      this.__history.addListener(
        "request",
        function(e)
        {
          // event data is the fragment that will select a page
          var state = e.getData();

          // FIXME : Whenever the hash is changed on the url it will
          // fire a "request" event. This is only a problem on the
          // Find apps page. These events should be ignored
          // if the user stays on the Find Apps page, but does a
          // different search. This issue cannot be fixed simply and
          // is documented on the issue tracker as issue #64. 
          
          this.__selectModuleByFragment(state);

          
        }, 
        this);

      // Subscribe to receive server push messages of type "app.postupload"
      messageBus = qx.event.message.Bus.getInstance();
      messageBus.subscribe(
        "findapps.query", 
        function(e)
        {
          var             mainTabs;
          var             fragment;
          var             jsonQuery = e.getData().json;
          var             selectedPage;

          // Retrieve the mainTabs object so we can get its selection (which
          // at this point will always be FindApps)
          mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

          // Retrieve the currently-selected page
          selectedPage = mainTabs.getSelection()[0];

          // Build the new fragment which identifies this particular query
          fragment =
              "page=" + aiagallery.main.Constant.PageName.FindApps +
              "&query=" + jsonQuery;

          // Change URL to add language independent constant to it
          // fragment will be the string constant of the page the user is on.
          // Second arguement is the title for the page. 
          qx.bom.History.getInstance().addToHistory(fragment, 
                                                      selectedPage.getLabel());
        },
        this);
      
      if (location.hash && location.hash.length > 1)
      {
        // Retrieve the fragment, excluding the leading '#'
        fragment = location.hash.substring(1);

        // Request this page
        this.__selectModuleByFragment(fragment);
      }
      
    },

    /**
    * Handler for module (tab) changes, where we update the history.
    * @param e {qx.event.type.Data} Data event containing the history changes.
    */
    __onTabSelectionChanged : function(e)
    {
      var fragment; 
      var mainTabs; 
      var selectedPage;

      // If this is an internal switch, e.g. FindApps accessed via a call to
      // this.authorSearch(), then don't save history.
      if (this.__bInternalSearch)
      {
        return;
      }

      // Get the main tab view
      mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");
      
      // Get the currently selected page
      selectedPage = mainTabs.getSelection()[0];

      // Get its page id string, start building fragment
      fragment = "page=" + selectedPage.getUserData("pageId");

      // If its an App Page we need to record the appid to switch to it
      if (selectedPage.getUserData("pageId") ==
          aiagallery.main.Constant.PageName.AppInfo)
      {       
        // Add appId to end of url
        fragment +=
          "&uid=" + 
          selectedPage.getUserData("app_uid") +
          "&label=" +
          selectedPage.getLabel().substring(1); // skip leading '-' (ephemeral)
      }
      else if (selectedPage.getUserData("pageId") == 
               aiagallery.main.Constant.PageName.FindApps)
      {
        // If its the Find Apps page we _will_ need to record the search
        // info. That will occur when the search is initiated. We therefore
        // don't need to do anything here. 
        // 
        // We already returned in the case of an author search (an internal
        // search), so if we got here it's because of a user click for direct
        // entry to the FindApps module.)
      } 

      else if(selectedPage.getUserData("pageId") ==
              aiagallery.main.Constant.PageName.PublicUser)
      {
        // This is a user profile page
        // add username to fragment
        fragment +=
          "&username=" +
          selectedPage.getUserData("user");   
      }

      // Change URL to add language independent constant to it
      // fragment will be the string constant of the page the user is on.
      // Second arguement is the title for the page. 
      qx.bom.History.getInstance().addToHistory(fragment, 
                                                selectedPage.getLabel());
    },

    /**
    * Select a module by parameters
    *
    * @param components {Map}
    *   A map containing at a minimum, a 'page' member, identifying the page
    *   (module) to be selected. If the 'page' value identifies the AppInfo
    *   page, then there must be 'uid' and 'label' members. If the 'page'
    *   value identifes the FindApps page, then there must be a 'query'
    *   parameter, in the format provided by the "queryChanged" event of
    *   {@link aiagallery.module.dgallery.findapps.CriteriaSearch}.
    *
    *   'page' must be one of: {@link aiagallery.mainConstant.PageName}.
    */
    selectModule : function(components)
    {
      var             i;
      var             j;
      var             mainTabs;
      var             tabArray;
      var             selectedPage;
      var             selectedLabel;
      var             pageArray;
      var             pageSelectorBar;
      var             hierarchy;
      var             pageId;
      var             tempRadioButton; 
      var             pageLabel;
      var             bPageExists;
      var             pageLocation;
      var             mainTabsLocation; 
      var             bAppOrUser = false;
      
      // Is this a request for the App page or user profile?
      if (components.page == aiagallery.main.Constant.PageName.AppInfo ||
          components.page == aiagallery.main.Constant.PageName.PublicUser)
      {

        // Set boolean flags so we now which one to do
        // false for app, true for profile
        if(components.page == aiagallery.main.Constant.PageName.PublicUser)
        {
          bAppOrUser = true; 
        }

        if(bAppOrUser)
        {
          // Need to have a username 
          if (! components.username)
          {
            throw new Error("Got request for User Profile without username");
          }     
        } 
        else 
        {
          // Yup. Ensure there's a uid and a label provided
          if (! components.uid)
          {
            throw new Error("Got request for AppInfo without UID");
          }
          if (! components.label)
          {
            throw new Error("Got request for AppInfo without label");
          }
        }

        // Get the page selector bar
        pageSelectorBar =
          aiagallery.main.Gui.getInstance().getUserData("pageSelectorBar");
          
        // Get the children
        pageArray = pageSelectorBar.getChildren();
                   
        // Its possible an app radio button page already exists if
        // so remove it 
        for (j = 0; j < pageArray.length; j++)
        {
          if (pageArray[j].getUserData("app") || 
              pageArray[j].getUserData("user"))
          {
          
            // Save the page location to replace later on else
            // the preceding tab will be selected incorrectly
            pageLocation = j; 
          
            // All done so break
            break; 
          }
        }
              
        // Retrieve the previously-created top-level tab view
        mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");
        tabArray = mainTabs.getChildren();
        
        // Ensure no ephemeral pages are open 
        for (i = 0; i < tabArray.length; i++)
        {
          // Get the pageId
          pageLabel = tabArray[i].getLabel(); 

          // Is this the one we're looking for?
          if (-1 != pageLabel.indexOf("-") 
            && (pageLabel.substring(1) != components.label &&
               pageLabel.substring(1) != components.username))
          {
            // Save the page location to replace later on else
            // the preceding tab will be selected incorrectly            
            mainTabsLocation = i; 
          }
        }         
        
        // Make sure the page is opened, it will be on the pageSelectorBar
        // if not we just entered via a bookmark or back button 
        // and have to open it ourselves   
        bPageExists = false;
        
        for (i = 0; i < tabArray.length; i++)
        {
          // Get the page label
          pageLabel = tabArray[i].getLabel(); 

          // is this an ephemeral page
          if (pageLabel.substring(1) == components.label ||
              pageLabel.substring(1) == components.username)
          {
            bPageExists = true;
            break;
          }
        }
        
        // If this is false we need to open the page ourselves
        if (!bPageExists)
        {
          if (bAppOrUser) 
          {
             aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
               components.username); 
          } 
          else 
          {              
            aiagallery.module.dgallery.appinfo.AppInfo.addAppView(
              Number(components.uid), components.label);
          }
        }
          
          
        // All ephemeral pages have been removed at this point via addAppView
        // Create new temporary app radio button page
        if(bAppOrUser)
        {
          tempRadioButton = new qx.ui.form.RadioButton(components.username);  
        }
        else
        {
          tempRadioButton = new qx.ui.form.RadioButton(components.label);
        }       
        tempRadioButton.set(
            {
              appearance : "pageselector",
              cursor     : "pointer"
            });
        tempRadioButton.setUserData("app", true);
          
        // Add to children a new temporary App Page
        // If there is a page to remove do it here, if not just add 
        if(pageLocation)
        {
          pageSelectorBar.add(tempRadioButton);
          pageSelectorBar.remove(pageArray[pageLocation]); 
        }
        else 
        {  
          pageSelectorBar.add(tempRadioButton);
        }       
        
        // If we need to remove from the main tabs do so now
        if(mainTabsLocation)
        {
          mainTabs.remove(tabArray[mainTabsLocation]); 
        }
        
        //Select it  
        pageSelectorBar.setSelection([pageArray[pageArray.length - 1]]);

        // Page selected. Nothing more to do.
        return;
      } 

      // Retrieve the previously-created top-level tab view
      mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");
      tabArray = mainTabs.getChildren();

      // It's not an AppInfo or user profile request. 
      // Iterate through the tabs' labels to find the tab.
      for (i = 0; i < tabArray.length; i++)
      {
        // Get the pageId
        pageId = tabArray[i].getUserData("pageId");

        // Is this the one we're looking for?
        if (pageId == components.page)
        {
          break;
        }
      }

      // Did we find it?
      if (i == tabArray.length)
      {
        // Nope. Go to the home page
        i = 0;                  // 0 is the home page
        pageId = aiagallery.main.Constant.PageName.Home;
      }

      // We found the selected page.
      selectedPage = tabArray[i];

      // Yup. Select this tab (module)
      mainTabs.setSelection([ selectedPage ]);  

      // Get the page hierarchy
      hierarchy = aiagallery.main.Gui.getInstance().getUserData("hierarchy");

      // Reinitialize the hierarchy to show only this page
      hierarchy.setHierarchy([tabArray[i].getLabel()]);

      // Get the page selector bar
      pageSelectorBar =
        aiagallery.main.Gui.getInstance().getUserData("pageSelectorBar");

      // Get children
      pageArray = pageSelectorBar.getChildren();
           
      //If there was a previously created app tab it must be removed
      for (j = 0; j < pageArray.length; j++)
      {
        if (pageArray[j].getUserData("app"))
        {
          
          // Remove child from Page Selector
          pageSelectorBar.remove(pageArray[j]); 
          
          // All done so break
          break; 
        }
      }
      
      // Get the label of the selected tab, to find it in the page
      // selector bar.
      selectedLabel = selectedPage.getLabel();

      for (j = 0; j < pageArray.length; j++)
      {
        if (pageArray[j].getLabel() == selectedLabel)
        {
          // Select the page
          pageSelectorBar.setSelection([ pageArray[j] ]);

          // All done so break
          break; 
        }
      }
           
      // Ensure no ephemeral pages are open 
      // Needed since when we switch out of an app page 
      // an ephemeral page will be left
      for (i = 0; i < tabArray.length; i++)
      {
        // Get the pageId
        var pageLabel = tabArray[i].getLabel(); 

        // Is this the one we're looking for?
        if (-1 != pageLabel.indexOf("-"))
        {
          mainTabs.remove(tabArray[i]); 
        }
      }

      // FIXME On app entry the title of the page is not set
      // We set it here, even though in app when a user selects
      // another module this will be done twice. 
      qx.bom.History.getInstance().setTitle(selectedPage.getLabel());

      // Arrange to pass parameters to the page, if necessary
      switch(pageId)
      {
      case aiagallery.main.Constant.PageName.AppInfo:
      case aiagallery.main.Constant.PageName.PublicUser: 
        // This was special-cased above
        break;

      case aiagallery.main.Constant.PageName.FindApps:
        // If the query is empty do not set Query, to do so is an error
        if (components.query == null) 
        {
          break; 
        }

        // Get the Gui instance and set its query property
        aiagallery.module.dgallery.findapps.Gui.getInstance().setQuery(
          components.query);
        break;
      }
    },

    /**
    * Select a module by a fragment string
    *
    * @param fragment {String}
    *   A URL fragment containing, at a minimum, "page=<pageId>". If the
    *   pageId is the AppInfo page, then there will additionally be
    *   parameters uid and label,
    *   e.g. page=AppInfo&uid=23&label=my first app
    *
    *   If the pageId is the FindApps page, then there will additionally be a
    *   parameter query, e.g. page=FindApps&query={"title"="my first app"}
    */
    __selectModuleByFragment : function(fragment)
    {
      var             parts;
      var             components;
      
      // Ensure fragment is properly decoded
      fragment = decodeURIComponent(fragment); 

      // Is this an app page or find apps search?
      parts = fragment.split("&"); 

      // Parse it completely
      components = {};
      parts.forEach(
        function(part)
        {
          var             index;
          
          index = part.indexOf("=");
          components[ part.substring(0, index) ] 
            = part.substring(index + 1);
        },
        this); 

      // Now select the module
      this.selectModule(components);
    }
  }
});
