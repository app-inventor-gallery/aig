/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Public page for an AIG user
 */
qx.Class.define("aiagallery.module.dgallery.userinfo.UserInfo",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModule,

  statics :
  {
    /**
     * Add a new userinfo view (module / tab)
     *
     * @param user {String}
     *   The user's name for the profile page we are making
     */
    addPublicUserView : function(user)
    {
      var             profile;
      var             page;
      var             moduleList;
      var             label;
      
      // Get the main tab view
      var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

      // Create a new ephemeral ("-") module for this application
      profile = new aiagallery.main.Module(
              "-" + user,
              null,
              "-" + user,
              aiagallery.main.Constant.PageName.PublicUser,
              aiagallery.module.dgallery.userinfo.UserInfo,
              [
                function(menuItem, page, subTabs)
                {
                  // Select the new public userinfo page
                  mainTabs.setSelection([ page ]);
               }
              ]);

      // Transmit the user id of this module */
      profile.setUserData("user", user);

      // Make this module ephemeral
      label = "-" + user;

      // Start up the new module
      moduleList = {};
      moduleList[label] = {};
      moduleList[label][label] = profile;
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
      aiagallery.module.dgallery.userinfo.Fsm.getInstance().buildFsm(module);

      // Create the real gui.
      aiagallery.module.dgallery.userinfo.Gui.getInstance().buildGui(module);
    }
  }
});
