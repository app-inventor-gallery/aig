/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
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
    this._snapshot = {};

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
        required    : true,
        placeholder : "Enter the application title"
      });
    o.addListener(
      "input",
      function(e)
      {
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
        width       : 200,
        height      : 60,
        required    : true,
        placeholder : "Enter a brief description"
      });
    o.addListener(
      "input",
      function(e)
      {
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
        height        : 100,
        selectionMode : "multi",
        required      : true
      });
    o.addListener("changeSelection", this._changeCategoriesOrTags, this);
    form.add(o, "Categories", null, "categories", null,
             { row : 3, column : 0, rowSpan : 5 });
    this.categoryController = new qx.data.controller.List(
      new qx.data.Array(categoryList), o);
    this.lstCategories = o;
    
    // Tag to add
    o = new qx.ui.form.TextField();
    o.set(
      {
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
        height    : 24,
        maxHeight : 24
      });
    form.addButton(o, { row : 5, column : 3 });
    this.butAddTag = o;

    // Button to delete selected tag(s)
    o = new qx.ui.form.Button("Delete Tag");
    o.set(
      {
        height    : 24,
        maxHeight : 24
      });
    form.addButton(o, { row : 7, column : 5 });
    this.butDeleteTag = o;

    // Application-specific tags
    o = new qx.ui.form.List();
    o.set(
      {
        height        : 100,
        selectionMode : "multi",
        required      : false
      });
    o.addListener("changeSelection", this._changeCategoriesOrTags, this);
    form.add(o, "", null, "tags", null,
             { row : 4, column : 4, rowSpan : 3 });
    this.lstTags = o;
    
    // Source file name
    o = new aiagallery.widget.mystuff.FormFile("Select source file", "source");
    o.set(
      {
        required : true
      });
    form.add(o, null, null, "source", null,
             { row : 0, column : 6, rowSpan : 2 });

    // When the file name changes, begin retrieving the file data
    o.addListener(
      "changeValue",
      function(e)
      {
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


    
    // Image1
    o = new aiagallery.widget.mystuff.FormImage("Select Image", "image1");
    o.set(
      {
        required : true
      });
    form.add(o, null, null, "image1", null,
             { row : 3, column : 6, rowSpan : 5 });

    // When the image changes, display it
    o.addListener(
      "changeValue",
      function(e)
      {
        this.setImage1(e.getData());
      },
      this);
    this.fiImage1 = o;

    //
    // Add the buttons at the end
    //
    
    // Save
    o = new qx.ui.form.Button("Save Application");
    o.set(
      {
        width : 130
      });
    o.addListener(
      "execute",
      function(e)
      {
        var             modelObj;
        var             field;

        // Is the form complete and ready for submission? First test basic
        // validation.
        if (! form.validate())
        {
          // Nope. Get outta here!
          return;
        }
        
        // Retrieve data model
        modelObj = this.getModel();
        
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
            if (qx.lang.Array.equals(modelObj[field], this._snapshot[field]))
            {
              delete modelObj[field];
            }
          }
          else if (modelObj[field] == this._snapshot[field])
          {
            delete modelObj[field];
          }
        }
        
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
        width : 130
      });
    o.addListener(
      "execute",
      function(e)
      {
        // Use the model to reset the form
        this.set(this._snapshot);

        // Reset the status to what it was originally
        this.__container.setStatus(this.getOrigStatus());
      },
      this);
    form.addButton(o);
    this.butReset = o;

    // Delete
    o = new qx.ui.form.Button("Delete Application");
    o.set(
      {
        width : 130
      });
    form.addButton(o);
    this.butDeleteApp = o;

    // Create the rendered form and add it to the HBox
    formRendered = new aiagallery.widget.mystuff.DetailRenderer(form);
    hBox.add(formRendered);
    
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
          this.__container.setStatus(aiagallery.dbif.Constants.Status.Editing);
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

    _changeCategoriesOrTags : function(e)
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
    
    snapshotModel : function()
    {
      // Create a clone of the model
      this._snapshot = qx.lang.Object.clone(this._model, true);
      
      // Save the model's status, for resetting the form
      this.setOrigStatus(this.getStatus());
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
