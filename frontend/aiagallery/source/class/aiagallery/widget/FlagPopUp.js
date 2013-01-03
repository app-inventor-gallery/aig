/**
 * Copyright (c) 2013 Derrell Lipman 
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.FlagPopUp",
{
   extend : qx.ui.window.Window,

   construct : function(type, page, cancelFunc)
   {
     // Fields and Labels
     var         instructionText; 
     var         instructionLabel;
     var         _reasonField; 
     
     // Buttons
     var         ok;
     var         cancel;

     // Layouts
     var         hBox; 

     // System 
     var         flagData; 
     var         eventToFire; 
     var         typeStr; 

     // Call base class constructor
     this.base(arguments);

     // Setup the popup
     this.set(
      {
        maxWidth : 500,
        layout : new qx.ui.layout.VBox(30),
        modal  : true
      });
      
      // Set string type based on type of flag we are creating
      switch (type)
      {
        case aiagallery.dbif.Constants.FlagType.App:
          typeStr = "app"; 
          break; 

        case aiagallery.dbif.Constants.FlagType.Comment:
          typeStr = "comment"; 
          break; 

        case aiagallery.dbif.Constants.FlagType.Profile:
          typeStr = "profile"; 
          break; 
      }

      // Based on the type create a message
      instructionText = "Flagging this " + typeStr + " means you think\n the " 
                        + typeStr + " does not reach the"
                        + " level of\n discourse suitable "
                        + "for the gallery.\n <br><br>"
                        +"Please enter a reason why you think this "
                        + typeStr + " should be removed:"; 

      // Add info about flagging
      instructionLabel = new qx.ui.basic.Label().set(
      {
         value : instructionText,                  
         rich  : true                                   
      });
      this.add(instructionLabel);

      // Add the Text Area
      _reasonField = new qx.ui.form.TextArea();
      _reasonField.set(
      {
        width  : 120,
        filter : /[a-zA-Z0-9 _-]/
      });

      this.add(_reasonField);

      // Create a horizontal box to hold the buttons
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

      // Add the Ok button
      ok = new qx.ui.form.Button(this.tr("Ok"));
      ok.set(
      {
        width  : 100,
        height : 30
      });
      hBox.add(ok);

      // Allow 'Enter' to confirm entry
      var command = new qx.ui.core.Command("Enter");
      ok.setCommand(command);

      // add listener to ok
      ok.addListener(
        "execute", 
        function(e)
        {
          switch(type)
          {
            // Switch based on type of flag we are sending
            // Also work specific to the type of flag
            case aiagallery.dbif.Constants.FlagType.Comment:
              // Package up data for fsm in a map
              flagData = 
              {
                "appId"  : page.appId,
                "treeId" : page.treeId,
                "reason" : _reasonField.getValue()
              };

              // Fire our own event to capture this click
              page.fsm.fireImmediateEvent(
                "flagComment", page, flagData);

              // Change label of flag button to show user has flagged comment
              page.flagComment.set(
                {
                  value       : this.tr("Comment Flagged"), 
                  font        : "default", 
                  textColor   : "black", 
                  toolTipText : null
                });

              // Remove listener, if needed, so it cannot be clicked
              if(page.flagCommentListener !== null)
              {
                page.flagComment.removeListenerById(page.flagCommentListener); 
              }

              break;

            case aiagallery.dbif.Constants.FlagType.App:
              flagData = 
              {
                "reason" : _reasonField.getValue()
              };

              // Set this flag data to the searchResult obj
              // this allows us to get it later
              page.setUserData("flagData", flagData);

              // Fire our own event to capture this click
              page.fsm.fireImmediateEvent(
                "flagComment", page, flagData);

              break;

            case aiagallery.dbif.Constants.FlagType.Profile:
              // Package up data for fsm in a map
              flagData = 
              {
                "username" : page.userNameField.getValue(), 
                "reason"     : _reasonField.getValue()
              };

              // Set as user data to get from fsm later
              page.setUserData("flagData", flagData);

              // Fire flag event
              page.fsm.fireImmediateEvent(
                "flagProfile", page, flagData);

              break; 
          }
          // Close the window 
          this.close();

          // Clear out text field
          _reasonField.setValue("");              
 
        },
        this); 

      // Add the Cancel button
      cancel = new qx.ui.form.Button(this.tr("Cancel"));
      cancel.set(
      {
        width  : 100,
        height : 30
      });
      hBox.add(cancel);

      // Allow 'Escape' to cancel
      command = new qx.ui.core.Command("Esc");
      cancel.setCommand(command);

      // Close the window if the cancel button is pressed
      cancel.addListener(
      "execute",
      function(e)
      {
        this.close();

        // Clear out text field
        _reasonField.setValue(""); 

        // Call cancel function if we have it
        if(cancelFunc)
        {
          cancelFunc(); 
        } 
      },
      this);

      // Add the button bar to the window
      this.add(hBox);

      // Center the window
      this.center(); 
   }
});