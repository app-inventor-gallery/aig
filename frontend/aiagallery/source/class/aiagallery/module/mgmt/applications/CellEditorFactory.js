/**
 * Cell editor for all cells of the Applications table
 *
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * A cell editor factory for Applications (all fields)
 */
qx.Class.define("aiagallery.module.mgmt.applications.CellEditorFactory",
{
  extend    : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,
  include   : [ qx.locale.MTranslation ],

  members :
  {
    // overridden
    createCellEditor : function(cellInfo)
    {
      var             i;
      var             o;
      var             cellEditor;
      var             dataModel;
      var             rowData;
      var             windowTitle;
      var             fsm;
      var             categoryList;
      var             image;
      var             removeImageButton;


      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

      // Get row data of the app being edited from the cellInfo object
      dataModel = cellInfo.table.getTableModel();
      rowData = dataModel.getRowDataAsMap(cellInfo.row);
      windowTitle = this.tr("Edit App: ") + rowData.title;

      // Cell editor layout
// TWEAK ME!
      var layout = new qx.ui.layout.Grid();
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 400);
      layout.setColumnWidth(2, 300);
      layout.setSpacing(10);

      // Cell editor window
      cellEditor = new qx.ui.window.Window(windowTitle);
      cellEditor.setLayout(layout);
      cellEditor.set(
        {
          width: 800,
          modal: true,
          showClose: false,
          showMaximize: false,
          showMinimize: false
        });
      // Initial centering of cell editor window
      cellEditor.addListener(
        "resize",
        function(e)
        {
          this.center();
        });

      // Save cell info, which will be needed when the cell editor closes.
      cellEditor.setUserData("cellInfo", cellInfo);

      // Add form field labels
      i = 0;
      [
        this.tr("Title"),
        this.tr("Description"),
        this.tr("Categories"),
        this.tr("Status")
      ].forEach(function(label)
        {
          o = new qx.ui.basic.Label(label);
          o.set(
            {
              allowShrinkX: false,
              paddingTop: 3
            });
          cellEditor.add(o, {row: i++, column : 0});
        });

      // Create the editor field for the app title
      var titleField = new qx.ui.form.TextField("");
      titleField.setValue(rowData.title);
      cellEditor.add(titleField, { row : 0, column : 1 });

      // Create the editor field for the app description
      var descriptionField = new qx.ui.form.TextArea("");
      descriptionField.setMinHeight(200);
      descriptionField.setMaxHeight(200);
      descriptionField.setValue(rowData.description);
      cellEditor.add(descriptionField, { row : 1, column : 1 });
     
      // Is there an image?
// TESTME:  no image
      if (rowData.image1)
      {
        // Yes--display it with a "Remove Image" button below it.
        layout = new qx.ui.layout.VBox();
        layout.setSpacing(10);
        var vBox = new qx.ui.container.Composite(layout);
        cellEditor.add(vBox, { row : 0, column : 2, rowSpan : 2 });

        // Image
        image = new qx.ui.basic.Image();
        image.set(
          {
            source    : rowData.image1,
            scale     : true,
            minHeight : 250, //200,
            minWidth  : 250, //200,
            maxWidth  : 250, //200,
            maxHeight : 250  //200
          });
        vBox.add(image, { flex : 1 });

/*        // Remove for now--no function
        // "Remove Image" button
        removeImageButton = new qx.ui.form.Button(this.tr("Remove Image"));
        removeImageButton.set(
          {
            maxHeight : 24,
            maxWidth  : 120,
            // Why doesn't "center" make it center horizontally?
            // Oh wait, this is probably telling it to center vertically in its vertical area.
            // So do I need to enclose it in an hbox?
            center    : true
          });
        vBox.add(removeImageButton);

// This won't be passed to FSM if no image; beware possible bug?
        fsm.addObject("removeImageButton",
                       removeImageButton,
                       "main.fsmUtils.disable_during_rpc");
*/
      }


      // Create the editor field for "category" (required) tags which have
      // been stored in the table's user data.
      
      // Get the list of currently-selected tags
      var currentTags = rowData.tags;
      
      // Get the list of possible tags, at least one of which must be selected.
      categoryList =
        qx.core.Init.getApplication().getRoot().getUserData("categories");

      // Create a multi-selection list and add the categories to it.
      var categories = new qx.ui.form.List();
      categories.setHeight(100);
      categories.setSelectionMode("multi"); // allow multiple selections
      categoryList.forEach(function(tagName) 
        {
          var item = new qx.ui.form.ListItem(tagName);
          categories.add(item);
          
          // Is this a current tag of the app being edited?
          if (qx.lang.Array.contains(currentTags, tagName))
          {
            // Yup. Select it.
            categories.addToSelection(item);
          }
        });
      
      cellEditor.add(categories, { row : 2, column : 1, colSpan : 1 });

      //
      // Add a list for editing additional tags
      //
     
      // Create a grid layout for it
      layout = new qx.ui.layout.Grid(4, 4);
      layout.setColumnWidth(0, 60);
      layout.setColumnWidth(1, 55);
      layout.setColumnWidth(2, 50);
      layout.setColumnWidth(3, 65);
      var grid = new qx.ui.container.Composite(layout);
      cellEditor.add(grid, { row : 2, column : 2, colSpan : 1 });

      // We'll want a list of tags
      var additionalTags = new qx.ui.form.List();
      additionalTags.setHeight(75);
      grid.add(additionalTags, { row : 0, column : 0, colSpan : 4});

      
      // Add those tags that are not also categories
      currentTags.forEach(function(tag)
        {
          if (tag != "" && ! qx.lang.Array.contains(categoryList, tag))
          {
            additionalTags.add(new qx.ui.form.ListItem(tag));
          }
        });

      // Create the button to delete the selected tag
      var tagDelete = new qx.ui.form.Button(this.tr("Delete"));
      grid.add(tagDelete, { row : 1, column : 3 });
      
      // Create an input field and button to add a new tag
      var newTag = new qx.ui.form.TextField();
      newTag.setFilter(/[- a-zA-Z0-9]/); // only allow these characters in tags
      
      // Text placeholder for tags field
      newTag.setPlaceholder("add tags");

      grid.add(newTag, { row : 1, column : 1, colSpan : 2});
      var tagAdd = new qx.ui.form.Button(this.tr("Add tag"));
      tagAdd.setEnabled(false);
      grid.add(tagAdd, { row : 1, column : 0 });

      // When the selection changes, determine whether to enable the delete.
      additionalTags.addListener("changeSelection",
        function(e)
        {
          tagDelete.setEnabled(additionalTags.getSelection().length !== 0);
        });

      // Enable the Add button whenever there's data in the text field
      newTag.addListener("input",
        function(e)
        {
          tagAdd.setEnabled(e.getData().length !== 0);
        });

      // When the Add button is pressed, add the item to the list
      tagAdd.addListener("execute",
        function(e)
        {
          additionalTags.add(new qx.ui.form.ListItem(newTag.getValue()));
          newTag.setValue(""); // clear the entered text
        });

      // When the delete button is pressed, delete selection from the list
      tagDelete.addListener("execute",
        function(e)
        {
          additionalTags.remove(additionalTags.getSelection()[0]);
        });


      // Status
      var statusBox = new qx.ui.form.SelectBox();
      var StatusToName = aiagallery.dbif.Constants.StatusToName;

      StatusToName.forEach(function(statusName)
        {
          var item = new qx.ui.form.ListItem(statusName);
          statusBox.add(item);
          if (statusName == StatusToName[rowData.status])
            {
              statusBox.setSelection( [ item  ] );
            }
        });

      cellEditor.add(statusBox, { row : 3, column : 1 });


      // Flags

      // Display number of flags, and a button to remove them
      layout = new qx.ui.layout.Grid();
      layout.setColumnWidth(0, 120);  // "Flags: <n>" label
      layout.setColumnWidth(1, 120);  // "Remove all flags" button
      var flagGrid = new qx.ui.container.Composite(layout);

      layout = new qx.ui.layout.HBox();
      layout.set(
        {
          alignX : "center",
          alignY : "middle",
          spacing : 4         // Makes reasonable space after "Flags: "
        });

      var flagNum = new qx.ui.container.Composite(layout);

      flagNum.add(new qx.ui.basic.Label("Flags: "));

      var numFlags = rowData.numCurFlags;  // Might be null (simData)
      var flagString = qx.lang.Type.isNumber(numFlags) ? numFlags.toString() : '0';
      var flagsLabel = new qx.ui.basic.Label(flagString);

      // FSM will need to be able to reset flag count
      cellEditor.setUserData("flagsLabel", flagsLabel);

      flagNum.add(flagsLabel);

      flagGrid.add(flagNum, { row : 0, column : 0});

      var removeFlagsButton = new qx.ui.form.Button("Remove all flags");
      fsm.addObject("removeFlags",
                    removeFlagsButton,
                    "main.fsmUtils.disable_during_rpc");
      removeFlagsButton.addListener("execute", fsm.eventListener, fsm);
      flagGrid.add(removeFlagsButton, { row : 0, column : 1});
          
// ToDo:  Fsm communication and event listener for flag gui elements
      cellEditor.add(flagGrid, {row: 3, column : 2});


      // "Ok" and "Cancel" buttons
      var buttonLayout = new qx.ui.layout.HBox();
      buttonLayout.set(
        {
          spacing: 4,
          alignX : "right"
        });
      var buttonPane = new qx.ui.container.Composite(buttonLayout);
      buttonPane.set(
        {
          paddingTop: 11
        });
      cellEditor.add(buttonPane, {row: 4, column: 0, colSpan: 2});

// Maybe OK button should be on left--not important ATM.
      var okButton =
        new qx.ui.form.Button("Ok", "icon/22/actions/dialog-ok.png");
      fsm.addObject("ok", okButton, "main.fsmUtils.disable_during_rpc");
      okButton.addListener("execute", fsm.eventListener, fsm);
      buttonPane.add(okButton);

      var cancelButton =
        new qx.ui.form.Button("Cancel", "icon/22/actions/dialog-cancel.png");
      fsm.addObject("cancel", cancelButton, "main.fsmUtils.disable_during_rpc");
      cancelButton.addListener("execute", fsm.eventListener, fsm);
      buttonPane.add(cancelButton);

      // Save the input fields for access by getCellEditorValue() and the FSM
      cellEditor.setUserData("titleField", titleField);
      cellEditor.setUserData("descriptionField", descriptionField);
      cellEditor.setUserData("categories", categories);
      cellEditor.setUserData("additionalTags", additionalTags);
      cellEditor.setUserData("statusBox", statusBox);
      
      // Save the uid
      cellEditor.setUserData("uid", rowData.uid);

      // We'll need the table object in getCellEditorValue()
      cellEditor.setUserData("table", cellInfo.table);

      return cellEditor;
    },

    // overridden
    getCellEditorValue : function(cellEditor)
    {

      // The new row data was saved by the FSM. Retrieve it.
      var newData = cellEditor.getUserData("newData");
      
      // Retrieve the table object and the data model
      var table = cellEditor.getUserData("table");
      var model = table.getTableModel();

      // Determine the column id associated with the edited column
      var id = model.getColumnId(cellEditor.getUserData("cellInfo").col);
      
      // Return the appropriate column data.
      return newData[id];
    }
  }
});
