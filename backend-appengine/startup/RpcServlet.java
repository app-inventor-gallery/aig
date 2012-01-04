/*
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
* This is the HTTP Servlet for remote procedure calls.
*/

package startup;

import java.io.IOException;
import javax.servlet.http.*;
import org.mozilla.javascript.*;


public class RpcServlet extends HttpServlet
{
    private Context     __context;
    private Main        __scope;

    /**
     * Invoked as part of a warmup request, or the first user request if no
     * warmup request was invoked.
     */
    public void init()
    {
        // Get a new context
        this.__context = Context.enter();

        // Use interpreted mode
        this.__context.setOptimizationLevel(-1);

        // Initialize the standard objects (Object, Function, etc.)
        // This must be done before scripts can be executed.
        this.__scope = new Main();
        this.__context.initStandardObjects(this.__scope);

        // Set up the browser-typical globals
        Object result = this.__context.evaluateString(
          this.__scope,
          "navigator = " +
          "{" +
          " userAgent:" +
          " 'Mozilla/5.0" +
          " (Macintosh; U; Intel Mac OS X 10_6_4; de-de)" +
          " AppleWebKit/533.17.8 (KHTML, like Gecko)" +
          " Version/5.0.1 Safari/533.17.8', " +
          " product: '*DJSS*'," +  // Derrell's JavaScript Server
          " cpuClass: ''" +
          "};",
          "<stdin>",
          1,
          null);

        if (result != Context.getUndefinedValue())
        {
          System.err.println(Context.toString(result));
        }

        // Define some global functions particular to the shell. Note
        // that these functions are not part of ECMA.
        String[] names = { "print", "quit", "version", "load", "help" };
        this.__scope.defineFunctionProperties(names, Main.class,
                                              ScriptableObject.DONTENUM);

        // Set up "window" to be the global scope.
        this.__scope.defineProperty("window", this.__scope,
                                    ScriptableObject.DONTENUM);


        // Set up "environment" in the global scope to provide access to the
        // System environment variables.
        Environment.defineClass(this.__scope);
        Environment environment = new Environment(this.__scope);
        this.__scope.defineProperty("environment", environment,
                                    ScriptableObject.DONTENUM);

        this.__scope.processSource(this.__context,
                                   "build/script/appenginesqlite.js");

        java.lang.System.out.println("Initialized context");
    }

    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException
    {
        Object          fObj;

        java.lang.System.out.println("doGet");

        // Retrieve the function object
        fObj = this.__scope.get("appenginesqlite.Application.doGet",
                                this.__scope);
        if (! (fObj instanceof Function))
        {
            // Failed to retrieve it
            java.lang.System.out.println("Could not retrieve function doGet");
        }
        else
        {
            Object              args[] = { request, response };
            Function            f = (Function) fObj;
            
            // Call the function
            f.call(this.__context, this.__scope, this.__scope, args);
            
            java.lang.System.out.println("doPost complete");
        }
    }
}
