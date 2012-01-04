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
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class GuiServlet extends HttpServlet
{
    /**
     * Process a GET request. This loads the GUI, or redirects to the login
     * page if the user is not yet logged in.
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
        UserService         userService;

        // Get a user service instance, to determine signed-in user data
        userService = UserServiceFactory.getUserService();

        // If the user is logged in, get the requested page.
        if (request.getUserPrincipal() != null)
        {
            response.getWriter().println(
                "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" " +
                "        \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">" +
                "<html xmlns=\"http://www.w3.org/1999/xhtml\" " +
                "      xml:lang=\"en\">" +
                "  <head>" +
                "    <meta http-equiv=\"Content-Type\" " +
                "          content=\"text/html; charset=utf-8\" />" +
                "    <link type=\"image/ico\" " +
                "          href=\"/favicon.ico\" rel=\"icon\" />" +
                "    <title>App Inventor Gallery</title>" +
                "    <script type=\"text/javascript\" " +
                "            src=\"script/aiagallery.js\">" +
                "    </script>" +
                "  </head>" +
                "  <body>" +
                "  </body>" +
                "</html>");
        }
        else
        {
            response.sendRedirect(
                userService.createLoginURL(request.getRequestURI()));
        }
    }
}
