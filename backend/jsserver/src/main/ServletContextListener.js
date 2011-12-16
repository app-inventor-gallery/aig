/*
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
* This servlet initializes and destroys the instance context
*/

/**
 * Invoked as part of a warmup request, or the first user request if no
 * warmup request was invoked.
 *
 * @param event {Packages.javax.servlet.ServletContextEvent}
 *   Event data
 */
function contextInitialized(event)
{
  java.lang.System.out.println("Initializing context");
  new Packages.main.Loader();
}

function contextDestroyed(event)
{
  java.lang.System.out.println("Destroying context");
}
