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

      // Get row data of the app being edited from the cellInfo object
      if (cellInfo && cellInfo.row !== undefined)
      {
        dataModel = cellInfo.table.getTableModel();
        rowData = dataModel.getRowDataAsMap(cellInfo.row);
        windowTitle = this.tr("Edit App: ") + rowData.title;
      }
      else
      // Error--no cellInfo! (shouldn't happen)
      {
// INSERT ERROR CODE HERE!
      }

      // Cell editor layout
// TWEAK ME!
      var layout = new qx.ui.layout.Grid(3, 2);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 400);
      layout.setSpacing(10);

      // Cell editor window
      cellEditor = new qx.ui.window.Window(windowTitle);
      cellEditor.setLayout(layout);
      cellEditor.set(
        {
          width: 600,
          modal: true,
          showClose: false,
          showMaximize: false,
          showMinimize: false,
          padding : 10
        });
      // Center on resize
// NO EFFECT, AS FAR AS I CAN TELL
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
        this.tr("Description")
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
      var descriptionField = new qx.ui.form.TextField("");
      descriptionField.setValue(rowData.description);
      cellEditor.add(descriptionField, { row : 1, column : 1 });

      // Save the input fields for access by getCellEditorValue() and the FSM
      cellEditor.setUserData("titleField", titleField);
      cellEditor.setUserData("descriptionField", descriptionField);

      // Save the uid
      cellEditor.setUserData("uid", rowData.uid);

      // buttons
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
      cellEditor.add(buttonPane, {row:3, column: 0, colSpan: 2});

      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

// Maybe OK button should be on left--not important ATM.
      var okButton =
        new qx.ui.form.Button("Ok", "icon/22/actions/dialog-ok.png");
// Dont' understand next line
// ( http://demo.qooxdoo.org/current/apiviewer/#qx.ui.core.Widget~addState doesn't say much )
      okButton.addState("default");
      fsm.addObject("ok", okButton);
      okButton.addListener("execute", fsm.eventListener, fsm);
      buttonPane.add(okButton);

      var cancelButton =
        new qx.ui.form.Button("Cancel", "icon/22/actions/dialog-cancel.png");
      fsm.addObject("cancel", cancelButton);
      cancelButton.addListener("execute", fsm.eventListener, fsm);
      buttonPane.add(cancelButton);

      return cellEditor;
    },

    // overridden
    getCellEditorValue : function(cellEditor)
    {
      // The new row data was saved by the FSM. Retrieve it.
      var newData = cellEditor.getUserData("newData");

// Not sure what the hell is going on here...
      // Return the appropriate column data.
      return newData[cellEditor.getUserData("cellInfo").col];
    }
  }
});
