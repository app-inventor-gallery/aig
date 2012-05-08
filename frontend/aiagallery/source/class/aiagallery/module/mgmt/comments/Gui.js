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
      var             titleLabel;
      var             layout;
      var             scroller;
      var             vBox;
      
      // Create a layout
      canvas.setLayout(new qx.ui.layout.VBox());   
      
      // Create title label
      titleLabel = new qx.ui.basic.Label("Flagged Comments");
      canvas.add(titleLabel);       
      
      // Create the scroller to hold all of the comments
      scroller = new qx.ui.container.Scroll();
      canvas.add(scroller, {flex : 1});
      
      // The Scroller may contain only one container, so create that container.
      vBox = new qx.ui.layout.VBox();     
      this.commentsScrollContainer = 
        new qx.ui.container.Composite(vBox);
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
      var             scrollChildren;
      
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
        
      case "getFlaggedComments":
        // First make sure the commentScrollContainer is clear
        this.commentsScrollContainer.removeAll(); 
        
        // Take the comments that are flagged
        // create new commentDetailBoxes for each of them
        // add them all to the vBox
        result = response.data.result;
        
        //result is a list
        for(i in result)
        {
           // Create a new commentDetailBox object for this comment
          commentDB = new aiagallery.module.dgallery.appinfo.Comment
            (null, fsm, result[i].treeId, result[i].app, true);
          commentDB.setText(result[i].text);
          commentDB.setDisplayName(result[i].displayName);
          commentDB.setTimestamp(result[i].timestamp);

          // Add it to the scroll container
          this.commentsScrollContainer.add(commentDB);    
        }
        
        break; 
        
      // Comment was deemed acceptable so keep it
      case "setCommentActive":
      
        // Pop msg of action
        dialog.Dialog.warning(this.tr("Message Kept")); 
        
        // Get comment info
        result = rpcRequest.getUserData("commentInfo"); 
        
        // Remove from list
        scrollChildren = this.commentsScrollContainer.getChildren();
      
        for(i in scrollChildren)
        {
          if(scrollChildren[i].appId == result.appId && 
             scrollChildren[i].treeId == result.treeId)
          {
            // Remove this from the list
            this.commentsScrollContainer.remove(scrollChildren[i]);
            
            // Found the comment so break
            break;            
          }
        }
      
        break;
        
      case "deleteComment":
      
        // Pop msg of action
        dialog.Dialog.warning(this.tr("Message Deleted")); 
        
        // Get comment info
        result = rpcRequest.getUserData("commentInfo"); 
        
        // Remove from list
        scrollChildren = this.commentsScrollContainer.getChildren();
      
        for(i in scrollChildren)
        {
          if(scrollChildren[i].appId == result.appId && 
             scrollChildren[i].treeId == result.treeId)
          {
            // Remove this from the list
            this.commentsScrollContainer.remove(scrollChildren[i]);
            
            // Found the comment so break
            break;            
          }
        }
      
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
