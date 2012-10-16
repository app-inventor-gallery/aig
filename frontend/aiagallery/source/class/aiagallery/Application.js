/**
 * Main application class of the App Inventor for Android Gallery
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#require(aiagallery.dbif.DbifSim)
#use(aiagallery.main.AbstractModule)
*/

/**
 * Main menu
 */
qx.Class.define("aiagallery.Application",
{
  extend : qx.application.Standalone,

  statics :
  {
    /** 
     * Internal storage of the dateFormat object used by {@link getDateFormat} 
     */
    __dateFormatObj : null,

    /** The application-wide format for displaying dates */
    __dateFormat : "yyyy-MM-dd hh:mm a",

    /**
     * Get the application-wide DateFormat object. The actual format used is
     * stored in {@link __dateFormat}.
     * 
     * @return {qx.util.format.DateFormat}
     *   The object whose format() object may be passed a date object to be
     *   converted to our application-wide format.
     */
    getDateFormat : function()
    {
      var             dateFormat;
      
      // Retrieve the pre-allocated date format, or allocate a new one
      dateFormat =
        aiagallery.Application.__dateFormatObj ||
        new qx.util.format.DateFormat(aiagallery.Application.__dateFormat);
      
      // Save the date format object, in case it wasn't previously saved
      aiagallery.Application.__dateFormatObj = dateFormat;
      
      return dateFormat;
    },

    /**
     * Set the global cursor to indicate an action is in progress
     *
     * @param b {Boolean}
     *   <i>true</i> to turn on the progress cursor;
     *   <i>false</i> to turn it off
     */
    progressCursor : function(b)
    {
      var             cursor;
      var             root = qx.core.Init.getApplication().getRoot();

      if (b)
      {
        cursor = qx.core.Init.getApplication().PROGRESS_CURSOR;
        root.setGlobalCursor(cursor);
      }
      else
      {
        root.resetGlobalCursor();
      }
    },
    
    addModules : function(moduleList)
    {
      var             menuItem;
      var             moduleName;
      var             module;
      var             iconList;
      var             functionList;
      
      // For each module...
      for (menuItem in moduleList)
      {
        // ... there can be multiple available items in top-level menu item
        for (moduleName in moduleList[menuItem])
        {
          // The module is a singleton. Get its one and only instance
          module = moduleList[menuItem][moduleName]["clazz"].getInstance();
          module.buildInitialFsm(moduleList[menuItem][moduleName]);
        }
      }

      // Initialize the gui for the main menu
      iconList = aiagallery.main.Module.getIconList();
      functionList = aiagallery.main.Module.getFunctionList();
      aiagallery.main.Gui.getInstance().buildGui(moduleList,
                                                 iconList,
                                                 functionList);

      // Similarly, now that we have a canvas for each module, ...
      for (menuItem in moduleList)
      {
        for (moduleName in moduleList[menuItem])
        {
          // Build the initial GUI
          module = moduleList[menuItem][moduleName]["clazz"].getInstance();
          module.buildInitialGui(moduleList[menuItem][moduleName]);
        }
      }
    }
  },

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      var             menuItem;
      var             moduleName;

      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        var appender;

        // support native logging capabilities, e.g. Firebug for Firefox
        appender = qx.log.appender.Native;

        // support additional cross-browser console. Press F7 to
        // toggle visibility
        appender = qx.log.appender.Console;
      }

      this.debug("Starting up at " +
                 aiagallery.Application.getDateFormat().format(new Date()));

      // Apply patches
// Unfortunately we still need historical rich labels, so can't do this.
//      qx.bom.Label.setValue = aiagallery.LabelNoHtmlInjection.setValue;
      
      // Make all labels selectable by default
      qx.Class.patch(qx.ui.basic.Label, aiagallery.MDefaultSelectable);

      // Determine the path to our progress cursor
      qx.core.Init.getApplication().PROGRESS_CURSOR = "progress";

      // Use the progress cursor now, until we're fully initialized
      qx.core.Init.getApplication().constructor.progressCursor(true);

      // Start the RPC simulator by getting its singleton instance
      this.dbif = aiagallery.dbif.DbifSim.getInstance();

      // Get the module list
      var moduleList = aiagallery.main.Module.getList();

      // Add the modules in the module list
      aiagallery.Application.addModules(moduleList);
    }
  }
});


/*
 * Register our supported modules.  The order listed here is the order they
 * will appear in the Modules menu. Additionally, for a two-level menu, the
 * first parameter to the aiagallery.main.Module constructor may be the same
 * as a previous one.
 */

/*  The main Gallery */
new aiagallery.main.Module(
  "Home",
  "aiagallery/module/go-home.png",
  "Home",
  aiagallery.main.Constant.PageName.Home,
  aiagallery.module.dgallery.home.Home);

new aiagallery.main.Module(
  "Find Apps",
  "aiagallery/module/system-search.png",
  "Find Apps",
  aiagallery.main.Constant.PageName.FindApps,
  aiagallery.module.dgallery.findapps.FindApps);

new aiagallery.main.Module(
  "My Apps",
  "aiagallery/module/emblem-favorite.png",
  "My Apps",
  aiagallery.main.Constant.PageName.MyApps,
  aiagallery.module.dgallery.myapps.MyApps);

new aiagallery.main.Module(
  "Myself",
  "aiagallery/module/emblem-favorite.png",
  "Myself",
  aiagallery.main.Constant.PageName.User,
  aiagallery.module.dgallery.user.User);




if (qx.core.Environment.get("qx.debug"))
{
  new aiagallery.main.Module(
    "Testing",
    null,
    "Temporary",
    aiagallery.main.Constant.PageName.Testing,
    aiagallery.module.testing.temp.Temp);

  new aiagallery.main.Module(
    "Testing",
    "aiagallery/test.png",
    "Mobile",
    aiagallery.main.Constant.PageName.Testing,
    aiagallery.module.testing.mobile.Mobile);
}
