/*
 * Copyright (c) 2011 Derrell Lipman
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


public class BackendStartServlet extends HttpServlet
{
    /**
     * Process a GET request.
     *
     * @param request {javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException
    {
      java.lang.System.out.println("Backend start (GET)");
    }


    /**
     * Process a POST request.
     *
     * @param request {javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    public void doPost(HttpServletRequest request,
                       HttpServletResponse response)
        throws IOException
    {
      java.lang.System.out.println("Backend start (POST)");
    }
}
