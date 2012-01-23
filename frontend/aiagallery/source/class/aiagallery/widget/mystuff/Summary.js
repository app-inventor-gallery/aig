/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.Summary",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);
    
    // Set a reasonable height so the image isn't tiny
    this.set(
      {
        height    : 32,
        minHeight : 32
      });
    
    // Create a layout. Summary is always an HBox
    this.setLayout(new qx.ui.layout.HBox(10));
  },
  
  properties :
  {
    /** Any URI String supported by qx.ui.basic.Image to display an icon */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      themeable : true,
      event : "changeIcon"
    },
    
    image1 :
    {
      check : "String"
    },

    title :
    {
      check : "String"
    },
    
    status :
    {
      check : "Number"
    },
    
    numLikes :
    {
      check : "Number"
    },
    
    numDownloads :
    {
      check : "Number"
    },
    
    numViewed :
    {
      check : "Number"
    },
    
    numComments :
    {
      check : "Number"
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
        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          control.setAnonymous(true);
          this._addAt(control, 0);
          break;

        case "title":
          control = new qx.ui.basic.Label(this.getTitle());
          control.setAnonymous(true);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // property apply
    _applyIcon : function(value, old)
    {
      var icon = this.getChildControl("icon");
      if (icon) 
      {
        icon.setSource(value);
      }
    }
  }
});
