/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */


/**
 * The container and children to implement the who's-logged-in line on the GUI
 */
qx.Class.define("aiagallery.main.WhoAmI",
{
  extend  : qx.ui.core.Widget,

  construct : function()
  {
    var             layout;

    // Call the superclass constructor
    this.base(arguments);
    
    // Give ourself a layout
    layout = new qx.ui.layout.Grid();
    layout.setSpacingX(2);
    this._setLayout(layout);
    
    // Initialize display of the Set Display Name message
    this.initHasSetDisplayName();
  },

  properties :
  {
    /** This user's id */
    id :
    {
      check : "String"
    },
    
    /** This user's email address */
    email :
    {
      check : "String",
      apply : "_applyEmail"
    },
    
    /** This user's display name */
    displayName :
    {
      check : "String",
      apply : "_applyDisplayName"
    },
    
    /** Whether this user is an administrator */
    isAdmin :
    {
      check : "Boolean",
      apply : "_applyIsAdmin"
    },
    
    /** Whether this user has set his display name */
    hasSetDisplayName :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyHasSetDisplayName"
    },
    
    /** The logout URL */
    logoutUrl :
    {
      check : "String",
      apply : "_applyLogoutUrl"
    }
  },

  members :
  {
    // apply function
    _applyEmail : function(value, old)
    {
      var control = this.getChildControl("email");
      if (control) 
      {
        control.setValue(value);
      }
    },

    // apply function
    _applyDisplayName : function(value, old)
    {
      var control = this.getChildControl("displayName");
      if (control) 
      {
        control.setValue(
          "<a href='javascript:editProfile();'>" +
          "(" + value + ")" +
          "</a>");
      }
    },

    // apply function
    _applyIsAdmin : function(value, old)
    {
      var control = this.getChildControl("isAdmin");
      if (control) 
      {
        control.setValue(value ? "*" : "");
      }
    },

    // apply function
    _applyHasSetDisplayName : function(value, old)
    {
      var control = this.getChildControl("hasSetDisplayName");
      if (control) 
      {
        if (! value)
        {
          control.show();
        }
        else
        {
          control.exclude();
        }
      }
    },

    // apply function
    _applyLogoutUrl : function(value, old)
    {
      var who = qx.core.Init.getApplication().getUserData("whoAmI");
      var email = who.getEmail(); 
      var control = this.getChildControl("logoutUrl");

      // Check and see if this is an anon user
      if(email && email == "anonymous")
      {
        // if it is the anon user will have a 
        // logout url set to go to the google login
        control.setValue("<a href='" + value + "'>Login</a>"); 
      } else {	  
        if (control) 
        {
          // Reload the page on logouts
          control.setValue("<a href='javascript:history.go(0)'>Logout</a>");
        }
      }
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
      case "isAdmin" :
        control = new qx.ui.basic.Label();
        control.setAnonymous(true);
        this._add(control, { row : 0, column : 0 });
        break;

      case "email":
        control = new qx.ui.basic.Label(this.getEmail());
        control.setAnonymous(true);
        this._add(control, { row : 0, column : 1 });
        break;

      case "displayName":
        control = new qx.ui.basic.Label(
          "<a href='javascript:editProfile();'>" +
          this.getDisplayName() +
          "</a>");
        control.setAnonymous(true);
        control.setRich(true);
        this._add(control, { row : 0, column : 2 });
        break;
        
      case "hasSetDisplayName":
        control = new qx.ui.basic.Label(
          "<a href='javascript:editProfile();'>Set your display name</a>");
        control.setAnonymous(true);
        control.setRich(true);
        this._add(control, { row : 1, column : 1 });
        break;
        
      case "logoutUrl":
        control = new qx.ui.basic.Label(this.getLogoutUrl());
        control.setRich(true);
        control.setAnonymous(true);
        this._add(control, { row : 2, column : 1 });
        break;
      }

      return control || this.base(arguments, id);
    }
  }
});
