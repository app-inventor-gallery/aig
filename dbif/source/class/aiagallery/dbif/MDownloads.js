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
     *   Returns 0 upon success; non-zero upon error.
     */
    _downloadsPlusOne : function(appId)
    {
      var            appObj;
      var            appDataObj;
      var            myEmail;
      var            myId;
      var            likesList;
      var            criteria;
      var            likesObj;
      var            likesDataObj;

      // Return number of likes (which may or may not have changed)
      return liberated.dbif.Entity.asTransaction(
        function()
        {
          appObj = new aiagallery.dbif.ObjAppData(Number(appId));

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

          return 0;
        },
        [],
        this);
    }
  }
});
