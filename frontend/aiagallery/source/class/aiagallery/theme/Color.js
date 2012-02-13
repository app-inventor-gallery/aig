/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("aiagallery.theme.Color",
{
  extend : qx.theme.modern.Color,

  colors :
  {
    "android-green"      : "#a5c43c",
    "android-green-dark" : "#75940c",

    "selected-start" : "#75940c", // android-green-dark
    "selected-end" : "#a5c43c",   // android-green

    "input-focused-start" : "#a5c43c",
    "input-focused-end" : "#75940c",
    "input-focused-inner-invalid" : "#FF6B78",
    "input-border-disabled" : "#9B9B9B",
    "input-border-inner" : "white",

    // invalid form widgets
    "invalid" : "#ff0000",
    "border-focused-invalid" : "#ff0000"
  }
});
