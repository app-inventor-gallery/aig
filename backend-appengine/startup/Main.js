/*
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
* This is the HTTP Servlet for remote procedure calls.
*/

/**
 * Invoked as part of a warmup request, or the first user request if no
 * warmup request was invoked.
 */
function init()
{
  try
  {
    var             context;
    var             global;
    var             scriptFile;
    var             filename = "build/script/appenginesqlite.js";
    var             out = java.lang.System.out;

    out.println("Initializing context...");

    // Initialize a Rhino JavaScript context
    context =
      Packages.org.mozilla.javascript.ContextFactory.getGlobal().enterContext();
    context.setOptimizationLevel(-1);
    context.setLanguageVersion(
      Packages.org.mozilla.javascript.Context.VERSION_1_7);
    
    // Obtain a global context
//    global = new Packages.org.mozilla.javascript.TopLevel();
 
    // Instantiate a new handler to handle RPCs
out.println("loc 1");
    global = new JavaAdapter(Packages.org.mozilla.javascript.ScriptableObject,
                             {
                             });
out.println("loc 2: typeof global = " + typeof(global));

    // Create the standard objects (Number, String, etc.)
    context.initStandardObjects(global);
out.println("loc 3");
    
    // Assign "window" to be the global object
    out.println("typeof global = " + typeof(global));
    out.println("global.defineProperty=" + global.defineProperty);
    for (var x in global)
    {
      out.println("global[" + x + "] = " + global[x]);
    }
    global.defineProperty(
      "window", 
      global,
      Packages.org.mozilla.javascript.ScriptableObject.DONTENUM);
    
    // Read and process the script file
    scriptFile = java.io.FileReader(filename);
    context.evaluateReader(global, scriptFile, filename, 1, null);
    
    // Now we can assign our local doPost and doGet methods
    this.doPost = appenginesqlite.Application.doPost;
    this.doGet = appenginesqlite.Application.doGet;
  }
/*
  catch (e)
  {
    out.println("Error: " + e);
  }
*/
  finally
  {
    try
    {
      // This should generally succeed, since the filename is constant and
      // should always exist.
      scriptFile.close();
      out.println("Done!");
    }
    catch (e)
    {
      out.println("Could not open file " + filename);
    }
  }
}
