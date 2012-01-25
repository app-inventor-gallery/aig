/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.DetailRenderer",
{
  extend : qx.ui.form.renderer.Double,

  construct : function(form)
  {
    var             layout;

    // Save the form
    this.__form = form;

    // Call the superclass constructor
    this.base(arguments, form);

    // Create the grid layout
    layout = new qx.ui.layout.Grid();
    layout.setSpacingX(12);
    layout.setSpacingY(6);
    layout.setColumnAlign(0, "right", "top");
    layout.setColumnAlign(1, "left", "top");
    layout.setColumnAlign(2, "right", "top");
    layout.setColumnAlign(3, "left", "top");
    layout.setColumnAlign(4, "right", "top");
    layout.setColumnAlign(5, "left", "top");
    this._setLayout(layout);
  },
  
  members :
  {
    __form : null,

    /**
     * Add a group of form items with the corresponding names. The names are
     * displayed as labels.
     *
     * @param items {qx.ui.core.Widget[]}
     *   An array of form items to render.
     * 
     * @param names {String[]} 
     *   An array of names for the form items.
     * 
     * @param title {String}
     *   Title for this group
     * 
     * @param options {Map[]}
     *   An array of options maps (any of which can be null)
     */
    addItems : function(items, names, title, options) 
    {
      var             position = {};

      // add the items
      for (var i = 0; i < items.length; i++) 
      {
        var label = this._createLabel(names[i], items[i]);
        
        // Begin to specify the position
        position =
          {
            row    : options[i].row,
            column : options[i].column
          };

        // If row span is specified...
        if (options[i].rowSpan)
        {
          // ... then use it.
          position.rowSpan = options[i].rowSpan;
        }

        // Add the label
        this._add(label, position);

        // Retrieve the peer input field
        var item = items[i];
        
        // Join the label and input field
        label.setBuddy(item);

        // Setting visibility of item should also alter its label
        this._connectVisibility(item, label);

        // Position for the input field, in the next column
        ++position.column;

        // If column span is specified, it's the input field that gets it
        if (options[i].colSpan)
        {
          // Each item takes up two columns, but one is used by the label.
          position.colSpan = options[i].colSpan - 1;
        }

        // Add the input field
        this._add(item, position);

        // store the names for translation
        if (qx.core.Environment.get("qx.dynlocale")) 
        {
          this._names.push({name: names[i], label: label, item: items[i]});
        }
      }
    },
    
    /**
     * Adds a button the form renderer. All buttons will be added in a
     * single row at the bottom of the form.
     *
     * @param button {qx.ui.form.Button} The button to add.
     */
    addButton : function(button, options) 
    {
      var             position = {};

      if (! options)
      {
        this.base(arguments, button, options);
      }

      // Begin to specify the position
      position =
        {
          row    : options.row,
          column : options.column
        };

      // If row span is specified...
      if (options.rowSpan)
      {
        // ... then use it.
        position.rowSpan = options.rowSpan;
      }

      // If column span is specified...
      if (options.colSpan)
      {
        // ... then use it.
        position.colSpan = options.colSpan;
      }
      
      // add the button
      this._add(button, position);
    }
  }
});
