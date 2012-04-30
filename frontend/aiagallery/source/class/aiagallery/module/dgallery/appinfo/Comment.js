/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.dgallery.appinfo.Comment",
{
  extend    : qx.ui.container.Composite,
  implement : [qx.ui.form.IModel],
  include   : [qx.ui.form.MModelProperty],
  
  construct : function(data, fsm, treeId, appId)
  {
    var             layout;
    var             flagBtn; 
         
    // Set fsm, treeId, and appId so its available later for comments
    this.fsm = fsm;
    
    // Tree id of the comment 
    this.treeId = treeId; 
    
    // App id on which the comment is located
    this.appId = appId;
    
    // Call the superclass constructor
    this.base(arguments);

    // Don't let the comment be near its container edges
    this.set(
    {
      marginLeft  : 20,
      marginRight : 20
    });

    layout = new qx.ui.layout.Grid(6, 0);
    layout.setRowFlex(0, 1);    // comment text takes up space as needed
    layout.setColumnWidth(0, 40);
    layout.setColumnFlex(2, 1);
    layout.setColumnAlign(0, "right", "middle");
    layout.setRowAlign(0, "left", "bottom");
    layout.setRowAlign(1, "left", "top");
    
    this.setLayout(layout);
    
    // Specify the format of date output
    this.dateFormat = aiagallery.Application.getDateFormat();
    
    // Create each of the child controls
    this.getChildControl("text");
    this.getChildControl("pointer");
    this.getChildControl("displayName");
    this.getChildControl("timestamp");
    this.getChildControl("spacer");
    
    // If we were given the initial data to display...
    if (data)
    {
      // ... then display it now
      this.set(data);
    }
    
  },

  properties :
  {
    visitor :
    {
      check    : "String",
      nullable : false
    },

    text :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyText"
    },
    
    displayName :
    {
      check    : "String",
      nullable : false,
      apply    : "_applyDisplayName"
    },
    
    timestamp :
    {
      nullable  : false,
      transform : "_transformTimestamp",
      apply     : "_applyTimestamp"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;
      var             font;
      var             flagComment; 

      switch(id)
      {
      case "text":
        control = new qx.ui.form.TextArea("hello world");
        control.set(
          {
//            appearance        : "widget",
            decorator         : "app-comment",
            readOnly          : true,
            wrap              : true,
            anonymous         : true,
            autoSize          : true,
            minimalLineHeight : 1
          });
        this._add(control, { row : 0, column : 0, colSpan : 3 });
        break;
        
      case "pointer":
        control = new qx.ui.basic.Image("aiagallery/comment-pointer.png");
        this._add(control, { row : 1, column : 0 });
        break;

      case "displayName":
        // The displayName should be displayed android green
        font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
        font.set(
          {
            color      : "#75940c",     // android-green-dark
            decoration : "underline"
          });
        control = new qx.ui.basic.Label();
        control.set(
          {
            textColor : null,       // don't let it override font's color
            font      : font,
            cursor    : "pointer"
          });

        // Visitor clicks initiate a search for apps of that owner
         control.addListener(
          "click",
          function(e)
          {
            var             query;
            var             displayName;

            // Prevent the default 'click' behavior
            e.preventDefault();
            e.stop();

            // Remove "by" from displayName
            displayName = this.getDisplayName().replace("by ", "");

            query  =
              {
                authorName : displayName
              };
            
            // Initiate a search
            aiagallery.main.Gui.getInstance().selectModule(
              {
                page  : aiagallery.main.Constant.PageName.FindApps,
                query : qx.lang.Json.stringify(query)
              });
          },
          this);

        this._add(control, { row : 1, column : 1 });
                
        // add a flagit button after that
        flagComment = new qx.ui.form.Button();
          flagComment.set(
          {
            maxHeight : 30,
            width     : 20,
            icon      : "aiagallery/flagIcon.png"
          });
          
        // Add to fsm
        this.fsm.addObject("flagComment", flagComment);
        
        // Create listener to catch click and send to fsm
        //flagComment.addListener("execute", this.fsm.eventListener, this.fsm);
        flagComment.addListener(
          "click",
          function(e)
          {
            var             commentToFlagData;
            var             win;
            var             instructionLabel;
            var             instructionText; 
            var             ok; 
            var             cancel;
            var             hBox;
            
            // Pop a window, ask the user to give a reason or cancel
            win = new qx.ui.window.Window(this.tr("Flag A Comment"));
            win.set(
            {
              maxWidth : 500,
              layout : new qx.ui.layout.VBox(30),
              modal  : true
            });
            this.getApplicationRoot().add(win);
            
            instructionText = this.tr("Flagging a comment means you think\n" +
                               "the comment does not reach the level of\n" +
                               "discorse suitable for the gallery.\n <br><br>" +
                               "Please enter a reason why you think this " + 
                               "comment should be removed:");
            
            // Add info about flagging
            instructionLabel = new qx.ui.basic.Label().set(
            {
               value : instructionText,                  
               rich  : true                                   
            });
            win.add(instructionLabel);
            
            // Add the Text Area
            win._reasonField = new qx.ui.form.TextArea();
            win._reasonField.set(
            {
              width  : 120,
              filter : /[a-zA-Z0-9 _-]/
            });
            
            win.add(win._reasonField);
            
            // Create a horizontal box to hold the buttons
            hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
            
            // Add the Ok button
            ok = new qx.ui.form.Button(this.tr("Ok"));
            ok.setWidth(100);
            ok.setHeight(30);
            hBox.add(ok);

            // Allow 'Enter' to confirm entry
            command = new qx.ui.core.Command("Enter");
            ok.setCommand(command);

            // add listener to ok
            ok.addListener(
              "execute", 
              function(e)
              {
                // Package up data for fsm in a map
                commentToFlagData = 
                {
                 "appId" : this.appId,
                 "treeId" : this.treeId,
                 "reason" : win._reasonField.getValue()
                };
                
                // Close the window 
                win.close();
              
                // Clear out text field
                win._reasonField.setValue(""); 
                
                // Fire our own event to capture this click
                this.fsm.fireImmediateEvent("flagComment", this, commentToFlagData);
              },
              this); 
            
            // Add the Cancel button
            cancel = new qx.ui.form.Button(this.tr("Cancel"));
            cancel.setWidth(100);
            cancel.setHeight(30);
            hBox.add(cancel);

            // Allow 'Escape' to cancel
            command = new qx.ui.core.Command("Esc");
            cancel.setCommand(command);

            // Close the window if the cancel button is pressed
            cancel.addListener(
            "execute",
            function(e)
            {
              win.close();
              
              // Clear out text field
              win._reasonField.setValue(""); 
            },
            this);

            // Add the button bar to the window
            win.add(hBox);
            
            // Center and show the window
            win.center(); 
            win.show(); 
          },
          this); 
          
        // Add to comment  
        this._add(flagComment, { row : 1, column : 3 });
 
        break;
        
      case "timestamp":
        control = new qx.ui.basic.Label();
        this._add(control, { row : 1, column : 2 });
        break;
        
      case "spacer":
        control = new qx.ui.core.Spacer(10, 10);
        this.add(control, { row : 2, column : 0 });
        break;
      }

      return control || this.base(arguments, id);
    },

    // Property apply.
    _applyText : function(value, old)
    {
      this.getChildControl("text").setValue(value);
    },

    // Property apply.
    _applyDisplayName : function(value, old)
    {
      this.getChildControl("displayName").setValue(value);
    },

    // Property apply.
    _applyTimestamp : function(value, old)
    {
      this.getChildControl("timestamp").setValue(value);
    },

    // Property transform. Convert from numeric timestamp to formatted string
    _transformTimestamp : function(value)
    {
      return(this.dateFormat.format(new Date(Number(value))));      
    }
  }
});
