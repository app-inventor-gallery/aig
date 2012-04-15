/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Application management finite state machine
 */
qx.Class.define("aiagallery.module.mgmt.applications.Fsm",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModuleFsm,

  members :
  {
    buildFsm : function(module)
    {
      var fsm = module.fsm;
      var state;
      var trans;

      var FSM = qx.util.fsm.FiniteStateMachine;

      // ------------------------------------------------------------ //
      // State: Idle
      // ------------------------------------------------------------ //

      /*
       * State: Idle
       *
       * Actions upon entry
       *   - if returning from RPC, display the result
       */

      state = new qx.util.fsm.State("State_Idle",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Display the result.  We need to get the request object
            var rpcRequest = this.popRpcRequest();
            console.log(rpcRequest);
            // Otherewise, call the standard result handler
            var gui = aiagallery.module.mgmt.applications.Gui.getInstance();

            gui.handleResponse(module, rpcRequest);

            // Dispose of the request
            if (rpcRequest.request)
            {
              rpcRequest.request.dispose();
              rpcRequest.request = null;
            }
          }

          // Be sure that edit and delete buttons enable status is correct
          var selectionModel = fsm.getObject("table").getSelectionModel();
          var bHasSelection = ! selectionModel.isSelectionEmpty();
          fsm.getObject("edit").setEnabled(bHasSelection);
          fsm.getObject("deleteApp").setEnabled(bHasSelection);
        },

        "events" :
        {
          "execute" :
          {
            // When the Delete Application button is pressed
            "deleteApp" : "Transition_Idle_to_AwaitRpcResult_via_deleteApp"
          },

          "cellEditorOpening" :
          {
            // When a cell is double-clicked, or the Edit button is pressed,
            // either of which open a cell editor for the row data
            "table" : "Transition_Idle_to_EditApp_via_cellEditorOpening"
          },

          // Request to call some remote procedure call which is specified by
          // the event data.
          "callRpc" : "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",

          // When we get an appear event, retrieve the application list
          "appear"    :
          {
            "main.canvas" : "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event, stop our timer
          "disappear" :
          {
            "main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "execute" on "Delete App" button
       *
       * Action:
       *  Issue a remote procedure call to delete the selected app
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deleteApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Determine what app is selected for deletion. We're in
          // single-selection mode, so we can easily reference into the
          // selection array.
          var table = fsm.getObject("table");
          var selectionModel = table.getSelectionModel();
          var selection = selectionModel.getSelectedRanges()[0].minIndex;
          var data = table.getTableModel().getDataAsMapArray()[selection];

          // Issue a Delete App call
          var request =
            this.callRpc(fsm,
                          "aiagallery.features",
                          "mgmtDeleteApp",
                          [
                            data.uid
                          ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteApp");

          // We also need to know what row got deleted
          request.setUserData("deletedRow", selection);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to EditApp
       *
       * Cause: "cellEditorOpening" on the Table. This can occur as a result
       * of either a press of the "Edit" button, or by double-clicking on the
       * row to be edited.
       *
       * Action:
       *  Save the cell editor, to later access its contents
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_EditApp_via_cellEditorOpening",
      {
        "nextState" : "State_EditApp",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var data = event.getData();
          var cellEditor = data.cellEditor;
          var cellInfo = data.cellInfo;

          // Save the cell editor and information of which row we're editing
          this.setUserData("cellEditor", cellEditor);
          this.setUserData("cellInfo", cellInfo);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "genericRpcCall"
       *
       * Action:
       *  Issue the RPC call specified by the event data
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the user data, which includes the parameters to callRpc()
          var userData = event.getData();

          // Issue the specified remote procedure call
          this.callRpc(userData.fsm,
                        userData.service,
                        userData.method,
                        userData.params,
                        userData);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  Start our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Issue the remote procedure call to get the application list.
          // (Maybe could have specified descending sort by flags here,
          // rather than in Gui.js getAppListAll--let the back end do the work.)
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppListAll",
                         [32, null, null, null]);    // image size

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getAppListAll");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "disappear" on canvas
       *
       * Action:
       *  Stop our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_disappear",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
        }
      });

      state.addTransition(trans);

      // ------------------------------------------------------------ //
      // State: EditApp
      // ------------------------------------------------------------ //

      /*
       * State: EditApp
       *
       * Actions upon entry
       *  - If the event that got us here was "completed", update the GUI
       *
       * Cause:
       *  - "execute" on Ok button from cell editor
       *  - "execute" on Cancel button from cell editor
       *  - "completed" event passed through in onentry from the
       *    AwaitRpcResult state
       */

      state = new qx.util.fsm.State("State_EditApp",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          var             rpcRequest;
          var             response;
          var             userData;

          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Determine whether it succeeded. Get the request and
            // response objects.
            rpcRequest = this.popRpcRequest();
            response = rpcRequest.getUserData("rpc_response");

            // Did it fail?
            if (response.type == "failed")
            {
              // Yup. Update the GUI
              var gui = aiagallery.module.mgmt.applications.Gui.getInstance();
              gui.handleResponse(module, rpcRequest);
            }
            else
            {
              // Success! Was it a clearAppFlags RPC?
              if (rpcRequest.getUserData("requestType") == "clearAppFlags")
              {
                // Yes. Reset cell editor flag count...
                var cellEditor = this.getUserData("cellEditor");
                var flagsLabel = cellEditor.getUserData("flagsLabel");
                flagsLabel.setValue("0");

                // ... and dispose of the request
                if (rpcRequest.request)
                {
                  rpcRequest.request.dispose();
                  rpcRequest.request = null;
                }
                // Remain in the EditApp state
              }
              else
              {
                // Not a clearAppFlags RPC. Resubmit the event to move us back to Idle.
                fsm.eventListener(event);

                // Push the RPC request back on the stack so it's available for
                // the next transition.
                this.pushRpcRequest(rpcRequest);
              }
            }
          }
        },

        "events" :
        {
          "execute" :
          {
            // When the Ok button is pressed in the cell editor
            "ok" : "Transition_EditApp_to_AwaitRpcResult_via_ok",

            "cancel" : "Transition_EditApp_to_Idle_via_cancel",

            "removeFlags" : "Transition_EditApp_to_AwaitRpcResult_via_removeFlags"
          },

          // When we received a "completed" event on RPC
          "completed" : "Transition_EditApp_to_Idle_via_completed"
        }
      });

      // Replace the initial Idle state with this one
      fsm.addState(state);

      /*
       * Transition: EditApp to AwaitRpcResult
       *
       * Cause: "execute" on "Ok" button in cell editor
       *
       * Action:
       *  Issue a remote procedure call to save the Application data
       */

      trans = new qx.util.fsm.Transition(
        "Transition_EditApp_to_AwaitRpcResult_via_ok",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;
          var             uid;
          var             appTitle;
          var             description;
          var             selection;
          var             request;
          var             categories;
          var             additionalTags;
          var             tags;
          var             statusName;
          var             status;

          // Retrieve the cell editor and cell info
          cellEditor = this.getUserData("cellEditor");
          cellInfo = this.getUserData("cellInfo");

          // Retrieve the values from the cell editor

          // One-liners
          uid = cellEditor.getUserData("uid");
          appTitle = cellEditor.getUserData("titleField").getValue();
          description = cellEditor.getUserData("descriptionField").getValue();

          // Create the tags list out of a combination of the categories and
          // additionalTags lists.
          categories     = cellEditor.getUserData("categories");
          additionalTags = cellEditor.getUserData("additionalTags");
          tags = [];

          // Add the selected categories
          selection = categories.getSelection();
          selection.forEach(
            function(item)
            {
              // Add this selection to the tags list
              tags.push(item.getLabel());
            });

          // Add the selected additional tags
          selection = additionalTags.getSelectables();
          selection.forEach(
            function(item)
            {
              // Add this selection to the tags list
              tags.push(item.getLabel());
            });

          // Status
          // (Former bug: Status is not inverse to StatusToName (e.g.
          // Pending/"Under Review", and NotSaved/"Not Saved!"), so don't 
          // use it to determine status!)
          statusName = cellEditor.getUserData("statusBox").getSelection()[0].getLabel();
          var StatusToName = aiagallery.dbif.Constants.StatusToName;
          status = StatusToName.indexOf(statusName);

          // Save the request data
          var requestData =
            {
              title       : appTitle,
              description : description,
              tags        : tags,
              status      : status
            };
 
          // Issue an Edit Application call.
          request = this.callRpc(fsm,
                     "aiagallery.features",
                     "mgmtEditApp",
                     [ uid, requestData ]);

          // Save the request data
          request.setUserData("requestData", requestData);

          // When we get the result, we'll need to know what type of request
          // we made.

          request.setUserData("requestType", "mgmtEditApp");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: EditApp to Idle
       *
       * Cause: "execute" on the Cancel button in the cell editor
       *
       * Action:
       *  Cancel editing and close the cell editor
       */

      trans = new qx.util.fsm.Transition(
        "Transition_EditApp_to_Idle_via_cancel",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;

          // Retrieve the cell editor
          cellEditor = this.getUserData("cellEditor");

          // Retrieve the table object
          var table = fsm.getObject("table");

          // Tell the table we're no longer editing
          table.cancelEditing();

          // Remove Fsm objects added by cell editor
          fsm.removeObject("ok");
          fsm.removeObject("cancel");
          //fsm.removeObject("removeImage");
          fsm.removeObject("removeFlags");

          // close the cell editor
          cellEditor.close();

          // We can remove the cell editor and cell info from our own user
          // data now.
          this.setUserData("cellEditor", null);
          this.setUserData("cellInfo", null);
        }
      });

      state.addTransition(trans);


      /*
       * Transition: EditApp to AwaitRpcResult
       *
       * Cause: "execute" on "Remove Flags" button in cell editor
       *
       * Action:
       *  Issue an RPC to remove flags for the app
       */

      trans = new qx.util.fsm.Transition(
        "Transition_EditApp_to_AwaitRpcResult_via_removeFlags",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             uid;
          var             request;

          // Retrieve the UID from the cell editor
          cellEditor = this.getUserData("cellEditor");
          uid = cellEditor.getUserData("uid");
 
          // Issue a Clear Flags call.
          request = this.callRpc(fsm,
                     "aiagallery.features",
                     "clearAppFlags",
                     [ uid ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "clearAppFlags");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: EditApp to Idle
       *
       * Cause: "completed" event from RPC
       *
       * Action:
       *  Write the edited App data to the table
       */

      trans = new qx.util.fsm.Transition(
        "Transition_EditApp_to_Idle_via_completed",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;
          var             rpcRequest;
          var             response;
          var             result;
          var             table;
          var             dataModel;
          var             permissions;
          var             rowData = [];

          // Retrieve the RPC request
          rpcRequest = this.popRpcRequest();

          // Get the cell editor and the request data from the RPC request
          cellEditor = this.getUserData("cellEditor");
          cellInfo = this.getUserData("cellInfo");
          response = rpcRequest.getUserData("rpc_response");
          result = response.data.result;

          // We'll also need the Table object, from the FSM
          table = fsm.getObject("table");

          // Get the table's data model
          dataModel = table.getTableModel();


          // Put the data where it belongs. Preserve hidden data and sort order.
          dataModel.setRowsAsMapArray( [ result ] , cellInfo.row, true, false);

          // Save the data so that the cell editor's getCellEditorValue()
          // method can retrieve it.
          cellEditor.setUserData("newData", result);

          // Remove Fsm objects added by cell editor
          fsm.removeObject("ok");
          fsm.removeObject("cancel");
          //fsm.removeObject("removeImage");
          fsm.removeObject("removeFlags");

          // close the cell editor
          cellEditor.close();

          // We can remove the cell editor and cell info from our own user
          // data now.
          this.setUserData("cellEditor", null);
          this.setUserData("cellInfo", null);

          // Dispose of the request
          if (rpcRequest.request)
          {
            rpcRequest.request.dispose();
            rpcRequest.request = null;
          }
        }
      });

      state.addTransition(trans);


      // ------------------------------------------------------------ //
      // State: AwaitRpcResult
      // ------------------------------------------------------------ //

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);


      // ------------------------------------------------------------ //
      // Epilog
      // ------------------------------------------------------------ //

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
