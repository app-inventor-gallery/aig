/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the message of the 
 * day management page
 */
qx.Class.define("aiagallery.module.mgmt.motd.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

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
      
      // Buttons
      var             submitBtn;
      var             clearTextBtn;
      
      // Layout
      var             hBoxBtns;
      var             hBox;
      var             layout;
      
      // GUI Elements
      var             label;
      var             motdTextArea; 
      
      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());
 
      // Create vertical layout for the motd box 
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBox = new qx.ui.container.Composite(layout);      
      
      // Create a horizontal box for the buttons
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxBtns = new qx.ui.container.Composite(layout);
      
      // Create a submit motd button, this.tr
      submitBtn = 
        new qx.ui.form.Button(("Submit"));
      submitBtn.set(
      {
        maxHeight : 24,
        width     : 150
      });
      hBoxBtns.add(submitBtn);
      submitBtn.addListener("execute", fsm.eventListener, fsm);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("submitBtn", 
         submitBtn, "main.fsmUtils.disable_during_rpc");

      // Create a clear 
      clearTextBtn = new qx.ui.form.Button(("Clear"));
      clearTextBtn.set(
      {
        maxHeight : 24,
        width     : 100
      });
      hBoxBtns.add(clearTextBtn);
      
      // Clear text box on press
      clearTextBtn.addListener("execute", function(e)
      {
        motdTextArea.setValue("");  
      }, this);
      
      // Create a label for describing the textfields 
      label = new qx.ui.basic.Label("Enter Message of the day here:");
      vBox.add(label);
      
      // Create textarea for entering in a motd
      motdTextArea = new qx.ui.form.TextArea;
      motdTextArea.set(
      {
        maxWidth     : 500,
        height       : 250
      });
      vBox.add(motdTextArea);
      
      // Add buttons to layout
      vBox.add(hBoxBtns);
      
      // Add to the page
      canvas.add(vBox);
      
      
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
