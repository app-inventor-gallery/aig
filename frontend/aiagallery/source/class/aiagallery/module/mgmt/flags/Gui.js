/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the flag management page
 */
qx.Class.define("aiagallery.module.mgmt.flags.Gui",
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
      var             canvas = module.canvas;
      var             label; 
      var             appScroller; 
      var             profileScroller; 
      var             vBox; 

      // Show flagged apps 
      label = new qx.ui.basic.Label("Flagged Apps");
      canvas.add(label);     

      // Create the scroller to hold all of the apps
      appScroller = new qx.ui.container.Scroll();
      canvas.add(appScroller, {flex : 1});
 
      // The Scroller may contain only one container, so create that container.
      vBox = new qx.ui.layout.VBox();     
      this.appScrollContainer = 
        new qx.ui.container.Composite(vBox);
      appScroller.add(this.appScrollContainer);

      // Get some space inbetween these two
      canvas.add(new qx.ui.core.Spacer(25)); 

      // Show flagged profiles
      label = new qx.ui.basic.Label("Flagged Profiles");
      canvas.add(label);  

      // Create the scroller to hold all of the apps
      profileScroller = new qx.ui.container.Scroll();
      canvas.add(profileScroller, {flex : 1}); 

      // The Scroller may contain only one container, so create that container.
      vBox = new qx.ui.layout.VBox();     
      this.profileScrollContainer = 
        new qx.ui.container.Composite(vBox);
      profileScroller.add(this.profileScrollContainer);

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

      case "getFlags":

        // Get the list of returned apps
        result = response.data.result;

        // Add app flags if we need to 
        if (result.Apps.length != 0)
        {
          this.appScrollContainer.removeAll(); 

          // For each app flag add a line to the appScroller
          // Contains the title of the app, reason for flagging on line 1
          // On line 2, 3 buttons keep app, remove app, visit app
	  result.Apps.forEach(function(obj)
            {
              var    vBoxTotal; 
              var    hBoxData;
              var    hBoxBtns;
              var    label; 
              var    button; 

              // Flag Layouts         
              vBoxTotal 
                = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));  

              hBoxData 
                = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

              hBoxBtns
                = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)); 

              // Add App Data
              label = new qx.ui.basic.Label("App Title: " + obj.appTitle);
              hBoxData.add(label);

              label 
                = new qx.ui.basic.Label("Reason: " + obj.explanation);
              hBoxData.add(label);

              // Add Buttons
              button = new qx.ui.form.Button(this.tr("Keep"));
              button.setUserData("uid", obj.app);

              button.addListener("execute", fsm.eventListener, fsm);

              // Save its friendly name
              fsm.addObject("keepBtn", 
                button, "main.fsmUtils.disable_during_rpc");

              hBoxBtns.add(button); 

              button = new qx.ui.form.Button(this.tr("Delete"));
              button.setUserData("uid", obj.app);

              button.addListener("execute", fsm.eventListener, fsm);

              // Save its friendly name
              fsm.addObject("deleteBtn", 
                button, "main.fsmUtils.disable_during_rpc");

              hBoxBtns.add(button); 

              button = new qx.ui.form.Button(this.tr("Go To App"));
              button.setUserData("uid", obj.app);
              button.setUserData("title", obj.appTitle);

              button.addListener(
                "click",
                function(e)
                {
                  var title;
                  var uid;

                  uid = e.getTarget().getUserData("uid");
                  title = e.getTarget().getUserData("title");

                  aiagallery.module.dgallery.appinfo.AppInfo
                    .addAppView(uid, title);                
		}); 

              hBoxBtns.add(button); 

              // Add both layouts to main layout
              vBoxTotal.add(hBoxData); 
              vBoxTotal.add(hBoxBtns);

              this.appScrollContainer.add(vBoxTotal); 
               
              // Add space between apps
              this.appScrollContainer.add(new qx.ui.core.Spacer(10));

            }
          ,this);
	}

        // Add profile flags if we need to
        if (result.Profiles.length != 0)
        {
          this.profileScrollContainer.removeAll(); 

          // For each profile flag add a line to the profileScroller
          // Contains the flagged profile name and reason for flagging on line 1
          // On line 2, 3 buttons keep profile, remove profile, visit profile
	  result.Profiles.forEach(function(obj)
            {
              var    vBoxTotal; 
              var    hBoxData;
              var    hBoxBtns;
              var    label; 
              var    button; 

              // Flag Layouts         
              vBoxTotal 
                = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));  

              hBoxData 
                = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

              hBoxBtns
                = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)); 

              // Add App Data
              label = new qx.ui.basic.Label("Username: " + obj.profileId);
              hBoxData.add(label);

              label = new qx.ui.basic.Label("Reason: " + obj.explanation);
              hBoxData.add(label);

              // Add Buttons
              button = new qx.ui.form.Button(this.tr("Keep"));
              button.setUserData("uid", obj.uid);

              button.addListener("execute", fsm.eventListener, fsm);

              // Save its friendly name
              fsm.addObject("keepBtn", 
                button, "main.fsmUtils.disable_during_rpc");

              hBoxBtns.add(button); 

              button = new qx.ui.form.Button(this.tr("Delete"));
              button.setUserData("uid", obj.uid);

              button.addListener("execute", fsm.eventListener, fsm);

              // Save its friendly name
              fsm.addObject("deleteBtn", 
                button, "main.fsmUtils.disable_during_rpc");

              hBoxBtns.add(button); 

              button = new qx.ui.form.Button(this.tr("Go To User Profile"));
              button.setUserData("username", obj.profileId);

              button.addListener(
                "click",
                function(e)
                {
                  var username;

                  username = e.getTarget().getUserData("username");

                  aiagallery.module.dgallery.userinfo.UserInfo
                    .addPublicUserView(username);             
		}); 

              hBoxBtns.add(button); 

              // Add both layouts to main layout
              vBoxTotal.add(hBoxData); 
              vBoxTotal.add(hBoxBtns);

              this.profileScrollContainer.add(vBoxTotal); 
               
              // Add space between apps
              this.profileScrollContainer.add(new qx.ui.core.Spacer(10));

            }
          ,this);
	}

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
