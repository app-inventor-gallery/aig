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

      // Create a label for the DOB field 
      label = new qx.ui.basic.Label(this.tr("Date of Birth:"));
      vBoxText.add(label);
      
      // Create textfield for entering in a DOB
      this.dobField = new qx.ui.form.TextField;
      this.dobField.set(
      {
        maxWidth     : 200
      });
      vBoxText.add(this.dobField);      
   
      // Create friendly name to get username field from the FSM
      fsm.addObject("dobField", 
         this.dobField,"main.fsmUtils.disable_during_rpc");

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
      submitBtn = 
        new qx.ui.form.Button(this.tr("Submit Changes"));
      submitBtn.set(
      {
        maxHeight : 24,
        width     : 150
      });
      vBoxBtn.add(submitBtn);
      submitBtn.addListener("execute", fsm.eventListener, fsm);

      // Disable button on startup since no changes will have been made
      submitBtn.setEnabled(false);

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
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
