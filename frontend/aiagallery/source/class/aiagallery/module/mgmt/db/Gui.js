/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the user management 
 */
qx.Class.define("aiagallery.module.mgmt.db.Gui",
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
      var             entityType;
      var             entityTypes;
      var             selEntityTypes;
      var             spacer;
      var             chkUseRootKey;

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox(10));

      // We'll left-justify some buttons in a button row
      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);
      var hBox = new qx.ui.container.Composite(layout);

      // Retrieve all of the entity types
      entityTypes = liberated.dbif.Entity.getEntityTypes();

      // Create a select box for the entity type
      hBox.add(new qx.ui.basic.Label("Entity type: "));
      selEntityTypes = new qx.ui.form.SelectBox();
      selEntityTypes.set(
        {
          height : 20
        });
      selEntityTypes.add(new qx.ui.form.ListItem(""));
      for (entityType in entityTypes)
      {
        selEntityTypes.add(new qx.ui.form.ListItem(entityType));
      }
      selEntityTypes.addListener("changeSelection", fsm.eventListener, fsm);
      fsm.addObject("selEntityTypes", 
                    selEntityTypes,
                    "main.fsmUtils.disable_during_rpc");

      // Add the select box to the hbox
      hBox.add(selEntityTypes);

      // Add a spacer
      spacer = new qx.ui.core.Widget();
      spacer.set(
        {
          minHeight : 1,
          height    : 1
        });
      hBox.add(spacer, { flex : 1 });
      
      // Create a checkbox for use of a root key
      chkUseRootKey = new qx.ui.form.CheckBox("Use root key");
      chkUseRootKey.setValue(true);
      hBox.add(chkUseRootKey);
      fsm.addObject("chkUseRootKey", 
                    chkUseRootKey,
                    "main.fsmUtils.disable_during_rpc");

//      chkUseRootKey.hide();

      // Add the hbox to the page
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
      var             canvas = module.canvas;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             table;
      var             entityType;
      var             entityTypes;
      var             propertyTypes;
      var             model;
      var             columns;
      var             field;

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
      case "getDatabaseEntities":
        // Determine which entity type we're dealing with
        entityType = rpcRequest.getUserData("entityType");
        
        // Is there already a table displayed?
        table = canvas.getUserData("table");
        if (table)
        {
          // ... then remove it
          canvas.remove(table);
          canvas.setUserData("table", null);
        }
        
        // Retrieve the entity type map
        entityTypes = liberated.dbif.Entity.getEntityTypes();
        
        // Retrieve the property types of this entity type
        propertyTypes =
          liberated.dbif.Entity.getPropertyTypes(entityTypes[entityType]);

        // We'll create a new table with the appropriate property types.
        // Generate a simple table model.
        model = new qx.ui.table.model.Simple();
        
        // Build the column list from the property types
        columns = [];
        for (field in propertyTypes.fields)
        {
          // Ignore fields of type Long*
          if (propertyTypes.fields[field] != "LongString")
          {
            columns.push(field);
          }
        }

        // Define the table columns
        model.setColumns(columns, columns);

        // Set all columns editable
        model.setEditable(true);

        // Add the data we just received
        model.setDataAsMapArray(response.data.result);

        // Customize the table column model.  We want one that automatically
        // resizes columns.
        var custom =
        {
          tableColumnModel : function(obj) 
          {
            return new qx.ui.table.columnmodel.Resize(obj);
          }
        };

        // Now that we have a data model, we can use it to create our table.
        table = new aiagallery.widget.Table(model, custom);

        // We'll be receiving events on the object so save its friendly name
        fsm.addObject("table", table, "main.fsmUtils.disable_during_rpc");

        // Also save the FSM in the table, for access by cell editors
        table.setUserData("fsm", fsm);

        // Add the table to the canvas
        canvas.add(table, { flex : 1 });
        
        // Record that it's there so we can delete it when entity type changes
        canvas.setUserData("table", table);

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
