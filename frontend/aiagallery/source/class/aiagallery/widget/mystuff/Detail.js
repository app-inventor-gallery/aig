/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.Detail",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);

    // Create a layout.
    this.setLayout(new qx.ui.layout.VBox(10));
    
    this.add(new qx.ui.basic.Label("Hi there"));
  },
  
  properties :
  {
    title :
    {
      check : "String"
    },

    description :
    {
      check : "String"
    },
    
    tags :
    {
      check : "Array"
    },
    
    sourceFileName :
    {
      check : "String"
    },
    
    creationTime :
    {
      check : "Date"
    },
    
    uploadTime :
    {
      check : "Date"
    }
  },

  members :
  {
  }
});
