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

  construct : function(fsm)
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

    // Save the finite state machine reference
    this.__fsm = fsm;

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
    
    // Title
    o = new qx.ui.form.TextField();
    o.set(
      {
        required    : true,
        placeholder : "Enter the application title"
      });
    form.add(o, "Title", null, "title", null,
             { row : 0, column : 0, colSpan : 6 });
    fsm.addObject("txt_title", o);

    // Description
    o = new qx.ui.form.TextArea();
    o.set(
      {
        width       : 200,
        height      : 60,
        required    : true,
        placeholder : "Enter a brief description"
      });
    form.add(o, "Description", null, "description", null,
             { row : 1, column : 0, colSpan : 6, rowSpan : 2 });
    fsm.addObject("txt_description", o);

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
    form.add(o, "Categories", null, "categories", null,
             { row : 3, column : 0, rowSpan : 5 });
    this.categoryController = new qx.data.controller.List(
      new qx.data.Array(categoryList), o);
    fsm.addObject("lst_categories", o);
    
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
    fsm.addObject("txt_newTag", o);


    // Button to add a tag
    o = new qx.ui.form.Button("Add");
    o.set(
      {
        height    : 24,
        maxHeight : 24
      });
    form.addButton(o, { row : 5, column : 3 });
    fsm.addObject("but_addTag", o);

    // Button to delete selected tag(s)
    o = new qx.ui.form.Button("Delete");
    o.set(
      {
        height    : 24,
        maxHeight : 24
      });
    form.addButton(o, { row : 7, column : 5 });
    fsm.addObject("but_deleteTag", o);

    // Application-specific tags
    o = new qx.ui.form.List();
    o.set(
      {
        height        : 100,
        selectionMode : "multi",
        required      : false
      });
    form.add(o, "", null, "tags", null,
             { row : 4, column : 4, rowSpan : 3 });
    fsm.addObject("lst_tags", o);
    

    // Change file name
    o = new qx.ui.form.Button("Select Source File" + required);
    o.addListener(
      "execute",
      function(e)
      {
        this.debug("Selecting source file");
      });
    o.getChildControl("label").setRich(true);
    form.addButton(o, { row : 0, column : 6 });
    fsm.addObject("but_selectSourceFile", o);
    
    // Source file name
    // Title
    o = new qx.ui.form.TextField();
    o.set(
      {
        required    : true,
        placeholder : "Select source file"
      });
    o.addListener(
      "focus",
      function(e)
      {
        var             button = fsm.getObject("but_selectSourceFile");
        this.blur();
        button.focus();
        button.execute();
      });
    form.add(o, null, null, "sourceFileName", null,
             { row : 1, column : 6 });
    fsm.addObject("txt_sourceFileName", o);
    
    // Select image
    o = new qx.ui.form.Button("Select Image" + required);
    o.getChildControl("label").setRich(true);
    form.addButton(o, { row : 3, column : 6 });
    fsm.addObject("but_selectImage", o);
    
    // Image1
    o = new aiagallery.widget.mystuff.FormImage();
    o.set(
      {
        required : true
      });
    form.add(o, null, null, "image1", null,
             { row : 4, column : 6, rowSpan : 4 });

    fsm.addObject("img_image1", o);

    //
    // Add the buttons at the end
    //
    
    // Save
    o = new qx.ui.form.Button("Save");
    o.addListener(
      "execute",
      function(e)
      {
        var             controller;
        var             model;

        // Is the form complete and ready for submission? First test basic
        // validation.
        if (! form.validate())
        {
          // Nope. Get outta here!
          return;
        }
        
        // Ensure that a source file has been selected
        

        // Prepare to retrieve data model
        controller = new qx.data.controller.Form(null, form);
        model = controller.createModel();
        this.debug("model=" + qx.util.Serializer.toJson(model));
      },
      this);
    form.addButton(o);
    fsm.addObject("but_saveApp", o);
    
/*
    // Publish
    o = new qx.ui.form.Button("Publish");
    form.addButton(o);
    fsm.addObject("but_publishApp", o);
*/
    
    // Delete
    o = new qx.ui.form.Button("Delete");
    form.addButton(o);
    fsm.addObject("but_deleteApp", o);

    // Create the rendered form and add it to the HBox
    formRendered = new aiagallery.widget.mystuff.DetailRenderer(form);
    hBox.add(formRendered);
  },
  
  properties :
  {
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
    _applyTitle : function(value, old)
    {
      this.__fsm.getObject("txt_title").setValue(value);
    },
    
    _applyDescription : function(value, old)
    {
      this.__fsm.getObject("txt_description").setValue(value);
    },
    
    _applyTags : function(value, old)
    {
      var             categories = [];
      var             categoryList;
      var             listTags = this.__fsm.getObject("lst_tags");
      var             listCategories = this.__fsm.getObject("lst_categories");

      // Retrieve the list of categories
      categoryList =
        qx.core.Init.getApplication().getRoot().getUserData("categories");

      // For each tag...
      value.forEach(
        function(tagName)
        {
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
        });
      
      // Select the categories for this app
      this.categoryController.setSelection(new qx.data.Array(categories));
    },
    
    _applySourceFileName : function(value, old)
    {
      this.__fsm.getObject("txt_sourceFileName").setValue(value);
    },

    _applyImage1 : function(value, old)
    {
      this.__fsm.getObject("img_image1").setValue(value);
    }
  }
});
