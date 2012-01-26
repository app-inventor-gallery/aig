/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the temporary testing page
 */
qx.Class.define("aiagallery.module.dgallery.myapps.Gui",
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
      var             app;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             header;
      var             group;

      group = new qx.ui.form.RadioGroup();
      group.setAllowEmptySelection(true);

      canvas.setLayout(new qx.ui.layout.VBox());

      // Create a header
      header = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      
      // Create the header based on the widths of the summary fields
      o = new qx.ui.core.Spacer(); // no label for icon
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.icon);
      header.add(o);

      o = new qx.ui.core.Spacer(); // no label for image
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.image1);
      header.add(o);

      o = new qx.ui.basic.Label("Title");
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.title);
      header.add(o);

      o = new qx.ui.basic.Label("Status");
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.status);
      header.add(o);

      o = new qx.ui.basic.Label("Likes");
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.numLikes);
      header.add(o);

      o = new qx.ui.basic.Label("Downloads");
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.numDownloads);
      header.add(o);

      o = new qx.ui.basic.Label("Viewed");
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.numViewed);
      header.add(o);

      o = new qx.ui.basic.Label("Comments");
      o.setWidth(aiagallery.widget.mystuff.Summary.Width.numComments);
      header.add(o);
      
      canvas.add(header);

      app = new aiagallery.widget.mystuff.App();
      app.setGroup(group);
      app.set(
        {
          title        : "My title",
          status       : 5,
          numLikes     : 42,
          numDownloads : 675,
          numViewed    : 78923,
          numComments  : 8
        });
      canvas.add(app);

      app = new aiagallery.widget.mystuff.App();
      app.setGroup(group);
      app.set(
        {
          title        : "A new title",
          status       : 4,
          numLikes     : 0,
          numDownloads : 0,
          numViewed    : 0,
          numComments  : 0
        });
      canvas.add(app);

      app = new aiagallery.widget.mystuff.App();
      app.setGroup(group);
      app.set(
        {
          title        : "His title",
          status       : 3,
          numLikes     : 23,
          numDownloads : 3,
          numViewed    : 4,
          numComments  : 5,
          image1       : "data:image/gif;base64,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"
        });
      canvas.add(app);
      
      // Close the last added app. (Others were closed via radio button mode.)
      app.setValue(false);
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
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
