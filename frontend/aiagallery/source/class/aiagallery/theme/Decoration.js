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
    "pagepane-top" :
    {
//      decorator : qx.ui.decoration.Single,
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
