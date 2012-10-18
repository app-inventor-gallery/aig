/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini 
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the user's own details page.
 */
qx.Class.define("aiagallery.module.dgallery.user.Gui",
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

      // Layouts
      var             layout; 
      var             vBoxText;
      var             vBoxBio;
      var             hBox; 
      var             vBoxBtn;

      // GUI objects 
      var             label;
      var             submitBtn;

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());   
   
      // Create a vertical layout just for the textfields and labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxText = new qx.ui.container.Composite(layout);
      
      // Create a label for the username textfield 
      label = new qx.ui.basic.Label(this.tr("Username:"));
      vBoxText.add(label);
      
      // Create textfield for entering in a username
      this.userNameField = new qx.ui.form.TextField;
      this.userNameField.set(
      {
        maxWidth     : 200
      });
      vBoxText.add(this.userNameField);      
   
      // Create friendly name to get username field from the FSM
      fsm.addObject("userNameField", 
         this.userNameField,"main.fsmUtils.disable_during_rpc");

      // DOB label 
      label = new qx.ui.basic.Label(this.tr("Date of Birth:"));
      vBoxText.add(label);
      
      // Create two DOB drop down menus, one for month and 
      // the other for year
      this.dobMonthSBox = new qx.ui.form.SelectBox();
 
      this.dobMonthSBox.add(new qx.ui.form.ListItem("January"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("February"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("March"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("April"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("May"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("June"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("July"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("August"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("Spetember"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("October"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("November"));
      this.dobMonthSBox.add(new qx.ui.form.ListItem("December"));

      // Create friendly name to get username field from the FSM
      fsm.addObject("dobMonthSBox", 
         this.dobMonthSBox,"main.fsmUtils.disable_during_rpc");

      vBoxText.add(this.dobMonthSBox);

      // DOB year list
      this.dobYearSBox = new qx.ui.form.SelectBox();
 
      // Add Years to the box 
      var todaysDate = new Date();
      for(var i = todaysDate.getFullYear(); i > 1900; i--)
      {
        this.dobYearSBox.add(new qx.ui.form.ListItem(String(i)));
      }

      // Create friendly name to get username field from the FSM
      fsm.addObject("dobYearSBox", 
         this.dobYearSBox,"main.fsmUtils.disable_during_rpc");

      vBoxText.add(this.dobYearSBox); 

      // Create a label for describing the email field
      label = new qx.ui.basic.Label(this.tr("Email:"));
      vBoxText.add(label);
      
      // Create textfield for entering in a email
      this.emailField = new qx.ui.form.TextField;
      this.emailField.set(
      {
        maxWidth     : 200
      });
      vBoxText.add(this.emailField);      
   
      // Create friendly name to get username field from the FSM
      fsm.addObject("emailField", 
         this.emailField,"main.fsmUtils.disable_during_rpc");

      // Create a label for describing the location field 
      label = new qx.ui.basic.Label(this.tr("Location:"));
      vBoxText.add(label);
      
      // Create textfield for entering in a location
      this.locationField = new qx.ui.form.TextField;
      this.locationField.set(
      {
        maxWidth     : 200
      });
      vBoxText.add(this.locationField);      
   
      // Create friendly name to get username field from the FSM
      fsm.addObject("locationField", 
         this.locationField,"main.fsmUtils.disable_during_rpc");

      // Layout for bio box
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBio = new qx.ui.container.Composite(layout);

      // Create a label for describing the bio text area
      label = new qx.ui.basic.Label(this.tr("Bio:"));
      vBoxBio.add(label); 

      // Create textarea for entering in bio
      this.bioTextArea = new qx.ui.form.TextArea;
      this.bioTextArea.set(
      {
        maxWidth     : 500,
        height       : 250
      });
      vBoxBio.add(this.bioTextArea);

      // Set friendly name so we can get the text area value later
      fsm.addObject("bioTextArea", 
                    this.bioTextArea,
                    "main.fsmUtils.disable_during_rpc");

      // Button layout
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBtn = new qx.ui.container.Composite(layout);

      // Create a submit button
      this.submitBtn = 
        new qx.ui.form.Button(this.tr("Save Changes"));
      this.submitBtn.set(
      {
        maxHeight : 24,
        width     : 150
      });
      vBoxBtn.add(this.submitBtn);
      this.submitBtn.addListener("execute", fsm.eventListener, fsm);

      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("saveBtn", 
         this.submitBtn, "main.fsmUtils.disable_during_rpc");

      // Disable button on startup since no changes will have been made
      //this.submitBtn.setEnabled(false);

      // Overall layout
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBox = new qx.ui.container.Composite(layout);

      // Add to hBox text field objects
      hBox.add(vBoxText);

      // Add to hBox bio field
      hBox.add(vBoxBio);

      // Add Btn layout
      hBox.add(vBoxBtn); 

      // Add to main canvas
      canvas.add(hBox);

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
      // On appear populate fields with data if there is some
      case "appear":
          
          // Map of user profile data
          var userProfile = response.data.result;

          // If the user is anon return pop a warning
          if (userProfile.id == "")
          {
             var warnString = this.tr("You must log in to edit your profile"); 
             var label = new qx.ui.mobile.basic.Label(warnString);
             var dialog = new qx.ui.mobile.dialog.Dialog(label);
             dialog.setTitle("Not Logged In");
            
             dialog.show();
             break; 
          }

          // Populate fields with data from map
          this.userNameField.setValue(userProfile.displayName);
          this.emailField.setValue(userProfile.email);
          
          if (userProfile.location != "")
          {
            this.locationField.setValue(userProfile.location);        
          }
          
          if (userProfile.bio != "")
          {
            this.bioTextArea.setValue(userProfile.bio);
          }

          // Set Selection for month and year
          var children = this.dobMonthSBox.getChildren();
          for(var i = 0; i < children.length; i++)
          {
            if(children[i].getLabel() == userProfile.birthMonth)
            {
              this.dobMonthSBox.setSelection([children[i]]);
              break; 
            }
          }

          children = this.dobYearSBox.getChildren();
          var date = new Date();
          date = date.getFullYear();
        
          var childToSelect = parseInt(date) - parseInt(userProfile.birthYear); 
          this.dobYearSBox.setSelection([children[childToSelect]]);

          // Select Birthday and year from list
          break;

      case "editUserProfile":
        // User submited new profile info, disable submit button
        //this.submitBtn.setEnabled(false);

        // Popup dialog that info was saved
        var savedStr = this.tr("New profile information saved."); 
        //dialog.Dialog.warning(savedStr); 
        alert(savedStr);
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
