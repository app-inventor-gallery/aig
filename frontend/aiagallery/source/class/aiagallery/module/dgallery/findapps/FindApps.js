/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Gallery "Find Apps" Page
 */
qx.Class.define("aiagallery.module.dgallery.findapps.FindApps",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModule,

  events :
  {
    /** Fired when the Find Apps gui is fully rendered */
    "FindAppsReady" : "qx.event.type.Event"
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
      module.canvas.addListenerOnce(
        "appear",
        function(e)
        {
          this.fireEvent("FindAppsReady");
        },
        this);

      // Replace existing (temporary) finite state machine with the real one.
      aiagallery.module.dgallery.findapps.Fsm.getInstance().buildFsm(module);

      // Create the real gui.
      aiagallery.module.dgallery.findapps.Gui.getInstance().buildGui(module);
    }
  }
});
