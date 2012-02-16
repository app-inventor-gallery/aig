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
        var application = new qx.ui.container.Composite(o);
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
            width  : 183
          });
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
        o.setRich(true);
        o.setFont(new qx.bom.Font(22, [ "sans-serif" ]));
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
        }
        header.add(this.whoAmI);

        // Add a flexible spacer to take up the whole middle
        o = new qx.ui.core.Widget();
        o.setMinWidth(1);
        header.add(o, { flex : 1 });

        // Add a checkbox to enable/disable RPC simulation.
        var simulate = new qx.ui.form.CheckBox(this.tr("Simulate"));
        simulate.addListener("changeValue",
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
        hbox.add(hierarchy);
        this.setUserData("hierarchy", hierarchy);

        // Right-justify the links
        o = new qx.ui.core.Widget();
        o.set(
          {
            height    : 1,
            minHeight : 1
          });
        hbox.add(o, { flex : 1 });


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
                  _this._editProfile();
                };

                // Set the header to display just-retrieved values
                _this.whoAmI.setId(e.id);
                _this.whoAmI.setIsAdmin(e.isAdmin);
                _this.whoAmI.setEmail(e.email);
                _this.whoAmI.setDisplayName(e.displayName);
                _this.whoAmI.setHasSetDisplayName(e.hasSetDisplayName);
                _this.whoAmI.setLogoutUrl(e.logoutUrl);
                
                // Save the user's permissions
                application = qx.core.Init.getApplication();
                application.setUserData("permissions", e.permissions);
                
                // Prepare to add management modules if permissions allow it.
                moduleList = {};
                bAddModules = false;

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
                // FIXME: Kept same as Application page for now
                "addOrEditPermissionGroup",
                "deletePermissionGroup"
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

              // If we instantiated at least one of the management modules...
              if (bAddModules)
              {
                // ... then add them.
                aiagallery.Application.addModules(moduleList);
              }
            },
            "whoAmI",
            []);
            

            // Load the Channel API. If we're on App Engine, it'll succeed
            var loader = new qx.bom.request.Script();
            loader.onload = 
              function createChannel()
              {
                // Did we successfully load the Channel API?
                switch(loader.status)
                {
                case 200:
                  // Found the Channel API. Reqest a server push channel
                  rpc.callAsync(
                    function(e)
                    {
                      var             channel;
                      var             socket;
                      var             channelMessage;

                      // Did we get a channel token?
                      if (! e)
                      {
                        // Nope. Nothing to do.
                        _this.warn("getChannelToken: " +
                                   "Received no channel token");
                        return;
                      }

                      channelMessage = function(type, data)
                      {
                        var             messageBus;

                        if (typeof data == "undefined")
                        {
                          _this.debug("Channel Message (" + type + ")");
                        }
                        else
                        {
                          _this.debug(liberated.dbif.Debug.debugObjectToString(
                                        data,
                                        "Channel Message (" + type + ")"));
                        }
                      };

                      // If there was a prior channel open...
                      socket = application.getUserData("channelSocket");
                      if (socket)
                      {
                        // ... then close it
                        socket.close();
                      }

                      // Open a channel for server push
                      channel = new goog.appengine.Channel(e);
                      socket = channel.open();
                      
                      // When we receive a message on the channel, post a
                      // message on the message bus.
                      socket.onmessage = function(data)
                      {
                        var             messageBus;

                        // Parse the JSON message
                        data = qx.lang.Json.parse(data.data);
                        channelMessage("message", data);

                        // Dispatch a message for any subscribers to
                        // this type.
                        messageBus = qx.event.message.Bus.getInstance();
                        messageBus.dispatchByName(data.type, data);
                      };

                      // Display a message when the channel is open
                      socket.onopen = function(data)
                      {
                        channelMessage("open", data);
                      };

                      // Display a message upon error
                      socket.onerror = function(data)
                      {
                        channelMessage("error", data);
                      };

                      // Display a message when the channel is closed
                      socket.onclose = function(data)
                      {
                        channelMessage("close", data);
                        
                        // Re-establish the channel
                        createChannel();
                      };

                      // Save the channel token (if provided)
                      application.setUserData("channelSocket", socket);
                    },
                    "getChannelToken",
                    []);
                  break;

                  default:
                    // Nope.
                  _this.warn(loader.status + ": Failed to load Channel API");
                  break;

                }
              };
            loader.open("GET", "/_ah/channel/jsapi");
            loader.send();
          });
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
        mainTabs.add(page);
        
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
              appearance : "pageselector"
            });

          o.addListener(
            "execute",
            function(e)
            {
              var             page = this.getUserData("page");
              var             label = page.getChildControl("button").getLabel();

              // Remove any ephemeral pages
              _this.removeEphemeralPages();
              
              // Set this page to be the selected (visible) one
              mainTabs.setSelection([ this.getUserData("page") ]);
              
              // Reinitialize the hierarchy to show only this page
              hierarchy.setHierarchy([ label ]);
            });
          this.getUserData("pageSelectorBar").add(o);
        }

        // See how many modules there are associated with this menu item
        numModules = 0;

        for (moduleName in moduleList[menuItem])
        {
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

          // See if there are any functions to be called, e.g. to add
          // buttons to the radio view's button bar
          var thisFunctionList = functionList[menuItem];
          if (thisFunctionList)
          {
            for (var i = 0; i < thisFunctionList.length; i++)
            {
              thisFunctionList[i](menuItem, page, subTabs);
            }
          }

          // For each module associated with the just-added button...
          for (moduleName in moduleList[menuItem])
          {
            // Create a page for this module
            subPage = new aiagallery.widget.radioview.Page(moduleName);
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
          // Save the canvas
          moduleList[menuItem][moduleName].canvas = canvas = page;

          var fsm = moduleList[menuItem][moduleName].fsm;
          fsm.setDebugFlags(initialDebugFlags);
          fsm.addObject("main.canvas", canvas);
          canvas.addListener("appear", fsm.eventListener, fsm);
          canvas.addListener("disappear", fsm.eventListener, fsm);

          // See if there are any functions to be called
          var thisFunctionList = functionList[menuItem];
          if (thisFunctionList)
          {
            for (var i = 0; i < thisFunctionList.length; i++)
            {
              thisFunctionList[i](menuItem, page, null);
            }
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
          hierarchy.setHierarchy(
            qx.lang.Array.clone(hierarchy.getHierarchy()));
          
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
    
    _editProfile : function()
    {
      var             win;
      var             grid;
      var             container;
      var             displayName;
      var             hBox;
      var             ok;
      var             cancel;
      var             command;
  
      // Create a modal window for editing the profile
      if (! this._win)
      {
        win = new qx.ui.window.Window(this.tr("Edit Profile"));
        win.set(
          {
            layout : new qx.ui.layout.VBox(30),
            modal  : true
          });
        this.getApplicationRoot().add(win);

        // We'll use a grid to layout the property editor
        grid = new qx.ui.layout.Grid();
        grid.setSpacingX(5);
        grid.setSpacingY(15);
        grid.setColumnAlign(0, "right", "middle");

        // Create a container for the grid
        container = new qx.ui.container.Composite(grid);
        win.add(container);

        // Add the label
        container.add(new qx.ui.basic.Label(this.tr("Display Name")), 
                      { row : 0, column : 0 });

        // Add the text field
        win._displayName = new qx.ui.form.TextField();
        win._displayName.set(
          {
            width  : 120,
            filter : /[a-zA-Z0-9 _-]/
          });
        container.add(win._displayName, { row : 0, column : 1 });
        
        // Create a horizontal box to hold the buttons
        hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        // Add spacer to right-align the buttons
        hBox.add(new qx.ui.core.Spacer(null, 1), { flex : 1 });

        // Add the Ok button
        ok = new qx.ui.form.Button(this.tr("Ok"));
        ok.setWidth(100);
        ok.setHeight(30);
        hBox.add(ok);
        
        // Allow 'Enter' to confirm entry
        command = new qx.ui.core.Command("Enter");
        ok.setCommand(command);
        
        // When the Ok button is pressed, issue an editProfile request
        ok.addListener(
          "execute", 
          function(e)
          {
            var             rpc;
            var             _this = this;

            // Get and configure a new RPC object
            rpc = new qx.io.remote.Rpc();
            rpc.setProtocol("2.0");
            rpc.set(
              {
                url         : aiagallery.main.Constant.SERVICES_URL,
                timeout     : 30000,
                crossDomain : false,
                serviceName : "aiagallery.features"
              });
            
            // Issue the request. When we get the result...
            rpc.callAsync(
              function(e)
              {
                // Set the display name in the application header
                _this.whoAmI.setDisplayName(win._displayName.getValue());
                _this.whoAmI.setHasSetDisplayName(true);
                
                // Close the window
                win.close();
              },
              "editProfile",
              {
                displayName : win._displayName.getValue()
              });
          },
          this);

        // Add the Cancel button
        cancel = new qx.ui.form.Button(this.tr("Cancel"));
        cancel.setWidth(100);
        cancel.setHeight(30);
        hBox.add(cancel);

        // Allow 'Escape' to cancel
        command = new qx.ui.core.Command("Esc");
        cancel.setCommand(command);

        // Close the window if the cancel button is pressed
        cancel.addListener(
          "execute",
          function(e)
          {
            win.close();
          },
          this);

        // Add the button bar to the window
        win.add(hBox);
        
        // We only want to create this window once.
        this._win = win;
      }
      
      // Clear out the display name field
      this._win._displayName.setValue("");
                
      // Set the focus to the display name field
      this._win._displayName.focus();

      // Show the window
      this._win.center();
      this._win.show();
    }
  }
});
