/**
 * Copyright (c) 2012 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for a user's public info page
 */
qx.Class.define("aiagallery.module.dgallery.userinfo.Gui",
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

      // Layouts
      var             layout; 
      //var             hBoxDataPieceName;
      var             hBoxDataPieceDOB;
      var             hBoxDataPieceEmail;
      var             hBoxDataPieceLoc;
      var             hBoxDataPieceOrg;
      var             hBoxDataPieceUrl;
      var             vBoxText;
      var             vBoxBio;
      var             hBox; 
      var             vBoxBtn;

      // GUI objects 
      var             label;
      var             submitBtn;

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());   

      // Create a large bold font
      var font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(26);
   
      // Create a vertical layout just for the labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxText = new qx.ui.container.Composite(layout);
      
      // Create a composite to hold all the user data pairs 
      //layout = new qx.ui.layout.HBox();
      //layout.setSpacing(10);      
      //hBoxDataPieceName = new qx.ui.container.Composite(layout);     

      // Create a label for the username  
      //label = new qx.ui.basic.Label(this.tr("Username:"));
      //hBoxDataPieceName.add(label);
      
      // Create username label
      this.userNameField = new qx.ui.basic.Label("");
      this.userNameField.setFont(font); 

      canvas.add(this.userNameField); 
      // DOB layout 
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxDataPieceDOB = new qx.ui.container.Composite(layout);   

      // DOB description label
      label = new qx.ui.basic.Label(this.tr("Date of Birth:"));
      label.setFont("bold"); 
      hBoxDataPieceDOB.add(label);
      
      // DOB month label
      this.dobMonthField = new qx.ui.basic.Label(); 
      hBoxDataPieceDOB.add(this.dobMonthField);

      // DOB year label
      this.dobYearField = new qx.ui.basic.Label();
      hBoxDataPieceDOB.add(this.dobYearField);

      // Add data pairs to layout
      vBoxText.add(hBoxDataPieceDOB); 

      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxDataPieceEmail = new qx.ui.container.Composite(layout);   

      // Create a label for describing the email field
      label = new qx.ui.basic.Label(this.tr("Email:"));
      label.setFont("bold"); 
      hBoxDataPieceEmail.add(label);
      
      // Create email label
      //this.emailField = new qx.ui.basic.Label("");

      // If we allow the user to change email we cannot 
      // show it as HTML for fear of a cross site scripting error 
      this.emailField = new qx.ui.embed.Html();
      hBoxDataPieceEmail.add(this.emailField);  

      vBoxText.add(hBoxDataPieceEmail);     

      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxDataPieceLoc = new qx.ui.container.Composite(layout);  

      // Create a label for describing the location field 
      label = new qx.ui.basic.Label(this.tr("Location:"));
      label.setFont("bold"); 
      hBoxDataPieceLoc.add(label);
      
      // Create location label
      this.locationField = new qx.ui.basic.Label("");
      hBoxDataPieceLoc.add(this.locationField);      
   
      vBoxText.add(hBoxDataPieceLoc);

      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxDataPieceOrg = new qx.ui.container.Composite(layout);  

      // Create a label for describing the organization field 
      label = new qx.ui.basic.Label(this.tr("Organization:"));
      label.setFont("bold"); 
      hBoxDataPieceOrg.add(label);
      
      // Create an organization label
      this.orgField = new qx.ui.basic.Label("");
      hBoxDataPieceOrg.add(this.orgField);      
   
      vBoxText.add(hBoxDataPieceOrg);

      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBoxDataPieceUrl = new qx.ui.container.Composite(layout);  

      // Create a label for describing the url field 
      label = new qx.ui.basic.Label(this.tr("URL:"));
      label.setFont("bold"); 
      hBoxDataPieceUrl.add(label);
      
      // Create url label
      this.urlField = new qx.ui.basic.Label("");
      //this.urlField = new qx.ui.embed.Html();
      hBoxDataPieceUrl.add(this.urlField);      
   
      vBoxText.add(hBoxDataPieceUrl);

      // Layout for bio box
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBio = new qx.ui.container.Composite(layout);

      // Add some space for name
      //vBoxBio.add(new qx.ui.basic.Label(""));
      //vBoxBio.add(new qx.ui.core.Spacer(20));

      // Create a label for describing the bio text area
      label = new qx.ui.basic.Label(this.tr("About this user:"));
      label.setFont("bold"); 
      vBoxBio.add(label); 

      // Create textarea for entering in bio
      this.bioTextArea = new  qx.ui.form.TextArea("");
      this.bioTextArea.set(
        {
          readOnly : true,
          wrap     : true,
          width    : 300,
          height   : 100   
        }
      );
      vBoxBio.add(this.bioTextArea); 

      // Overall layout
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBox = new qx.ui.container.Composite(layout);

      // Add some space between last text element and authored apps
      vBoxText.add(new qx.ui.core.Spacer(10)); 

      // Add to hBox text field objects
      hBox.add(vBoxText);

      // Space things out
      hBox.add(new qx.ui.core.Spacer(15));

      // Add to hBox bio field
      hBox.add(vBoxBio); 

      // Add to main canvas
      canvas.add(hBox);

      // Add in created apps section
      // Most Liked Apps section
      var authoredAppsLayout = new qx.ui.layout.VBox();
      authoredAppsLayout.set(
        {
          alignX : "center"
        });
      var authoredApps = new qx.ui.container.Composite(authoredAppsLayout);
      authoredApps.set(
        {
          decorator : "home-page-ribbon",
          padding   : 20
        });

      this.authoredAppsHeader = new qx.ui.basic.Label();
      this.authoredAppsHeader.set(
        {
          //value : "Authored Apps",
          font  : font,
          decorator : "home-page-header"
        });
      authoredApps.add(this.authoredAppsHeader);
      
      // slide bar of Newest Apps
      var scroller = new qx.ui.container.Scroll();
      authoredApps.add(scroller);
      
      // Scroll container can hold only a single child. Create that child.
      this.authoredAppsContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      this.authoredAppsContainer.set(
          {
            height : 210
          });
      scroller.add(this.authoredAppsContainer);

      canvas.add(authoredApps);
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
        // Username could not be found
        if (response.data.code == 2)
        {
          dialog.Dialog.warning(response.data.message);
        }
        else 
        {
          // FIXME: Add the failure to the cell editor window rather than alert
          alert("Async(" + response.id + ") exception: " + response.data);
        }

        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "appear":
        var user = response.data.result;
        
        // Set values from RPC call 
        this.userNameField.setValue(user.displayName);

        // 1 means show email 
        if (user.showEmail == 1)
        {
          this.emailField.set(
            {
              html  : "<a href=mailto:" 
                      + user.email + ">" + user.email + "</a>",
              //value : user.email, 
              width : 300
            });
        }
 
        if (user.birthYear != null && user.birthYear != 0) 
        {
          this.dobYearField.setValue(String(user.birthYear)); 
        }

        if (user.birthMonth != null && user.birthMonth != "")
        {
          this.dobMonthField.setValue(user.birthMonth + ","); 
        }

        if (user.location != null)
        {
          this.locationField.setValue(user.location);        
        }
          
        if (user.bio != null)
        {
          this.bioTextArea.setValue(user.bio);
        }

        if (user.organization != null)
        {
          this.orgField.setValue(user.organization);
        }

        if (user.url != null)
        {

          this.urlField.set(
            {
              value : user.url,  
              //html  : "<a href=" + user.url + ">" + user.url + "</a>",
              width : 300
            });

        }

        // Add in authored adds if they exist
        if (user.authoredApps.length > 0) 
        {

           // Set header
           this.authoredAppsHeader.
               setValue(this.tr("Apps By ") + user.displayName); 

           for(var i = 0; i < user.authoredApps.length; i++)
           {
             // If this isn't the first one, ...
             if (i > 0)
             {
               // ... then add a spacer between the previous one and this one
               this.authoredAppsContainer.add(new qx.ui.core.Spacer(10));
             }

             // Add the thumbnail for this app
             var appLiked = user.authoredApps[i];
             var appThumbLiked = 
               new aiagallery.widget.SearchResult("homeRibbon", appLiked);
             this.authoredAppsContainer.add(appThumbLiked);

             // Associate the app data with the UI widget so it can be passed
             // in the click event callback
             appThumbLiked.setUserData("App Data", appLiked);
         
             // Fire an event specific to this application, no friendly name.
             appThumbLiked.addListener(
               "click", 
               function(e)
               {
                 fsm.fireImmediateEvent(
                   "authoredAppClick", 
                   this, 
                   e.getCurrentTarget().getUserData("App Data"));
                 });             
           }  
         }

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
