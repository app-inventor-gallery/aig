/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("aiagallery.theme.Decoration",
{
  extend : qx.theme.modern.Decoration,

  decorations :
  {
    "border-invalid-css" : {
      include : "input-css",
      style : {
        innerColor : "input-focused-inner-invalid",
        color : "border-invalid"
      }
    },

    "input-focused-css" : {
      include : "input-css",
      style : {
        startColor : "input-focused-start",
        innerColor : "input-focused-end",
        endColorPosition : 4
      }
    },

    "input-focused-invalid-css" : {
      include : "input-focused-css",
      style : {
        color : "border-invalid"
      }
    },

    "pagepane-top" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MSingleBorder
      ],

      style : {
        width    : 3,
        widthTop : 6,
        color    : "android-green",
        radius   : 6,
        gradientStart : ["white", 90],
        gradientEnd : ["white", 100]
      }
    },
    
    "tabview-pane" :
    {
      decorator : qx.ui.decoration.Single
    },

    "tabview-pane-css" :
    {
      decorator : []
    }
  }
});
