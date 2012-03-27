/**
 * Copyright (c) 2012 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MDownloads",
{
  members :
  {
    /**
     *  Add one to the number of times this app has been downloaded
     *
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being downloaded.
     *
     * @return {Integer}
     *   Returns the new number of downloads upon successfully updating the
     *   number of downloads; -1 upon error.
     */
    _downloadsPlusOne : function(appId)
    {
      // Return the new number of downloads upon successfully updating number
      // of downloads; -1 otherwise.
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          var             appObj;
          var             appDataObj;

          appObj = new aiagallery.dbif.ObjAppData(appId);

          // If there's no such app, return error
          if (appObj.getBrandNew())
          {
            return -1;
          }

          // Get the application data
          appDataObj = appObj.getData();

          // And increment the download count in the DB
          appDataObj.numDownloads++;

          // Write it back to the database
          appObj.put();

          return appDataObj.numDownloads;
        },
        [],
        this);
    }
  }
});
