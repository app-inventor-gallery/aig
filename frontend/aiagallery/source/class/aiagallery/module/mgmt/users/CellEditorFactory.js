/**
 * Cell editor for all cells of the Users table
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * A cell editor factory for Users (all fields)
 */
qx.Class.define("aiagallery.module.mgmt.users.CellEditorFactory",
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
      var             title;
      var             fsm;
      var             bEditing;

      // If there's a cellInfo object provided, we're editing an existing
      // user. Get the row data. Otherwise, we're adding a new user.
      if (cellInfo && cellInfo.row !== undefined)
      {
        // We're editing. Get the current row data.
        bEditing = true;
        dataModel = cellInfo.table.getTableModel();
        rowData = dataModel.getRowDataAsMap(cellInfo.row);
        title = this.tr("Edit User: ") + rowData["email"];
      }
      else
      {
        bEditing = false;
        title = this.tr("Add New User");
        rowData = 
          {
            displayName      : "",
            email            : "",
            id               : "",
            permissions      : "",
            permissionGroups : "",
            status           : ""
          };
      }
      
      var layout = new qx.ui.layout.Grid(9, 2);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 400);
      layout.setSpacing(10);

      // Create the cell editor window, since we need to return it immediately
      cellEditor = new qx.ui.window.Window(title);
      cellEditor.setLayout(layout);
      cellEditor.set(
        {
          width: 650,
          modal: true,
          showClose: false,
          showMaximize: false,
          showMinimize: false,
          padding : 10
        });
      cellEditor.addListener(
        "resize",
        function(e)
        {
          this.center();
        });

      // If we're editing, save the cell info.  We'll need it when the cell
      // editor closes.
      bEditing && cellEditor.setUserData("cellInfo", cellInfo);

      // Add the form field labels
      i = 0;

      [
        this.tr("DisplayName"),
        this.tr("Email"),
        this.tr("Id"),
        this.tr("Permissions"),
        this.tr("Permission Groups"),
        this.tr("Status")
      ].forEach(function(label)
        {
          o = new qx.ui.basic.Label(label);
          o.set(
            {
              allowShrinkX: false,
              paddingTop: 3
            });
          cellEditor.add(o, {row : i++, column : 0});
        });

      // Create the editor field for the user name
      var displayName = new qx.ui.form.TextField("");
      displayName.setValue(rowData["displayName"]);
      cellEditor.add(displayName, { row : 0, column : 1 });
      
      // Create the editor field for the email address
      var email = new qx.ui.form.TextField("");
      email.setValue(rowData["email"]);
      cellEditor.add(email, { row : 1, column : 1 });
      
      // Create the editor field for the email address
      var id = new qx.ui.form.TextField("");
      id.setValue(rowData["id"]);
      cellEditor.add(id, { row : 2, column : 1 });
      
      // If we're editing, don't allow them to change the email or id values
      if (bEditing)
      {
        email.setEnabled(false);
        id.setEnabled(false);
      }
      
      // Create the editor field for permissions
      var permissions = new qx.ui.form.List();
      permissions.setHeight(70);
      permissions.setSelectionMode("multi");

      // Split the existing permissions so we can easily search for them
      var permissionList = rowData["permissions"];

      // Add each of the permission values
      qx.lang.Object.getKeys(aiagallery.dbif.Constants.Permissions).forEach(
        function(perm) 
        {          
          // Pull the permission description into the variable description
          var description = aiagallery.dbif.Constants.Permissions[perm];

          // Create a ListItem with the permission name and description
          var item = new qx.ui.form.ListItem(description + " (" + perm + ")");

          // Set the internal name of the permission to equal the display name
          item.setUserData("internal", perm);

          // Set "description" in userdata of the permission to be the 
          // description of the permission.
          item.setUserData("description", description); 

          // Create a tooltip that describes the permission, then attach it to 
          // the List Item
          var tooltip = new qx.ui.tooltip.ToolTip(description);
          item.setToolTip(tooltip);

          // Add the list item with the attached tool tip to the list
          permissions.add(item);
          
          // Is this permission currently assigned to the user being edited?
          if (qx.lang.Array.contains(permissionList, perm))
          {
            // Yup. Add it to the selection list
            permissions.addToSelection(item);
          }
        });
      
      cellEditor.add(permissions, { row : 3, column : 1 });

      // Create the editor field for permission groups
      var pGroups = new qx.ui.form.List();
      pGroups.setHeight(70);
      pGroups.setSelectionMode("multi");
      
      //Get the possible permission groups
      var pGroupList = cellInfo.table.getUserData("pGroups");

      // Get the groups the user is a part of 
      var userPGroups = rowData["permissionGroups"];

      // Add each of the permission group values
      pGroupList.forEach(function(perm) 
        {          
          // Pull the permission description into the variable description
          var description = perm.description;

          // Create a ListItem with the permission group name and description
          var item = new qx.ui.form.ListItem(description + 
            " (" + perm.name + ")");

          // Set the internal name of the pgroup to equal the display name
          item.setUserData("internal", perm.name);

          // Set "description" in userdata of the permission to be the 
          // description of the permission.
          item.setUserData("description", description); 

          // Create a tooltip that describes the permission, then attach it to 
          // the List Item
          var tooltip = new qx.ui.tooltip.ToolTip(description);
          item.setToolTip(tooltip);

          // Add the list item with the attached tool tip to the list
          pGroups.add(item);
          
          // permission group currently assigned to the user being edited?
          if (qx.lang.Array.contains(userPGroups, perm.name))
          {
            // Yup. Add it to the selection list
            pGroups.addToSelection(item);
          }
        });
      
      cellEditor.add(pGroups, { row : 4, column : 1 });

      var status = new qx.ui.form.SelectBox();

      // Add each of the status values by pulling the array from Constants.js
      qx.lang.Object.getKeys(aiagallery.dbif.Constants.Status).forEach(
        function(stat)
        {
          var             item;

          // Create a new list item with the current status' name
          item = new qx.ui.form.ListItem(stat);
          
          // Set the internal name of the status to the display name for now
          item.setUserData("internal", stat);

          // Add this item to the selectbox
          status.add(item);
          
          // Is this the current status?
          if (rowData["status"] == stat)
          {
            status.setSelection( [ item ] );
          }
        },
        this);
      
      cellEditor.add(status, { row : 5, column : 1 });
      
      // Save the input fields for access by getCellEditorValue() and the FSM
      cellEditor.setUserData("displayName", displayName);
      cellEditor.setUserData("email", email);
      cellEditor.setUserData("id", id);
      cellEditor.setUserData("permissions", permissions);
      cellEditor.setUserData("pgroups", pGroups);
      cellEditor.setUserData("status", status);

      // buttons
      var paneLayout = new qx.ui.layout.HBox();
      paneLayout.set(
        {
          spacing: 4,
          alignX : "right"
        });
      var buttonPane = new qx.ui.container.Composite(paneLayout);
      buttonPane.set(
        {
          paddingTop: 11
        });
      cellEditor.add(buttonPane, {row : 6, column : 0, colSpan : 2});

      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

      var okButton =
        new qx.ui.form.Button("Ok", "icon/22/actions/dialog-ok.png");
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
      
      // Return the appropriate column data.
      return newData[cellEditor.getUserData("cellInfo").col];
    }
  }
});
