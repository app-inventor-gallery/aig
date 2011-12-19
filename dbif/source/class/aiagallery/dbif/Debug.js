/**
 * Debug functionality for backend work
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Main menu
 */
qx.Class.define("aiagallery.dbif.Debug",
{
  extend : qx.core.Object,

  statics :
  {
    /**
     * Recursively display an object (into a string)
     *
     *
     * @param obj {Object}
     *   The object to be recursively displayed
     *
     * @param initialMessage {String, null}
     *   The initial message to be displayed.
     *
     * @param maxLevel {Integer ? 10}
     *   The maximum level of recursion.  Objects beyond this level will not
     *   be displayed.
     *
     * @param bHtml {Boolean ? false}
     *   If true, then render the debug message in HTML;
     *   Otherwise, use spaces for indentation and "\n" for end of line.
     *
     * @return {String}
     *   The string containing the recursive display of the object
     */
    debugObjectToString : function(obj, initialMessage, maxLevel, bHtml)
    {
      // If a maximum recursion level was not specified...
      if (!maxLevel)
      {
        // ... then create one arbitrarily
        maxLevel = 10;
      }

      // If they want html, the differences are "<br>" instead of "\n"
      // and how we do the indentation.  Define the end-of-line string
      // and a start-of-line function.
      var eol = (bHtml ? "</span><br>" : "\n");
      var sol = function(currentLevel)
      {
        var indentStr;
        if (! bHtml)
        {
          indentStr = "";
          for (var i = 0; i < currentLevel; i++)
          {
            indentStr += "  ";
          }
        }
        else
        {
          indentStr =
            "<span style='padding-left:" + (currentLevel * 8) + "px;'>";
        }
        return indentStr;
      };

      // Initialize an empty message to be displayed
      var message = "";

      // Function to recursively display an object
      var displayObj = function(obj, level, maxLevel)
      {
        // If we've exceeded the maximum recursion level...
        if (level > maxLevel)
        {
          // ... then tell 'em so, and get outta dodge.
          message += (
            sol(level) +
              "*** TOO MUCH RECURSION: not displaying ***" +
              eol);
          return;
        }

        // Is this an ordinary non-recursive item?
        if (typeof (obj) != "object")
        {
          // Yup.  Just add it to the message.
          message += sol(level) + obj + eol;
          return;
        }

        // We have an object  or array.  For each child...
        for (var prop in obj)
        {
          // Is this child a recursive item?
          if (typeof (obj[prop]) == "object")
          {
            try
            {
              // Yup.  Determine the type and add it to the message
              if (obj[prop] instanceof Array)
              {
                message += sol(level) + prop + ": " + "Array" + eol;
              }
              else if (obj[prop] === null)
              {
                message += sol(level) + prop + ": " + "null" + eol;
                continue;
              }
              else if (obj[prop] === undefined)
              {
                message += sol(level) + prop + ": " + "undefined" + eol;
                continue;
              }
              else
              {
                message += sol(level) + prop + ": " + "Object" + eol;
              }

              // Recurse into it to display its children.
              displayObj(obj[prop], level + 1, maxLevel);
            }
            catch (e)
            {
              message +=
                sol(level) + prop + ": EXCEPTION expanding property" + eol;
            }
          }
          else
          {
            // We have an ordinary non-recursive item.  Add it to the message.
            message += sol(level) + prop + ": " + obj[prop] + eol;
          }
        }
      };

      // Was an initial message provided?
      if (initialMessage)
      {
        // Yup.  Add it to the displayable message.
        message += sol(0) + initialMessage + eol;
      }

      if (obj instanceof Array)
      {
        message += sol(0) + "Array, length=" + obj.length + ":" + eol;
      }
      else if (typeof(obj) == "object")
      {
        var count = 0;
        for (var prop in obj)
        {
          count++;
        }
        message += sol(0) + "Object, count=" + count + ":" + eol;
      }

      message +=
        sol(0) +
        "------------------------------------------------------------" +
        eol;

      try
      {
        // Recursively display this object
        displayObj(obj, 0, maxLevel);
      }
      catch(ex)
      {
        message += sol(0) + "*** EXCEPTION (" + ex + ") ***" + eol;
      }

      message +=
        sol(0) +
        "============================================================" +
        eol;

      return message;
    }
  }
});
