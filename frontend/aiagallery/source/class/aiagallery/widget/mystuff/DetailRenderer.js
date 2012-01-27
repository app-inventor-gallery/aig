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
    layout.setColumnAlign(6, "left", "top");

    // make rows flexible so buttons are right height
    layout.setRowFlex(3, 1);
    layout.setRowFlex(6, 1);
    
    this._setLayout(layout);
  },
  
  members :
  {
    __maxRow : -1,
    __maxCol : -1,

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
      var             hBox;

      // Is this an explicitly-placed widget?
      if (! options || typeof options.row == "undefined")
      {
        if (this._buttonRow == null) 
        {
          // create button row
          this._buttonRow = new qx.ui.container.Composite();
          this._buttonRow.setMarginTop(5);

          hBox = new qx.ui.layout.HBox();
          hBox.set(
            {
              alignX  : "right",
              spacing : 5
            });
          this._buttonRow.setLayout(hBox);

          // add the button row
          this._add(this._buttonRow,
                    {
                      row     : this.__maxRow + 1,
                      column  : 0,
                      colSpan : this.__maxCol
                    });
        }

        // add the button
        this._buttonRow.add(button);
        return;
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
      
      // Keep track of the largest column number used
      if (position.column + (position.colSpan || 0) > this.__maxCol)
      {
        this.__maxCol = position.column + (position.colSpan || 0);
      }
      
      // Keep track of the largest row number used
      if (position.row + (position.rowSpan || 0) > this.__maxRow)
      {
        this.__maxRow = position.row + (position.rowSpan || 0);
      }
    }
  }
});
