/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Theme.define("aiagallery.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    "tabview/pane" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.borderradius");
        return {
          decorator : useCSS ? "tabview-pane-css" : "tabview-pane",
          minHeight : 0,

          marginBottom : states.barBottom ? -1 : 0,
          marginTop : states.barTop ? -1 : 0,
          marginLeft : states.barLeft ? -1 : 0,
          marginRight : states.barRight ? -1 : 0
        };
      }
    },

    "pagepane" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "pagepane-top",
          backgroundColor : "white",
          margin : 10
        };
      }
    },

    "searchResult" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          margin : 10,
          padding : 10,
          decorator : "search-result-separator"
        };
      }
    },


    //
    // Radio View
    //

    "radioview" :
    {
      style : function(states)
      {
        return {
          contentPadding : 0
        };
      }
    },

    "radioview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        return {
          paddingLeft   : 20,
          paddingBottom : 8
        };
      }
    },

    "radioview/pane" :
    {
      style : function(states)
      {
        return {
          decorator : "radioview-pane",
          minHeight : 60,

          marginBottom : states.barBottom ? -1 : 0,
          marginTop : states.barTop ? -1 : 0,
          marginLeft : states.barLeft ? -1 : 0,
          marginRight : states.barRight ? -1 : 0
        };
      }
    },

    "radioview-page" : "widget",

    "radioview-page/button" :
    {
      alias : "atom",

      style : function(states)
      {
        var icon;
        if (states.checked && states.focused) {
          icon = "radiobutton-checked-focused";
        } else if (states.checked && states.disabled) {
          icon = "radiobutton-checked-disabled";
        } else if (states.checked && states.pressed) {
          icon = "radiobutton-checked-pressed";
        } else if (states.checked && states.hovered) {
          icon = "radiobutton-checked-hovered";
        } else if (states.checked) {
          icon = "radiobutton-checked";
        } else if (states.disabled) {
          icon = "radiobutton-disabled";
        } else if (states.focused) {
          icon = "radiobutton-focused";
        } else if (states.pressed) {
          icon = "radiobutton-pressed";
        } else if (states.hovered) {
          icon = "radiobutton-hovered";
        } else {
          icon = "radiobutton";
        }

        return {
          icon: "decoration/form/" + icon + ".png"
        };
      }
    },
    
    //
    // Splitpane
    //
    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 6 : undefined,
          height : states.vertical ? 6 : undefined,
          backgroundColor : "background-splitpane"
        };
      }
    },

    "collapsable-panel" :
    {
      style : function(states)
      {
        return {
          decorator  : "pane",
          padding    : 5,
          allowGrowY : !!states.opened || !!states.horizontal,
          allowGrowX : !!states.opened ||  !states.horizontal
        };
      }
    },

    "collapsable-panel/bar" :
    {
      include : "groupbox/legend",
      alias   : "groupbox/legend",
      style   : function(states)
      {
        return {
          icon       :  states.opened ? "decoration/tree/open.png" : "decoration/tree/closed.png",
          allowGrowY : !states.opened && !!states.horizontal,
          allowGrowX :  states.opened ||  !states.horizontal,
          maxWidth   : !states.opened && !!states.horizontal ? 16 : null
        };
      }
    },

    "collapsable-panel/container" :
    {
      style : function(states)
      {
        return { padding : [0, 5] };
      }
    },
    
    //
    //Buttons
    //

    "flagIt-button" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "qx/icon/Oxygen/16/status/dialog-error.png"
        };
      }
    },

    "pageselector":
    {
      alias : "atom",

      style : function(states)
      {
        var textColor, font;
        var padding = [3, 9]; // default padding css-case

        if (states.checked && states.focused && !states.inner)
        {
          textColor = undefined;
          font = "bold";
        }
        else if (states.disabled)
        {
          textColor = undefined;
          font = undefined;
        }
        else if (states.pressed)
        {
          textColor = "text-hovered";
          font = "bold";
        }
        else if (states.checked)
        {
          font = "bold";
        }
        else if (states.hovered)
        {
          textColor = "text-hovered";
          font = undefined;
        }
        else if (states.focused && !states.inner)
        {
          textColor = undefined;
          font = undefined;
        }
        else
        {
          textColor = undefined;
          font = undefined;
        }

        return {
          textColor : textColor,
          font : font,
          padding : padding,
          margin : [1, 0]
        };
      }
    },
    
    "formimage" :
    {
      //
      // copied from "list", with backgroundColor altered
      //

//      alias : "scrollarea",
      alias : "widget",

      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "formimage-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "formimage-focused";
        } else if (disabled) {
          decorator = "formimage-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "formimage";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
//          backgroundColor : "green",
          decorator : decorator
        };
      }
    }
  }
});
