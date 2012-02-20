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
    "selected" :
    {
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage  : "aiagallery/decoration/selection.png",
        backgroundRepeat : "scale"
      }
    },

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

    "formimage" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : null,
        innerColor : null,
//        innerOpacity : 0.5,
        backgroundImage : "decoration/form/input.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },

    "formimage-focused" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "border-input",
        innerColor : "border-focused",
        backgroundImage : "decoration/form/input-focused.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },

    "formimage-focused-invalid" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "invalid",
        innerColor : "border-focused-invalid",
        backgroundImage : "decoration/form/input-focused.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light",
        insets: [2]
      }
    },


    "formimage-disabled" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "border-disabled",
        innerColor : "border-inner-input",
        innerOpacity : 0.5,
        backgroundImage : "decoration/form/input.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },

    "formimage-css" :
    {
      decorator : [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        color : null,
        innerWidth: 1,
        width : 1
      }
    },

    "border-invalid-css" : {
      include : "formimage-css",
      style : {
        innerColor : "border-invalid",
        color : "border-invalid"
      }
    },

    "formimage-focused-css" : {
      include : "formimage-css",
      style : {
        startColor : "input-focused-start",
        innerColor : "input-focused-end",
        endColorPosition : 4
      }
    },

    "formimage-focused-invalid-css" : {
      include : "formimage-focused-css",
      style : {
        innerColor : "input-focused-inner-invalid",
        color : "border-invalid"
      }
    },

    "formimage-disabled-css" : {
      include : "formimage-css",
      style : {
        color: "input-border-disabled"
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
    
    "search-result-separator" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthBottom : 1,
        colorBottom : "android-green"
      }
    },

    "home-page-header" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthTop    : 10,
        widthBottom : 10,
        colorTop    : "android-green",
        colorBottom : "android-green"
      }
    },

    "radioview-pane" :
    {
      decorator : qx.ui.decoration.Single
    },

    "radioview-pane-css" :
    {
      decorator : []
    }
  }
});
