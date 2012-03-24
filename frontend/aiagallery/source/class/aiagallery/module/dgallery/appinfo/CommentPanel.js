qx.Class.define("aiagallery.widget.CommentPanel",
{
  extend : collapsablepanel.Panel,
    
    construct : function(fsm)
    {
	this.__fsm = fsm;
	// Construct a collapsablepanel.Panel
	this.base(arguments);
	
	// Construct the panel collapsed
        this.set({value : false});

	// Create a 
	var slideBarComposite = new qx.ui.container.Composite();
        slideBarComposite.setLayout(new qx.ui.layout.VBox(4));
        
	slideBarComposite.add(new qx.ui.form.TextArea("Full Comment Text"));
        slideBarComposite.add(new collapsablepanel.Panel("Preview Reply Text", new qx.ui.layout.VBox()));
        slideBarComposite.add(new collapsablepanel.Panel("Preview Second Reply Text", new qx.ui.layout.VBox()));
	slideBarComposite.add(new collapsablepanel.Panel("Preview Third Reply Text", new qx.ui.layout.VBox()));
	slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));
	//slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));
	//slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));
	//slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));
	//slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));
	//slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));
	//slideBarComposite.add(new collapsablepanel.Panel("Preview Fourth Reply Text", new qx.ui.layout.VBox()));

             
	this.getChildControl("bar");
	//this.getChildControl("container").set({height : 200}); 
    },


  properties :
  {
      label :
      {
	  check : "String",
	  apply : "_applyLabel"
      }
  
  },

  members :
  {
      __fms : null,

      _createChildControlImpl : function(id)
      {
	  var control;
	  
	  switch(id)
	  {
	  case "bar":
	      control = new aiagallery.widget.CollapsedSummary(this.__fms, this);
	      control.addListener("click", this.toggleValue, this);
              this._add(control, {flex : 1});
              break;

	  case "container" :
	      this.base(arguments, id);
	      break;

	  }
	  
	  return control || this.base(arguments, id);
	  
      },

      _applyLabel : function(value, old)
      {
	  this.getChildControl("");
      }
  }
      
});
