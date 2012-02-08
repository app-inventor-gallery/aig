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

  construct : function(titleText, ownerText, imagePath)
  { 
    var             font;

    this.base(arguments, titleText, imagePath);
      
    // Specify the owner text and layout parameters
    this.set(
      {
        owner           : ownerText,
        backgroundColor : "#eee9e9",
        marginRight     : 20,
        padding         : 10,
        gap             : 0,
        width           : 150,
        iconPosition    : "top"
      });

    // Add the thumbnail image
    this.getChildControl("icon").set(
      {
        height : 100,
        width  : 100,
        scale  : true
      });
    
    // The title should be in bold font
    font = qx.bom.Font.fromString("bold 10px sans-serif");
    this.getChildControl("label").set(
      {
        font   : font
      });
  },
  
  properties :
  {
    /** The second line of text */
    owner :
    {
      apply     : "_applyOwner",
      nullable  : true,
      check     : "String",
      event     : "changeOwner"
    }    
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "owner":
          control = new qx.ui.basic.Label(this.getOwner());
          control.setAnonymous(true);
          this._addAt(control, 2);
          break;
      }

      return control || this.base(arguments, id);
    },
    
    // property apply
    _applyOwner : function(value, old)
    {
      var owner = this.getChildControl("owner");
      if (owner) 
      {
        owner.setValue("by " + value);
      }
    }
  }
});
