qx.Class.define("aiagallery.widget.CollapsedSummary", 
{
    extend : qx.ui.container.Composite,

    construct : function()
    {
	var height = 200;
	var layout;
	
	this.base(arguments);
	
	height = aiagallery.widget.CollapsedSummary.Height;
	this.set(
	    {
		height : height,
		minHeight : height,
		maxHeight : height
	    });

	// Set the layout to a grid
	layout = new qx.ui.layout.Grid();
	this.setLayout(layout);

	// Add children
	//this.getChildControl("icon");
	this.getChildControl("UserIcon");
	this.getChildControl("UserName");
	this.getChildControl("UserInfoSection");
	this.getChildControl("TextPreview");
    },

    properties :
    {
	icon :
	{
	    themeable : true
	},

	UserIcon : 
	{
	    check : "String",
	    apply : "_applyUserIcon",
	    nullable : true,
	    themeable : true
	},
	
	UserName : 
	{
	    check : "String", 
	    apply : "_applyUserName"
	},
	
	UserInfoSection :
	{
	    check : "String",
	    apply : "_applyUserInfoSection"
	},
	
	TextPreview : 
	{
	    check : "String",
	    apply : "_applyTextPreview"
	}
    },
    
    statics :
    {
	Height : 100,

	Width : 
	{
	    UserIcon : 75,
	    UserName : 75,
	    UserInfoSection : 75,
	    TextPreview : 75
	}
    },

    members:
    {
	_createChildControlImpl : function(id, hash)
	{
	    var control
	    var width;

	    switch(id)
	    {

	    case "icon" :
		control = new qx.ui.form.Button("Yo");
		this.add(control, {row : 2, column : 2});
		break;

	    case "UserIcon" :
		control = new qx.ui.basic.Image("aiagallery/homepage2.png");
		control.setLayoutProperties({row : 1, column : 1});
		this.add(control, {row : 1, column : 1});
		break;

	    case "UserName" :
		control = new qx.ui.form.TextArea("Lorem Ipsum...");
		this.add(control, {row : 2, column : 1});
		break;
		
	    case "UserInfoSection" :
		control = new qx.ui.form.TextArea("User Info...");
		this.add(control, {row : 1, column : 2});
		break;
		
	    case "TextPreview" : 
		control = new qx.ui.form.TextArea("Lorem Ipsum...");
		this.add(control, {row : 1, column : 3});
		break;
	    }

	    return control || this.base(arguments, id);
	},
	
	_applyUserIcon : function(value, old)
	{
	    this.getChildControl("UserIcon").setSource(value);
	},

	_applyUserName : function(value, old)
	{
	    this.getChildControl("UserName").setSource(value);
	},

	_applyUserInfoSection : function(value, old)
	{
	    this.getChildControl("UserInfoSection").setSource(value);
	},

	_applyTextPreview : function(value, old)
	{
	    this.getChildControl("TextPreview").serSource(value);
	}
    }
});