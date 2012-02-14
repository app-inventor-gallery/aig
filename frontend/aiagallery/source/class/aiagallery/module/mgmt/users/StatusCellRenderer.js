/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * A cell renderer to display status as its textual name, given its numeric
 * value.
 */
qx.Class.define("aiagallery.module.mgmt.users.StatusCellRenderer",
{
  extend : qx.ui.table.cellrenderer.Default,

  members :
  {
    // overridden
    _formatValue : function(cellInfo)
    {
      if (cellInfo.value === null)
      {
        return "";
      }
      
      return aiagallery.dbif.Constants.StatusToName[cellInfo.value];
    }
  }
});
