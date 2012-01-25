/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.App",
{
  extend : collapsablepanel.Panel,

  construct : function()
  {
    // Don't pass label to superclass constructor. It's unused here.
    this.base(arguments);
  },
  
  properties :
  {
    image1 :
    {
      check : "String",
      apply : "_applyImage1"
    },

    title :
    {
      check : "String",
      apply : "_applyTitle"
    },
    
    status :
    {
      check : "Number",
      apply : "_applyStatus"
    },
    
    numLikes :
    {
      check : "Number",
      apply : "_applyNumLikes"
    },
    
    numDownloads :
    {
      check : "Number",
      apply : "_applyNumDownloads"
    },
    
    numViewed :
    {
      check : "Number",
      apply : "_applyNumViewed"
    },
    
    numComments :
    {
      check : "Number",
      apply : "_applyNumComments"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
      case "bar":
        control = new aiagallery.widget.mystuff.Summary();
        control.addListener("click", this.toggleValue, this);
        this._add(control, {flex : 1});
        break;

      case "container":
        control = new aiagallery.widget.mystuff.Detail();
        this._add(control, {flex : 1});
        break;
      }

      return control || this.base(arguments, id);
    },
    
    // property apply
    _applyImage1 : function(value, old)
    {
      this.getChildControl("bar").setImage1(value);
    },
    
    // property apply
    _applyTitle : function(value, old)
    {
      this.getChildControl("bar").setTitle(value);
    },
    
    // property apply
    _applyStatus : function(value, old)
    {
      this.getChildControl("bar").setStatus(value);
    },
    
    // property apply
    _applyNumLikes : function(value, old)
    {
      this.getChildControl("bar").setNumLikes(value);
    },
    
    // property apply
    _applyNumDownloads : function(value, old)
    {
      this.getChildControl("bar").setNumDownloads(value);
    },
    
    // property apply
    _applyNumViewed : function(value, old)
    {
      this.getChildControl("bar").setNumViewed(value);
    },
    
    // property apply
    _applyNumComments : function(value, old)
    {
      this.getChildControl("bar").setNumComments(value);
    }
  }
});
