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
      var             vBoxEmail; 
      var             hBox; 
      var             vBoxBtn;
      var             hBoxDob; 
      var             vBoxOptions;
      var             vBoxOptionLike;
      var             vBoxOptionDownload;
      var             vBoxOptionComment; 

      // GUI objects 
      var             label;
      var             submitBtn;

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());   
   
      // Create a vertical layout just for the textfields and labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(15);      
      vBoxText = new qx.ui.container.Composite(layout);
      
      // variable to store old username
      this.oldName = ""; 

      // Create a label for the username textfield 
      label = new qx.ui.basic.Label(this.tr("Username:"));
      label.setFont("bold"); 
      vBoxText.add(label);
      
      // Create textfield for entering in a username
      // Only allow certain values 
      this.userNameField = new qx.ui.form.TextField;
      this.userNameField.set(
      {
        maxWidth     : 200,
        filter : /[a-zA-Z0-9 _-]/
      });
      vBoxText.add(this.userNameField);      
   
      // Create friendly name to get username field from the FSM
      fsm.addObject("userNameField", 
         this.userNameField,"main.fsmUtils.disable_during_rpc");

      // DOB label 
      label = new qx.ui.basic.Label(this.tr("Date of Birth:"));
      label.setFont("bold"); 
      vBoxText.add(label);
      
      // Create a horizantal layout just for the DOB dropdowns
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(5);      
      hBoxDob = new qx.ui.container.Composite(layout);

      // Create two DOB drop down menus, one for month and 
      // the other for year
      this.dobMonthSBox = new qx.ui.form.SelectBox();
 
      // Default Value 
      this.dobMonthSBox.add(new qx.ui.form.ListItem(this.tr("Month")));

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

      hBoxDob.add(this.dobMonthSBox);

      // DOB year list
      this.dobYearSBox = new qx.ui.form.SelectBox();
 
      // Add Years to the box 
      // Default value
      this.dobYearSBox.add(new qx.ui.form.ListItem(this.tr("Year")));

      var todaysDate = new Date();
      for(var i = todaysDate.getFullYear(); i > 1900; i--)
      {
        this.dobYearSBox.add(new qx.ui.form.ListItem(String(i)));
      }

      // Create friendly name to get username field from the FSM
      fsm.addObject("dobYearSBox", 
         this.dobYearSBox,"main.fsmUtils.disable_during_rpc");

      hBoxDob.add(this.dobYearSBox);
      vBoxText.add(hBoxDob); 

      // Create a label for describing the email field
      label = new qx.ui.basic.Label(this.tr("Email:"));
      label.setFont("bold"); 
      vBoxText.add(label);
 
      // Create a vertical layout for the email and checkbox 
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(15);      
      vBoxEmail = new qx.ui.container.Composite(layout);
     
      // Create textfield for entering in a email
      //this.emailField = new qx.ui.form.TextField;
      this.emailField = new qx.ui.basic.Label(""); 
      this.emailField.set(
      {
        maxWidth     : 200
      });
      vBoxEmail.add(this.emailField);      
   
      // Do not let users edit this field for now
      //this.emailField.setReadOnly(true); 

      // Create friendly name to get this option from the FSM
      fsm.addObject("emailField", 
         this.emailField,"main.fsmUtils.disable_during_rpc");

      // Checkbox to show or not show email
      // by deafult this is unchecked 
      this.showEmailCheck = 
        new qx.ui.form.CheckBox(this.tr("Display Email on Public Profile"));

      // Create friendly name to get username field from the FSM
      fsm.addObject("showEmailCheck", 
         this.showEmailCheck,"main.fsmUtils.disable_during_rpc");

      vBoxEmail.add(this.showEmailCheck);
      vBoxText.add(vBoxEmail); 

      // Create a label for describing the location field 
      label = new qx.ui.basic.Label(this.tr("Location:"));
      label.setFont("bold"); 
      vBoxText.add(label);
      
      // Create textfield for entering in a location
      this.locationField = new qx.ui.form.TextField;
      this.locationField.set(
      {
        maxWidth     : 200
      });
      vBoxText.add(this.locationField);      
   
      // Create friendly name to get location field from the FSM
      fsm.addObject("locationField", 
         this.locationField,"main.fsmUtils.disable_during_rpc");

      // Create a label for describing the organization field 
      label = new qx.ui.basic.Label(this.tr("Organization:"));
      label.setFont("bold"); 
      vBoxText.add(label);
      
      // Create textfield for entering in an organization
      this.orgField = new qx.ui.form.TextField;
      this.orgField.set(
      {
        maxWidth     : 200
      });
      vBoxText.add(this.orgField);      
   
      // Create friendly name to get organization field from the FSM
      fsm.addObject("orgField", 
         this.orgField,"main.fsmUtils.disable_during_rpc");

      // Create a label for describing the URL field 
      label = new qx.ui.basic.Label(this.tr("URL:"));
      label.setFont("bold"); 
      vBoxText.add(label);
      
      // Create textfield for entering in a url
      this.urlField = new qx.ui.form.TextField;
      this.urlField.set(
      {
        width     : 300
      });
      vBoxText.add(this.urlField);      
   
      // Create friendly name to get url field from the FSM
      fsm.addObject("urlField", 
         this.urlField,"main.fsmUtils.disable_during_rpc");

      // Layout for bio box
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBio = new qx.ui.container.Composite(layout);

      // Create a label for describing the bio text area
      label = new qx.ui.basic.Label(this.tr("Describe Yourself:"));
      label.setFont("bold"); 
      vBoxBio.add(label); 

      // Create textarea for entering in bio
      this.bioTextArea = new qx.ui.form.TextArea;
      this.bioTextArea.set(
      {
        width        : 300,
        height       : 400,
        maxLength    : 500
      });
      vBoxBio.add(this.bioTextArea);

      // Set friendly name so we can get the text area value later
      fsm.addObject("bioTextArea", 
                    this.bioTextArea,
                    "main.fsmUtils.disable_during_rpc");

      // Warning about character limit
      label = new qx.ui.basic.Label(this.tr("500 Character Limit"));
      vBoxBio.add(label);

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
        maxWidth     : 150
      });
      vBoxBtn.add(new qx.ui.core.Spacer(25)); 
      vBoxBtn.add(this.submitBtn);
      this.submitBtn.addListener("execute", fsm.eventListener, fsm);

      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("saveBtn", 
         this.submitBtn, "main.fsmUtils.disable_during_rpc");

      // Disable button on startup since no changes will have been made
      //this.submitBtn.setEnabled(false);

      // Create a layout to list options for a user
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxOptions = new qx.ui.container.Composite(layout);     

      // Create a label for describing the options section
      label = new qx.ui.basic.Label(this.tr("User Options"));
      label.setFont("bold"); 
      vBoxOptions.add(label); 

      label = new qx.ui.basic.Label(this.tr("Recieve an email if:"));
      vBoxOptions.add(label);       

      // Layout to store both the checkbox and frequency dropdown
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      vBoxOptionLike = new qx.ui.container.Composite(layout);

      // Checkbox to get updates if an app of theirs is liked
      // by deafult this is unchecked 
      this.likedAppCheck = 
        new qx.ui.form.CheckBox(this.tr("Authored app is liked"));

      // Create friendly name to get this option from FSM
      fsm.addObject("likedAppCheck", 
         this.likedAppCheck,"main.fsmUtils.disable_during_rpc");

      // Set Frequency
      this.likedAppUpdateFrequency = new qx.ui.form.SelectBox();
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(this.tr("Every...")));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(1)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(5)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(10)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(25)));
      this.likedAppUpdateFrequency.add(new qx.ui.form.ListItem(String(100))); 

      // Create friendly name to get the frequency from FSM
      fsm.addObject("likedAppUpdateFrequency", 
         this.likedAppUpdateFrequency,"main.fsmUtils.disable_during_rpc");

      // Add to layout
      vBoxOptionLike.add(this.likedAppCheck);
      // Turn of frequency for now 
      //vBoxOptionLike.add(this.likedAppUpdateFrequency);
      vBoxOptions.add(vBoxOptionLike); 

      // Layout to store both the checkbox and frequency dropdown
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      vBoxOptionComment = new qx.ui.container.Composite(layout);

      // Checkbox to get updates if an app of theirs is commented on
      // by deafult this is unchecked 
      this.commentAppCheck = 
        new qx.ui.form.CheckBox(this.tr("Comment on authored app"));

      // Create friendly name to get this option from FSM
      fsm.addObject("commentAppCheck", 
         this.commentAppCheck,"main.fsmUtils.disable_during_rpc");

      // Set Frequency
      this.commentAppUpdateFrequency = new qx.ui.form.SelectBox();
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(this.tr("Every...")));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(1)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(5)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(10)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(25)));
      this.commentAppUpdateFrequency.add(new qx.ui.form.ListItem(String(100))); 

      // Create friendly name to get the frequency from FSM
      fsm.addObject("commentAppUpdateFrequency", 
         this.commentAppUpdateFrequency,"main.fsmUtils.disable_during_rpc");

      // Add to layout
      vBoxOptionComment.add(this.commentAppCheck);
      // Turn of frequency for now
      //vBoxOptionComment.add(this.commentAppUpdateFrequency);
      vBoxOptions.add(vBoxOptionComment); 

      // Layout to store both the checkbox and frequency dropdown
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(15);      
      vBoxOptionDownload = new qx.ui.container.Composite(layout);

      // Checkbox to get updates if an app of theirs is downloaded on
      // by deafult this is unchecked 
      this.downloadAppCheck = 
        new qx.ui.form.CheckBox(this.tr("Download on authored app"));

      // Create friendly name to get this option from FSM
      fsm.addObject("downloadAppCheck", 
         this.downloadAppCheck,"main.fsmUtils.disable_during_rpc");

      // Set Frequency
      this.downloadAppUpdateFrequency = new qx.ui.form.SelectBox();
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(this.tr("Every...")));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(1)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(5)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(10)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(25)));
      this.downloadAppUpdateFrequency.add(new qx.ui.form.ListItem(String(100)));

      // Create friendly name to get the frequency from FSM
      fsm.addObject("downloadAppUpdateFrequency", 
         this.downloadAppUpdateFrequency,"main.fsmUtils.disable_during_rpc");

      // Add to layout
      vBoxOptionDownload.add(this.downloadAppCheck);
      // Turn of frequency for now
      //vBoxOptionDownload.add(this.downloadAppUpdateFrequency);
      vBoxOptions.add(vBoxOptionDownload); 

      // Overall layout
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBox = new qx.ui.container.Composite(layout);

      // Add to hBox text field objects
      hBox.add(vBoxText);

      // Give some flex space
      hBox.add(new qx.ui.core.Spacer(25)); 

      // Add hBox bio field to hBox
      hBox.add(vBoxBio);

      // Give some flex space
      hBox.add(new qx.ui.core.Spacer(25)); 

      // Add options layout to overall layout
      hBox.add(vBoxOptions); 

      // Add to main canvas
      canvas.add(hBox);

      // Add Btn layout
      canvas.add(vBoxBtn); 


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
      var             warnString; 
      var             savedStr;
      var             whoAmI; 

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // Username is already in use
        if (response.data.code == 2)
        {
          // Display warning about this issue
          dialog.Dialog.warning(response.data.message);

          // Change back to original user name
          this.userNameField.setValue(this.oldName);
        }
        else 
        {
          // FIXME: Add the failure to the cell editor window rather than alert
          alert("Async(" + response.id + ") exception: " + response.data);          
        }

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
             warnString = this.tr("You must log in to edit your profile"); 
             dialog.Dialog.warning(warnString);

             break; 
          }

          // Populate fields with data from map
          this.userNameField.setValue(userProfile.displayName);
          this.oldName = userProfile.displayName; 

          this.emailField.setValue(userProfile.email);

          // These fields may be empty, do not display null if they are
          if (userProfile.location != null)
          {
            this.locationField.setValue(userProfile.location);        
          }
          
          if (userProfile.bio != null)
          {
            this.bioTextArea.setValue(userProfile.bio);
          }

          if (userProfile.org != null)
          {
            this.orgField.setValue(userProfile.org); 
          }

          if (userProfile.url != null)
          {
            this.urlField.setValue(userProfile.url); 
          }

          // Only work with date if it has been set
          if (userProfile.birthMonth != null || userProfile.birthMonth == "") 
          {
                  
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

            if (userProfile.birthYear != 0)
            {
              children = this.dobYearSBox.getChildren();
              var date = new Date();
              date = date.getFullYear();
            
              var childToSelect = 
                parseInt(date) - parseInt(userProfile.birthYear); 
              this.dobYearSBox.setSelection([children[childToSelect]]);
            }
          }
   
          // This means show email box is checked 
          if (userProfile.showEmail == 1)
          {
            this.showEmailCheck.setValue(true); 
          }

          // Set user options
          // send email on app likes
          if(userProfile.updateOnAppLike == 1)
          {
            this.likedAppCheck.setValue(true);

            // Set selction on frequency
            var children = this.likedAppUpdateFrequency.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.updateOnAppLikeFrequency)
              {
                this.likedAppUpdateFrequency.setSelection([children[i]]);
                break; 
              }
            }
          }

          // send email on app comments
          if(userProfile.updateOnAppComment == 1)
          {
            this.commentAppCheck.setValue(true);

            // Set selction on frequency
            var children = this.commentAppUpdateFrequency.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.updateCommentFrequency)
              {
                this.commentAppUpdateFrequency.setSelection([children[i]]);
                break; 
              }
            }
          }

          // send email on app downloads
          if(userProfile.updateOnAppDownload == 1)
          {
            this.downloadAppCheck.setValue(true);

            // Set selction on frequency
            var children = this.downloadAppUpdateFrequency.getChildren();
            for(var i = 0; i < children.length; i++)
            {
              if(children[i].getLabel() == userProfile.updateOnAppDownloadFrequency)
              {
                this.downloadAppUpdateFrequency.setSelection([children[i]]);
                break; 
              }
            }
          }

          // All done
          break;

      case "editUserProfile":
        // User submited new profile info, disable submit button
        //this.submitBtn.setEnabled(false);

        // Check to see if name change was successful
        //if (response.data.result.message != null)
        if(false)
        {
          // Name change error 
          dialog.Dialog.warning(response.data.result.message); 
          break; 
        }

        // Popup dialog that info was saved
        savedStr = this.tr("New profile information saved."); 
        dialog.Dialog.alert(savedStr); 
 
        // If the username is changed, change it in the application header
        whoAmI = qx.core.Init.getApplication().getUserData("whoAmI");
        whoAmI.setDisplayName(this.userNameField.getValue().trim());
        whoAmI.setHasSetDisplayName(true);
        
        // change old username value
        this.oldName = this.userNameField.getValue().trim(); 

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
