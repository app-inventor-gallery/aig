/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */
/*
#ignore(goog.appengine*)
 */

qx.Class.define("aiagallery.widget.mystuff.Detail",
{
  extend : qx.ui.container.Composite,

  construct : function(fsm, container)
  {
    var             o;
    var             hBox;
    var             form;
    var             formRendered;
    var             categoryList;
    var             currentTags;
    var             tempContainer;
    var             required;

    this.base(arguments);

    // Save the finite state machine reference and our container
    this.__fsm = fsm;
    this.__container = container;
    
    // Initialize our data model
    this._model = {};

    // Retrieve the list of categories, at least one of which must be selected
    categoryList =
      qx.core.Init.getApplication().getRoot().getUserData("categories");

    // Use the canvas layout for ourself (which will contain only the hBox)
    this.setLayout(new qx.ui.layout.Canvas());

    // Create a HBox which will be the container for the form
    hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    this.add(hBox, { edge : 20 });

    // Text to add to buttons (which don't provide the 'required' property) to
    // indicate that they are required.
    required = " <span style='color:red'>*</span> ";

    // Create a form
    form = new qx.ui.form.Form();
    
    // Specify the message to display for required fields
    form.getValidationManager().setRequiredFieldMessage(
      "This field is required");
    
    //
    // Add the fields
    //
    
    // UID (never displayed, but part of the data model)
    o = new qx.ui.form.Spinner();
    o.set(
      {
        visibility : "excluded",
        maximum    : Number.MAX_VALUE
      });
    form.add(o, "UID", null, "uid", null,
             { row : 0, column : 100 });
    this.spinUid = o;

    // Title
    o = new qx.ui.form.TextField();
    o.set(
      {
        tabIndex    : 1,
        maxLength   : aiagallery.dbif.Constants.FieldLength.Title,
        width       : 200,
        maxWidth    : 200,
        required    : true,
        placeholder : "Enter the application title"
      });
    o.addListener(
      "input",
      function(e)
      {
        // Save the new title
        this.setTitle(e.getData());
      },
      this);
    form.add(o, "Title", null, "title", null,
             { row : 0, column : 0, colSpan : 6 });
    this.txtTitle = o;

    // Description
    o = new qx.ui.form.TextArea();
    o.set(
      {
        tabIndex    : 2,
        maxLength   : aiagallery.dbif.Constants.FieldLength.Description,
        height      : 60,
        required    : true,
        placeholder : "Enter a brief description"
      });
    o.addListener(
      "input",
      function(e)
      {
        // Save the new description
        this.setDescription(e.getData());
      },
      this);
    form.add(o, "Description", null, "description", null,
             { row : 1, column : 0, colSpan : 6, rowSpan : 2 });
    this.txtDescription = o;

    // Create a temporary container for a spacer, a label, and a spacer
    tempContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    
    // Add the left spacer
    tempContainer.add(new qx.ui.core.Spacer(), { flex : 1 });

    // Button to add a tag
    o = new qx.ui.basic.Label("Tags :");
    tempContainer.add(o);

    // Add the right spacer
    tempContainer.add(new qx.ui.core.Spacer(), { flex : 1 });

    form.addButton(tempContainer, { row : 3, column : 2, colSpan : 4 });

    // Create a multi-selection list and add the categories to it.
    o = new qx.ui.form.List();
    o.set(
      {
        tabIndex      : 3,
        width         : 150,
        height        : 100,
        selectionMode : "multi",
        required      : true
      });
    o.addListener("changeSelection", this._changeCategories, this);
    form.add(o, "Categories", null, "categories", null,
             { row : 3, column : 0, rowSpan : 5 });
    this.categoryController = new qx.data.controller.List(
      new qx.data.Array(categoryList), o);
    this.lstCategories = o;
    
    // Tag to add
    o = new qx.ui.form.TextField();
    o.set(
      {
        tabIndex    : 5,
        width       : 150,
        placeholder : "Enter a new tag"
      });
    form.getValidationManager().add(
      o,
      function(value, item)
      {
        if (value != null && value.length != 0)
        {
          throw new qx.core.ValidationError("Add this tag?");
        }
        return true;
      });
    form.add(o, "", null, "newTag", null,
             { row : 4, column : 2 });
    this.txtNewTag = o;


    // Button to add a tag
    o = new qx.ui.form.Button("Add");
    o.set(
      {
        tabIndex  : 6,
        height    : 24,
        maxHeight : 24
      });
    o.addListener(
      "execute",
      function(e)
      {
        var             existingTags;
        var             newTags;
        var             newValue;

        // Get the value being added
        newValue = this.txtNewTag.getValue();
        
        // Ensure there's something there
        if (! newValue || newValue.length == 0)
        {
          // Nothing to do
          return;
        }

        // Get the current list of tags
        existingTags = this.getTags();
        
        // Is the tag being added already in the list?
        if (! qx.lang.Array.contains(existingTags, newValue))
        {
          // Nope, it's a new tag. Clone the tag list.
          newTags = qx.lang.Array.clone(existingTags);
          
          // Add the new one to the tag list
          newTags.push(this.txtNewTag.getValue());
          
          // Save the new set of tags
          this.setTags(newTags);
        }
        
        // Clear out the text field
        this.txtNewTag.setValue(null);
      },
      this);
    form.addButton(o, { row : 5, column : 3 });
    this.butAddTag = o;

    // Application-specific tags
    o = new qx.ui.form.List();
    o.set(
      {
        tabIndex      : 7,
        width         : 150,
        height        : 100,
        selectionMode : "single",
        required      : false
      });
    form.add(o, "", null, "tags", null,
             { row : 4, column : 4, rowSpan : 3 });
    this.lstTags = o;
    
    // Button to delete selected tag(s)
    o = new qx.ui.form.Button("Delete Tag");
    o.set(
      {
        tabIndex  : 8,
        height    : 24,
        maxHeight : 24
      });
    o.addListener(
      "execute",
      function(e)
      {
        var             existingTags;
        var             selectedTags;
        var             newTags;

        // Get the current list of tags
        existingTags = this.getTags();
        
        // Get the tag to be deleted
        selectedTags = this.lstTags.getSelection();
        
        // Is there a selection?
        if (selectedTags.length == 0)
        {
          // Nope. Nothing to do.
          return;
        }
        
        // Clone the tags list
        newTags = qx.lang.Array.clone(existingTags);
        
        // Remove the selected tag
        qx.lang.Array.remove(newTags, selectedTags[0].getLabel());
        
        // Save the new set of tags
        this.setTags(newTags);
      },
      this);
    form.addButton(o, { row : 7, column : 5 });
    this.butDeleteTag = o;

    // Source file name
    o = new aiagallery.widget.mystuff.FormFile("Select source file", "source");
    o.set(
      {
        tabIndex  : 9,
        focusable : false,
        required  : true
      });
    form.add(o, null, null, "source", null,
             { row : 0, column : 6, rowSpan : 2 });

    // When the file name changes, begin retrieving the file data
    o.addListener(
      "changeValue",
      function(e)
      {
        // Save the new source file name
        this.setSourceFileName(e.getData());
      },
      this);
    o.addListener(
      "changeContent",
      function(e)
      {
        this.setSource(e.getData());
      },
      this);
    this.ffSource = o;


    // ********* beta002 start *********
    // Objective: add app upload instructions.

//    form.add(o, "This is a reminder about file upload", null, "sourceprompt", null,
//             { row : 1, column : 6, rowSpan : 1 });
//    o = new qx.ui.basic.Label("This is a reminder about file upload");
//    form.add(o, "This is a reminder about file upload", null, "sourceprompt", null,
//             { row : 0, column : 6, rowSpan : 1 });

    // Create a temporary container for a spacer, a label, and a spacer
    tempContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());

    // Add the left spacer
    tempContainer.add(new qx.ui.core.Spacer(), { flex : 1 });

    // Add imagebutton
    o = new qx.ui.basic.Image("aiagallery/question_blue.png");
    tempContainer.add(o);
    o.set(
      {
	focusable : true
      });
    this.sourceFilePrompt = o;

    // Add the right spacer
    tempContainer.add(new qx.ui.core.Spacer(), { flex : 1 });
    form.addButton(tempContainer, { row : 0, column : 7, rowSpan : 1 });

    // bind onClick event for the popup
//    sourceFileMessage = "Please upload the source code (.zip file) for an App Inventor app. To create this file in App Inventor, go to the My Projects page, select the project you want, then  choose "Other Actions" and select "Download Source". Do not open the downloaded zip file but upload it here directly.";
//    this.sourceFilePrompt.addListener("click", function(e){ alert(sourceFileMessage); }, this);

    // define the popup we need
    var sourceFilePopup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
        backgroundColor: "#FFFAD3",
        padding: [2, 4],
        offset : 3,
        offsetBottom : 20
    });

    // add a label widget to the popup
    sourceFilePopup.add(new qx.ui.basic.Label().set({ 
	value: "Please upload the source code (.zip file) for an App Inventor app. To create this file in App Inventor, go to the My Projects page, select the project you want, then  choose 'Other Actions' and select 'Download Source'. Do not open the downloaded zip file but upload it here directly.",
        rich : true,
	width: 300 
    }));

    // bind onClick event for the popup
    this.sourceFilePrompt.addListener("click", function(e)
    {
        sourceFilePopup.placeToMouse(e);
        sourceFilePopup.show();
    }, this);
        
    // ********* beta002 end *********

        

    // ********* beta002 end *********


    
    // Image1
    o = new aiagallery.widget.mystuff.FormImage("Select Image", "image1");
    o.set(
      {
        tabIndex  : 10,
        focusable : false,
        required  : true
      });
    form.add(o, null, null, "image1", null,
             { row : 3, column : 6, rowSpan : 5 });

    // When the image changes, display it
    o.addListener(
      "changeValue",
      function(e)
      {
        // Save the new image
        this.setImage1(e.getData());
      },
      this);
    this.fiImage1 = o;



    // ********* beta002 start *********
    // Objective: add app upload instructions.

    // Create a temporary container for a spacer, a label, and a spacer
    tempContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());

    // Add the left spacer
    tempContainer.add(new qx.ui.core.Spacer(), { flex : 1 });

    // Add imagebutton
    o = new qx.ui.basic.Image("aiagallery/question_blue.png");
    tempContainer.add(o);
    o.set(
      {
	focusable : true
      });
    this.selectImagePrompt = o;

    // Add the right spacer
    tempContainer.add(new qx.ui.core.Spacer(), { flex : 1 });
    form.addButton(tempContainer, { row : 3, column : 7, rowSpan : 1 });

    // bind onClick event for the popup
//    selectImageMessage = "The image you upload will appear on the app's page and all search screens. It will be scaled into a 180*230 image. Typically the image is a screenshot or an icon if you've created one.";
//    this.selectImagePrompt.addListener("click", function(e){ alert(selectImageMessage); }, this);

    // define the popup we need
    var selectImagePopup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
        backgroundColor: "#FFFAD3",
        padding: [2, 4],
        offset : 3,
        offsetBottom : 20
    });

    // add a label widget to the popup
    selectImagePopup.add(new qx.ui.basic.Label().set({ 
	value: "The image you upload will appear on the app's page and all search screens. It will be scaled into a 180*230 image. Typically the image is a screenshot or an icon if you've created one. The file size limit is " + aiagallery.main.Constant.MAX_IMAGE_FILE_SIZE/1024 + " kb.",
        rich : true,
	width: 300 
    }));

    // bind onClick event for the popup
    this.selectImagePrompt.addListener("click", function(e)
    {
        selectImagePopup.placeToMouse(e);
        selectImagePopup.show();
    }, this);
        
    // ********* beta002 end *********



    //
    // Add the buttons at the end
    //
    
    // Save
    o = new qx.ui.form.Button("Save Application");
    o.set(
      {
        tabIndex : 11,
        width    : 130
      });
    o.addListener(
      "execute",
      function(e)
      {
        var             modelObj;
        var             field;
        var             modelJson;
        var             snapshotJson;

        // Is the form complete and ready for submission? First test basic
        // validation.
        if (! form.validate())
        {
          // Nope. Get outta here!
          return;
        }
        
        // Retrieve the model and most recent snapshot, in JSON format
        modelJson = this.getModelJson();
        snapshotJson = this.getSnapshotJson();

        // Has anything changed
        if (modelJson == snapshotJson)
        {
          // Nope. We have nothing to do.
          return;
        }

        // Retrieve a copy of the data model
        modelObj = qx.lang.Object.clone(this.getModel(), true);
        
        // Check each field in the model to see if it has changed since the
        // original model was created (when the "appear" event occurred). If
        // it has not changed, remove it from our current model object. What
        // we'll be left with is only fields that have changed (and the uid).
        for (field in modelObj)
        {
          if (field == "uid")
          {
            // Do not delete the uid field
            continue;
          }
          else if (qx.lang.Type.isArray(modelObj[field]))
          {
            if (this._snapshot[field] &&
                qx.lang.Array.equals(modelObj[field], this._snapshot[field]))
            {
              delete modelObj[field];
            }
          }
          else if (modelObj[field] == this._snapshot[field])
          {
            delete modelObj[field];
          }
        }
        
        // Change the status to Uploading to provide some feedback
        this.__container.setStatus(aiagallery.dbif.Constants.Status.Uploading);

        // Fire an event with the changed data
        this.fireDataEvent("saveApp",
                           {
                             model : modelObj, 
                             app   : container
                           });
      },
      this);
    form.addButton(o);
    this.butSaveApp = o;
   
    this.addListener("saveApp", this.__fsm.eventListener, this.__fsm);
    
    o = new qx.ui.form.Button("Reset");
    o.set(
      {
        tabIndex : 12,
        width    : 130
      });
    o.addListener(
      "execute",
      function(e)
      {
        // Use the model to reset the form
        this.set(this._snapshot);

        // Reset the status to what it was originally
        this.__container.setStatus(this.getOrigStatus());
        
        // Save a new snapshot
        this.snapshotModel();
      },
      this);
    form.addButton(o);
    this.butReset = o;

    // Delete. The button's label is reset to "Delete Application" when a uid
    // is specified, meaning that there actually is an application to be
    // deleted.
    o = new qx.ui.form.Button(this.tr("Discard"));
    o.set(
      {
        tabIndex : 13,
        width    : 130
      });
    o.addListener(
      "execute",
      function(e)
      {
        var             uid = this.getUid();

        // If this is a new app...
        if (uid === null)
        {
          // ... then just remove this App object
          container.getLayoutParent().remove(container);
          container.dispose();
          return;
        }
        
        // Confirm that they really want to delete this application
        dialog.Dialog.confirm(
          this.tr(
            "Really delete application") + 
            " '" + this.getOrigTitle() + "'?",
          function(result)
          {
            // If they confirmed the deletion...
            if (result)
            {
              // ... then fire an event to the FSM to delete the app
              this.fireDataEvent("deleteApp",
                                 {
                                   uid   : uid,
                                   app   : container
                                 });
            }
          },
          this);
      },
      this);
    form.addButton(o);
    this.butDeleteApp = o;

    this.addListener("deleteApp", this.__fsm.eventListener, this.__fsm);

    // Create the rendered form and add it to the HBox
    formRendered = new aiagallery.widget.mystuff.DetailRenderer(form);
    hBox.add(formRendered);
    
    this.addListener(
      "appear",
      function(e)
      {
        var             modelJson;
        var             snapshotJson;

        // Issue an async request to create a channel
        // so the user can receive a response back when
        // the app has been uploaded. 
        this._createChannel(); 

        // Set the focus to the first field
        this.txtTitle.focus();

        // If the status isn't already NotSaved...
        if (this.__container.getStatus() != 
            aiagallery.dbif.Constants.Status.NotSaved)
        {
          // ... then we don't need to do anything special right now
          return;
        }

        // Retrieve the model and most recent snapshot, in JSON format
        modelJson = this.getModelJson();
        snapshotJson = this.getSnapshotJson();

        // Has anything changed
        if (modelJson != snapshotJson)
        {
          // Yup. Set the status so they know to come back here to finish it.
          this.__container.setStatus(aiagallery.dbif.Constants.Status.Editing);
        }
        else
        {
          // Reset the status to what it was originally
          this.__container.setStatus(this.getOrigStatus());
        }
      },
      this);

    this.addListener(
      "disappear",
      function(e)
      {
        var             modelJson;
        var             snapshotJson;

        // If they're editing something that's known to be incomplete...
        if (this.__container.getStatus() == 
            aiagallery.dbif.Constants.Status.Incomplete)
        {
          // ... then just leave the status as is
          return;
        }

        // Retrieve the model and most recent snapshot, in JSON format
        modelJson = this.getModelJson();
        snapshotJson = this.getSnapshotJson();

        // Has anything changed
        if (modelJson != snapshotJson)
        {
          // Yup. Set the status so they know to come back here to finish it.
          this.__container.setStatus(aiagallery.dbif.Constants.Status.NotSaved);
        }
        else
        {
          // Reset the status to what it was originally
          this.__container.setStatus(this.getOrigStatus());
        }
      },
      this);

  },
  
  events :
  {
    /** Fired when the Save button is pressed, and no validation errors */
    saveApp : "qx.event.type.Data",

    /** Fired when the Delete button is pressed, and has been confimed */
    deleteApp : "qx.event.type.Data"
  },

  properties :
  {
    uid :
    {
      nullable : false,
      init     : null,
      apply    : "_applyUid"
    },

    status :
    {
      check : "Number"
    },

    origStatus :
    {
      check    : "Number",
      nullable : false,
      init     : null
    },

    title :
    {
      check : "String",
      apply : "_applyTitle"
    },

    description :
    {
      check : "String",
      apply : "_applyDescription"
    },
    
    tags :
    {
      check : "Array",
      apply : "_applyTags"
    },
    
    source :
    {
      check : "String",
      apply : "_applySource"
    },

    sourceFileName :
    {
      check : "String",
      apply : "_applySourceFileName"
    },
    
    image1 :
    {
      check : "String",
      apply : "_applyImage1"
    }
  },

  members :
  {
    __fsm       : null,
    __container : null,

    _watchForEdits : function(e)
    {
      var             modelJson;
      var             snapshotJson;

      // Retrieve the model and most recent snapshot, in JSON format
      modelJson = this.getModelJson();
      snapshotJson = this.getSnapshotJson();

      // Has anything changed
      if (modelJson != snapshotJson)
      {
        // Yup. Set the status so they know it
        this.__container.setStatus(aiagallery.dbif.Constants.Status.Editing);
      }
      else
      {
        // They just changed it back to its original state
        this.__container.setStatus(this.getOrigStatus());
      }
    },

    _changeCategories : function(e)
    {
      var             tags;

      // Initialize to an empty list of selected categories
      tags = [];
      
      // For each *selected* item in the categories list...
      this.lstCategories.getSelection().forEach(
        function(listItem)
        {
          // ... add its label to the model list
          tags.push(listItem.getLabel());
        },
        this);

      // For each and every item in the tags list...
      this.lstTags.getChildren().forEach(
        function(listItem)
        {
          // ... add its label to the model list
          tags.push(listItem.getLabel());
        },
        this);
      
      this.setTags(tags);
    },

    _applyUid : function(value, old)
    {
      this._model.uid = value;
      this.spinUid.setValue(value);
      
      // Set the Delete Application button's label properly since there's an
      // app here to be deleted.
      this.butDeleteApp.setLabel(this.tr("Delete Application"));
    },

    _applyTitle : function(value, old)
    {
      this._model.title = value;
      this.txtTitle.setValue(value);
    },
    
    _applyDescription : function(value, old)
    {
      this._model.description = value;
      this.txtDescription.setValue(value);
    },
    
    _applyTags : function(value, old)
    {
      var             categories = [];
      var             categoryList;
      var             listTags = this.lstTags;
      var             listCategories = this.lstCategories;

      // Initialize the model to an empty array
      this._model.tags = [];

      // Retrieve the list of categories
      categoryList =
        qx.core.Init.getApplication().getRoot().getUserData("categories");

      // Clear out the tags list
      listTags.removeAll();

      // For each tag...
      value.forEach(
        function(tagName)
        {
          // Add the tag to our model
          this._model.tags.push(tagName);

          // Is this tag really a category?
          if (qx.lang.Array.contains(categoryList, tagName))
          {
            // Yup. Add the category to a list for later processing
            categories.push(tagName);
          }
          else if (tagName.charAt(0) == "*")
          {
            // Do not list special tags such as *Featured*
          }
          else
          {
            // It's not a category. Add it as a list item.
            listTags.add(new qx.ui.form.ListItem(tagName));
          }
        },
        this);
      
      // Select the categories for this app
      this.categoryController.setSelection(new qx.data.Array(categories));
    },
    
    _applySourceFileName : function(value, old)
    {
      this._model.sourceFileName = value;
      this.ffSource.setValue(value);
    },

    _applySource : function(value, old)
    {
      this._model.source = value;

      // read-only from this.ffSource so no need to set anything.
    },

    _applyImage1 : function(value, old)
    {
      this._model.image1 = value;
      this.fiImage1.setValue(value);
    },

     // Create a channel for communication to this client from the server.
     // If a channel exists already we do not need to do this.
     _createChannel : function()
    {
      var             _this = this; 

      if (null != qx.core.Init.getApplication().getUserData("channelSocket")) {
          // A channel already exists, just return. 
          return;
      }

      // Load the Channel API. If we're on App Engine, it'll succeed
      qx.util.TimerManager.getInstance().start(
      function(userData, timerId)
      {
        var             rpc;
        rpc = new qx.io.remote.Rpc();
        rpc.setProtocol("2.0");
        rpc.set(
          {
            url         : aiagallery.main.Constant.SERVICES_URL,
            timeout     : 30000,
            crossDomain : false,
            serviceName : "aiagallery.features"
          });

      var loader = new qx.bom.request.Script();
      loader.onload = 
      function createChannel()
      {
        // Did we successfully load the Channel API?
        switch(loader.status)
        {
        case 200:
          // Found the Channel API. Reqest a server push channel
          rpc.callAsync(
            function(e)
            {
              var             channel;
              var             socket;
              var             channelMessage;

              // Did we get a channel token?
              if (! e)
              {
                // Nope. Nothing to do.
                //_this.warn("getChannelToken: " +
                //      "Received no channel token");
                return;
              }

              channelMessage = function(type, data)
              {
                // If this is an "open" message...
                if (type == "open")
                {
                  qx.util.TimerManager.getInstance().start(
                    function()
                    {
                      var             socket;
 
                      // ... then start a timer to close the channel
                      // in a little less than two hours, to avoid the
                      // server from closing the channel
                      socket = qx.core.Init.getApplication().getUserData("channelSocket"); 
                      if (socket)
                      {
                        socket.close();
                      }
                      qx.core.Init.getApplication().setUserData("channelSocket", null);
                      socket = null;
 
                      // Re-establish the channel
                      qx.util.TimerManager.getInstance().start(
                        createChannel,
                        0,
                        _this,
                        null,
                        5000);
                    },
                    (2 * 1000 * 60 * 60) - (5 * 1000 * 60),
                    this);
                }
 
                if (typeof data == "undefined")
                {
                  _this.debug("Channel Message (" + type + ")");
                }
                else
                {
                  _this.debug(liberated.dbif.Debug.debugObjectToString(
                                data,
                                "Channel Message (" + type + ")"));
                }
              };
 
              // If there was a prior channel open...
              socket = qx.core.Init.getApplication().getUserData("channelSocket");
              if (socket)
              {
                // ... then close it
                socket.close();
              }
 
              // Open a channel for server push
              channel = new goog.appengine.Channel(e);
              socket = channel.open();
 
              // Save the channel socket
              qx.core.Init.getApplication().setUserData("channelSocket", socket);
 
              // When we receive a message on the channel, post a
              // message on the message bus.
              socket.onmessage = function(data)
              {
                var             messageBus;
 
                // Parse the JSON message
                data = qx.lang.Json.parse(data.data);
                channelMessage("message", data);
 
                // Dispatch a message for any subscribers to
                // this type.
                messageBus = qx.event.message.Bus.getInstance();
                messageBus.dispatchByName(data.type, data);
              };
 
              // Display a message when the channel is open
              socket.onopen = function(data)
              {
                channelMessage("open", data);
              };
 
              // Display a message upon error
              socket.onerror = function(data)
              {
                channelMessage("error", data);
 
                // There's no longer a channel socket
                qx.core.Init.getApplication().setUserData("channelSocket", null);
                socket = null;
 
                // Re-establish the channel
                qx.util.TimerManager.getInstance().start(
                  createChannel,
                  0,
                  _this,
                  null,
                  5000);
              };
 
              // Display a message when the channel is closed
              socket.onclose = function(data)
              {
                channelMessage("close", data);
 
                // There's no longer a channel socket
                qx.core.Init.getApplication().setUserData("channelSocket", null);
                socket = null;
 
                // Re-establish the channel
                qx.util.TimerManager.getInstance().start(
                  createChannel,
                  0,
                  _this,
                  null,
                  5000);
              };
            },
            "getChannelToken",
            []);
            break;

          default:
            // Nope.
            this.warn(loader.status + ": Failed to load Channel API");
             break;
          } 
        };
 
        loader.open("GET", "/_ah/channel/jsapi");
        loader.send();

      });

     return; 
    },
    
    snapshotModel : function()
    {
      // If this is our first time in here...
      if (! this._snapshot)
      {
        // ... then establish listeners to watch for edits
        this.txtTitle.addListener("input",
                                  this._watchForEdits,
                                  this);
        this.txtDescription.addListener("input",
                                        this._watchForEdits,
                                        this);
        this.lstCategories.addListener("changeSelection",
                                       this._watchForEdits,
                                       this);
        this.butAddTag.addListener("execute",
                                   this._watchForEdits,
                                   this);
        this.butDeleteTag.addListener("execute",
                                      this._watchForEdits,
                                      this);
        this.ffSource.addListener("changeValue",
                                  this._watchForEdits,
                                  this);
        this.fiImage1.addListener("changeValue",
                                  this._watchForEdits,
                                  this);
      }

      // Save the model's status, for resetting the form
      this.setOrigStatus(this.getStatus());

      // Create a clone of the model
      this._snapshot = qx.lang.Object.clone(this._model, true);
    },

    getOrigTitle : function()
    {
      return this._snapshot ? this._snapshot.title : null;
    },

    getModel : function()
    {
      return this._model;
    },

    getModelJson : function()
    {
      return qx.lang.Json.stringify(this._model, null, 2);
    },
    
    getSnapshot : function()
    {
      return this._snapshot;
    },
    
    getSnapshotJson : function()
    {
      return qx.lang.Json.stringify(this._snapshot, null, 2);
    }
  }
});

