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

  construct : function(fsm)
  {
    // Save the finite state machine reference. This must be done before the
    // superclass constructor is called because the superclass construcor will
    // call this.getChildControl() which uses this.__fsm.
    this.__fsm = fsm;

    // Don't pass label to superclass constructor. It's unused here.
    this.base(arguments);
    
    // Turn of the separator between summary and detail
    this.setShowSeparator(false);
    
    // Arrange to scroll into view when this panel is opened
    this.getChildControl("container").addListener(
      "appear",
      function(e)
      {
        this.scrollChildIntoViewY(this, null, true);
      },
      this);
  },
  
  properties :
  {
    uid :
    {
      apply : "_applyUid"
    },

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
    
    description :
    {
      check : "String",
      apply : "_applyDescription"
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
    },
    
    tags :
    {
      check : "Array",
      apply : "_applyTags"
    },
    
    sourceFileName :
    {
      check : "String",
      apply : "_applySourceFileName"
    }
  },

  members :
  {
    /** Reference to the finite state machine for the module */
    __fsm : null,

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
      case "bar":
        control = new aiagallery.widget.mystuff.Summary(this.__fsm, this);
        control.addListener("click", this.toggleValue, this);
        this._add(control, {flex : 1});
        break;

      case "container":
        control = new aiagallery.widget.mystuff.Detail(this.__fsm, this);
        this._add(control, {flex : 1});
        break;
      }

      return control || this.base(arguments, id);
    },
    
    // property apply
    _applyUid : function(value, old)
    {
      this.getChildControl("container").setUid(value);
    },
    
    // property apply
    _applyImage1 : function(value, old)
    {
      this.getChildControl("bar").setImage1(value);
      this.getChildControl("container").setImage1(value);
    },
    
    // property apply
    _applyTitle : function(value, old)
    {
      this.getChildControl("bar").setTitle(value);
      this.getChildControl("container").setTitle(value);
    },
    
    // property apply
    _applyDescription : function(value, old)
    {
      this.getChildControl("container").setDescription(value);
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
    },
    
    // property apply
    _applyTags : function(value, old)
    {
      this.getChildControl("container").setTags(value);
    },
    
    // property apply
    _applySourceFileName : function(value, old)
    {
      this.getChildControl("container").setSourceFileName(value);
    }
  }
});
