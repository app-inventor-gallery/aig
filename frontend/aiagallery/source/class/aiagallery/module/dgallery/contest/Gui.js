/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the special contest page
 */
qx.Class.define("aiagallery.module.dgallery.contest.Gui",
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
      var             outerCanvas = module.canvas;
      var             canvas; 
      var             label;
      var             desc;
      var             vBox;
      var             font; 
      var             authorFont; 

      // Put whole page in a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      // Create a layout for this page
      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(30));
      canvas.setLayout(new qx.ui.layout.VBox());  
      scrollContainer.add(canvas, { flex : 1 });     
      
      // Create a large bold font
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(26);

      // Author font
      authorFont = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      authorFont.set(
        {
          color      : "#75940c",     // android-green-dark
          decoration : "underline"
        });
      
      // Intro
      label = new qx.ui.basic.Label("Contest Winners");
      label.setFont(font);
      label.setWidth(500);

      canvas.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "Thanks for all the submissions. We had over 1000!", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc); 
      canvas.add(new qx.ui.core.Spacer(20)); 

      // First place
      font.setSize(24);
      label = new qx.ui.basic.Label("First Place");
      label.setFont(font);

      canvas.add(label);
      canvas.add(new qx.ui.core.Spacer(20)); 

      font.setSize(20);
      label = new qx.ui.basic.Label("First Place High School Division");
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("First Place College Division");
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL >APP NAME</a>",
          rich  : true
        });

      canvas.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("First Place Open Division");
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

      // Second place    
      label = new qx.ui.basic.Label("Second Place");
      font.setSize(24);
      label.setFont(font);
      canvas.add(label);

      label = new qx.ui.basic.Label("Second Place K-8 Division");
      font.setSize(20); 
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label);

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20));  

      label = new qx.ui.basic.Label("Second Place High School Division");
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label);

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label); 

      label = new qx.ui.basic.Label("Second Place College Division");
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("Second Place Open Division");
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(24);
      label.setFont(font);

      canvas.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= URL > APP NAME </a>",
          rich  : true
        });

      canvas.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By PAUL");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      canvas.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "APP DEETS", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      canvas.add(desc);
      canvas.add(new qx.ui.core.Spacer(20)); 

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
    },

    /** Add a link to the user profile*/
    addUserLink : function(label)
    {
      label.addListener(
        "click",
        function(e)
        {
          var query;
          var displayName;

          // Prevent the default 'click' behavior
          e.preventDefault();
          e.stop();

          // Remove "by" from displayName
          displayName = e.getTarget().getValue().substring(8); 

          // Launch user page module
          aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
            displayName);
        }); 
    }
  }
});
