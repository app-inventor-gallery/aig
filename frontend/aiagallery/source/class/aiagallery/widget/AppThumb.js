/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.AppThumb",
{
  extend : qx.ui.basic.Atom,

  construct : function(titleText, displayName, imagePath, owner)
  { 
    var             ownerLabel;
    var             font;

    this.base(arguments, titleText, imagePath);
      
    // Specify the owner text and layout parameters
    this.set(
      {
        backgroundColor : "#eee9e9",
        marginRight     : 20,
        padding         : 10,
        gap             : 0,
        width           : 150,
        iconPosition    : "top",
        center          : false
      });

    if (displayName)
    {
      this.setDisplayName(displayName);
    }
    
    if (typeof owner != "undefined")
    {
      this.setOwner(owner);
    }

    // Add the thumbnail image
    this.getChildControl("icon").set(
      {
        height : 100,
        width  : 100,
        scale  : true
      });
    
    // Display the title (label)
    this.getChildControl("label");
    
    // Add the spacer
    this.getChildControl("spacer");

    // The owner should be displayed android green
    font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
    font.setColor("#75940c");   // android-green-dark
    ownerLabel = this.getChildControl("owner");
    ownerLabel.set(
      {
        textColor : null,       // don't let it override font's color
        font      : font
      });
    
    // Owner clicks may work differently than other clicks within this widget
    ownerLabel.addListener(
      "click",
      function(e)
      {
        // Prevent the default 'click' behavior
        e.preventDefault();
        e.stop();

        // Initiate a search
        alert("Future: initiate search for owner " +
              this.getDisplayName() + " (" + this.getOwner() + ")");
      },
      this);
  },
  
  properties :
  {
    /** The second line of text: the owner of the app */
    displayName :
    {
      apply     : "_applyDisplayName",
      nullable  : true,
      check     : "String",
      event     : "changeDisplayName"
    },

    /** The owner's unique ID */
    owner :
    {
      nullable  : false,
      check     : "String"
    }    
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;
      var             font;

      font = qx.theme.manager.Font.getInstance().resolve("bold");

      switch(id)
      {
      case "label":
        control = new qx.ui.form.TextArea(this.getLabel());
        control.set(
          {
            font      : font,
            readOnly  : true,
            autoSize  : true,
            wrap      : true,
            anonymous : true,
            maxHeight : 40
          });
        this._add(control);
        break;

      case "spacer":
        control = new qx.ui.core.Spacer(1, 1);
        this._addAt(control, 2);
        break;

      case "owner":
        control = new qx.ui.basic.Label(this.getDisplayName());
        control.set(
          {
            textAlign : "left"
          });
        this._addAt(control, 3);
        break;
      }

      return control || this.base(arguments, id);
    },
    
    // property apply
    _applyDisplayName : function(value, old)
    {
      var owner = this.getChildControl("owner");
      if (owner) 
      {
        owner.setValue("by " + value);
      }
    }
  }
});
