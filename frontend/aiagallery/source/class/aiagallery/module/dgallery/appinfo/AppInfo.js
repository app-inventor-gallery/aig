/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Individual application page
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.AppInfo",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModule,

  statics :
  {
    /**
     * Add a new application view (module / tab)
     *
     * @param uid {Key}
     *   The UID of the app to be displayed
     *
     * @param label {String}
     *   The label to present in the tab for this app
     */
    addAppView : function(uid, label)
    {
      var             app;
      var             page;
      var             moduleList;

      // Ensure all existing ephemeral pages are removed
      //aiagallery.main.Gui.getInstance().removeEphemeralPages();
      
      // Get the main tab view
      var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

      // Create a new ephemeral ("-") module for this application
      app = new aiagallery.main.Module(
              "-" + label,
              null,
              "-" + label,
              aiagallery.main.Constant.PageName.AppInfo,
              aiagallery.module.dgallery.appinfo.AppInfo,
              [
                function(menuItem, page, subTabs)
                {
                  // Select the new application page
                  mainTabs.setSelection([ page ]);
               }
              ]);

      // Transmit the UID of this module */
      app.setUserData("app_uid", uid);

      // Make this module ephemeral
      label = "-" + label;

      // Start up the new module
      moduleList = {};
      moduleList[label] = {};
      moduleList[label][label] = app;
      aiagallery.Application.addModules(moduleList);
    }
  },

  members :
  {
    /**
     * Create the module's finite state machine and graphical user interface.
     *
     * This function is called the first time a module is actually selected to
     * appear.  Creation of the module's actual FSM and GUI have been deferred
     * until they were actually needed (now) so we need to create them.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    initialAppear : function(module)
    {
      // Replace existing (temporary) finite state machine with the real one.

      var fsm = new aiagallery.module.dgallery.appinfo.Fsm();
      fsm.buildFsm(module);

      // Create the real gui.
      var gui = new aiagallery.module.dgallery.appinfo.Gui();
      gui.buildGui(module);
      // Stash a reference to it in the module so fsm can refer to it
      module.setUserData("gui",gui);
    }
  }
});
