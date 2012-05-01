/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the temporary testing page
 */
qx.Class.define("aiagallery.module.mgmt.comments.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

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
      var             titleLabel;
      var             layout;
      var             scroller;
      
      // Create a layout
      canvas.setLayout(new qx.ui.layout.VBox());   
      
      // Create title label
      titleLabel = new qx.ui.basic.Label("Flagged Comments");
      canvas.add(titleLabel);       
      
      // Create the scroller to hold all of the comments
      scroller = new qx.ui.container.Scroll();
      canvas.add(scroller);
      
      // The Scroller may contain only one container, so create that container.
      this.commentsScrollContainer = 
        new qx.ui.container.Composite(new qx.ui.layout.VBox());
      scroller.add(this.commentsScrollContainer);
      
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
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;
      var             commentDB;
      var             i;
      
      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }
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
        
      case "getPendingComments":
        // Take the comments that are flagged
        // create new commentDetailBoxes for each of them
        // add them all to the vBox
        
        result = response.data.result;
        
        //result is a list
        for(i in result)
        {
           // Create a new commentDetailBox object for this comment
          commentDB = new aiagallery.module.mgmt.comments.CommentDetailBox();
          commentDB.setText(result[i].text);
          commentDB.setDisplayName(result[i].displayName);
          commentDB.setTimestamp(result[i].timestamp);

          // Add it to the scroll container
          this.commentsScrollContainer.add(commentDB);    
        }
        
        break; 
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
