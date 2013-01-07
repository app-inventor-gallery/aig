/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the special contest page
 */
qx.Class.define("aiagallery.module.dgallery.contest.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
      var             outerCanvas = module.canvas;
      var             canvas; 
      var             label;
      var             desc;
      var             fsPlaceCol1;
      var             fsPlaceCol2;
      var             fsPlaceCol3;
      var             secPlaceCol1;
      var             secPlaceCol2;
      var             secPlaceCol3;
      var             honPlaceCol1;
      var             honPlaceCol2;
      var             honPlaceCol3;
      var             font; 
      var             authorFont; 
      var             introLayout;
      var             introCanvas; 
      var             colLayout1; 
      var             colLayout2; 
      var             colLayout3; 
      var             comCol1;
      var             comCol2; 

      // Put whole page in a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      // Create a layout for this page
      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));

      // Layout to hold the columns
      colLayout1 = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      colLayout2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      colLayout3 = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));

      // Layout to hold intro and canvas
      introCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
      scrollContainer.add(introCanvas, { flex : 1 });  

      // Layout for first place columns
      fsPlaceCol1 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      fsPlaceCol2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 
      //fsPlaceCol3 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 

      // Layout for second place columns
      secPlaceCol1 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      secPlaceCol2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 
      //secPlaceCol3 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 
      // Layout for honorable mention place columns
      honPlaceCol1 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      honPlaceCol2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 
      //honPlaceCol3 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 
      // Layout for comments
      comCol1 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      comCol2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)); 

      // Layout for introduction
      introLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(30));  
      
      // Create a large bold font
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(26);

      // Author font
      authorFont = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      authorFont.set(
        {
          color      : "#75940c",     // android-green-dark
          decoration : "underline"
        });
      
      // Intro
      label = new qx.ui.basic.Label("Contest Winners");
      label.setFont(font);
      label.setWidth(500);

      introLayout.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "The 2012 App Contest had 125 submissions in four categories: K-8, High School, College/University, and Open. Google Nexus 7 Tablets are being awarded to the 1st place winners, with App Inventor books given for second place. There were many great apps submitted by developers age 8 to over 80! The following are just a few of the notable apps:", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          maxWidth    : 900
          //height   : 100   
        }
      );

      introLayout.add(desc); 
      introLayout.add(new qx.ui.core.Spacer(20)); 

      introCanvas.add(introLayout); 
      

      // First place
      font.setSize(20);
      label = new qx.ui.basic.Label("First Place K-8 Division");
      label.setFont(font);

      fsPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor."
		  + "mit.edu/#page%3DApp%26uid%3D12202"
		  + "6%26label%3DEz%20School%20Bus%20L"
		  + "ocator-Parent  > EZ School Bus Attender</a>",
          rich  : true
        });

      fsPlaceCol1.add(label); 

      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit."
		  + "edu/#page%3DApp%26uid%3D122026%26label%3DEz%"
		  + "20School%20Bus%20Locator-Parent  "
		  + "> EZ School Bus Parent</a>",
          rich  : true
        });

      fsPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Arjun Kumar");
      label.setUserData("username", "Arjun");
      this.addUserLink(label); 
      label.setFont(authorFont); 
      fsPlaceCol1.add(label); 

      //label = new qx.ui.basic.Label("Notes");
      //fsPlaceCol1.add(label); 

      desc = new qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This two app solution helps parents to track their kids on bus rides home from school. The solution uses bar code scanning so students can check in and out from the bus, GPS to track the bus location and automated SMS messages to keep parents informed. Arjun has already proposed this app to his school administration and gained permission to run it as a pilot program this Spring. Its absolutely phenomenal work, one of the most creative and well thought out app of any age group in our contest. Arjun is a seventh grade school student from Velammal Vidyashram school in Surapet, Chennai, India.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100 
        }
      );

      fsPlaceCol1.add(desc);
      fsPlaceCol1.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("His EZ School Bus app was featured as an app of the day at <a href= http://www.programmableweb.com/mashup/ez-school-bus-locator?date > Programmable Web</a>.");
      label.setRich(true); 
      fsPlaceCol1.add(label); 

      //label = new qx.ui.basic.Label("Arjun says this of App Inventor:");
      //fsPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "I am in third grade at Cumberland Elementary School in Whitefish Bay, WI. I am very interested in computers and programming. I started programming this year. First, I taught myself how to use Scratch and then I moved on to App Inventor. I wanted to be able to make apps for my Kindle Fire, so I decided to use App Inventor because it was a lot like Scratch. This is my first original app, but I have done others based off of tutorials.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      //fsPlaceCol1.add(desc);
      //fsPlaceCol1.add(new qx.ui.core.Spacer(20)); 

      font.setSize(20);
      label = new qx.ui.basic.Label("First Place High School Division");
      label.setFont(font);

      fsPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D123034%26label%3DPong%20Cubed > Pong Cubed </a>",
          rich  : true
        });

      fsPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Matt Caswell");
      label.setUserData("username", "Matt Caswell"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      fsPlaceCol2.add(label); 

      //label = new qx.ui.basic.Label("Notes");
      //fsPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This is a terrific version of the classic Pong game that lets you play against an auto-player (and the auto-player is really good!) or play against three other people on separate devices. Its a terrific examples of how App Inventor can be used to create a complex, multi-player game. Caswell is from Needham High School in Needham, Massachusetts.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      fsPlaceCol2.add(desc);
      fsPlaceCol2.add(new qx.ui.core.Spacer(20)); 

      //label = new qx.ui.basic.Label("Author Comments");
      //fsPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "SOME", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      //fsPlaceCol2.add(desc);
      //fsPlaceCol2.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("First Place College/University Division");
      label.setFont(font);

      fsPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D148003%26label%3DMolecular%20Movement >Molecular Movement</a>",
          rich  : true
        });

      fsPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Brian Nagy");
      label.setUserData("username", "Brian P Nagy"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      fsPlaceCol1.add(label);  

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This educational app teaches students about diffusion and osmosis and includes an animated lesson showing molecule movement and a multiple-choice post-lesson quiz. The app was created by Brian Nagy, a High School Biology teacher and grad student in the EdTech Master's program at Boise State.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      fsPlaceCol1.add(desc);
      fsPlaceCol1.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("First Place Open Division");
      label.setFont(font);

      fsPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D146011%26label%3DHealth%20Record > Health Record </a>",
          rich  : true
        });

      fsPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Duke Bonaventura");
      label.setUserData("username", "Duke Bonaventura"); 

      this.addUserLink(label); 
      label.setFont(authorFont); 
      fsPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This app lets you record information about your kids health and doctor visits. It is a great example of using App Inventor to fill a personal need-- Duke wanted a simple way to jot down notes when his kids went to the doctor. The app has a particularly professional-looking and easy-to-use UI-- check it out! ", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      fsPlaceCol2.add(desc);
      fsPlaceCol2.add(new qx.ui.core.Spacer(20)); 

      // Second place   
      label = new qx.ui.basic.Label("Second Place K-8 Division");
      font.setSize(20); 
      label.setFont(font);

      secPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D123020%26label%3DReading%20Log%20for%20Kids  > Reading Logs for Kids </a>",
          rich  : true
        });

      secPlaceCol1.add(label);

      // Author Label
      label = new qx.ui.basic.Label("Made By Jack Gordon");
      label.setUserData("username", "bmxguy100"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      secPlaceCol1.add(label); 

      label = new qx.ui.basic.Label("Notes");
      secPlaceCol1.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This kid-friendly, seven-screen app, created by third-grader Jack Gordon, lets you record the books you're reading,  time your reading sessions and keep a log of your reading time. The app solves a common need for young students and has been tested on both a Kindle Fire and a smart phone, with Jack's sister being test-user #1! Jack is a third grader at Cumberland Elementary School in Whitefish Bay, Wisconsin.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      secPlaceCol1.add(desc);
      secPlaceCol1.add(new qx.ui.core.Spacer(20));  

      //label = new qx.ui.basic.Label("Jack on Jack:");
      //secPlaceCol1.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "I am in third grade at Cumberland Elementary School in Whitefish Bay, WI. I am very interested in computers and programming. I started programming this year. First, I taught myself how to use Scratch and then I moved on to App Inventor. I wanted to be able to make apps for my Kindle Fire, so I decided to use App Inventor because it was a lot like Scratch. This is my first original app, but I have done others based off of tutorials.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      //secPlaceCol1.add(desc);
      //secPlaceCol1.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("Second Place High School Division");
      label.setFont(font);

      secPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D120023%26label%3DTiles! > Taber Tiles </a>",
          rich  : true
        });

      secPlaceCol2.add(label);

      // Author Label
      label = new qx.ui.basic.Label("Made By Taber Quigley");
      label.setUserData("username", "Taber Quigley"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      secPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "A great brain teaser game in which you touch tiles in an attempt to change all the same color. A well-designed game with good sound effects, a timer, the ability to reset, and instructions. Taber Quigley is a high school student who attends Canyons Technical Education Center (CTEC).", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      secPlaceCol2.add(desc);
      secPlaceCol2.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("Second Place College/University Division");
      label.setFont(font);

      secPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D158006%26label%3DLearn%20by%20the%20State-Idaho >Learn By State </a>",
          rich  : true
        });

      secPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Sherie Moran");
      label.setUserData("username", "o9t0z7"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      secPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "An app about the state of Idaho, it remixes a quiz, potato mash, potato chase game, and map tour with a nice UI and all Idaho style.  Sherie Moran is a 4th grade teacher who moonlights as a grad student in Boise St. EdTech Master's program.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      secPlaceCol1.add(desc);
      secPlaceCol1.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("Second Place Open Division");
      label.setFont(font);

      secPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D121024%26label%3DEdu%20Pool > Edupool </a>",
          rich  : true
        });

      secPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Joe Hammons");
      label.setUserData("username", "Joe Hammons"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      secPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This fun-to-play educational game lets you drag a pool ball to the right hole to answer  questions. The app includes fill-in-the-blank word problems and math problems and provides visual clues to help students. Joe Hammons is a retired elementary school teacher who has developed free educational games for kids on Apple and Windows computers. ", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      secPlaceCol2.add(desc);
      secPlaceCol2.add(new qx.ui.core.Spacer(20)); 

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D127007%26label%3DPhoto%20Shopping > Photo Shopping </a>",
          rich  : true
        });

      honPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Salvatore Pirrera");
      label.setUserData("username", "AppsGeniet"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This app lets you store pictures and information as you shop and has a complete user interface-- you can edit old items, navigate easily with image buttons, and the menus and forms provide great examples of how App Inventor can be used to create professional looking apps. Salvatore Pirrera is an architect who has published this and other apps on Google Play.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol1.add(desc);
      honPlaceCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D145001%26label%3DHidato%20Helper > Hidato Helper </a>",
          rich  : true
        });

      honPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Abraham Getzler");
      label.setUserData("username", "Downtown Abie"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "A terrific Sudoku like game created by Abraham Getzler.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol2.add(desc);
      honPlaceCol2.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D123021%26label%3DUltimate%20Chat  > Ultimate Chat </a>",
          rich  : true
        });

      honPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By William Tan");
      label.setUserData("username", "Ninja3047"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "A mobile chat app that provides a nice example of complex parsing within an App Inventor app. William Tan is a student at Needham High School in Needham, Massachusetts.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol1.add(desc);
      honPlaceCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D158001%26label%3DSet%20in%20the%20Park  > Set in the Park </a>",
          rich  : true
        });

      honPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Jess Saunders");
      label.setUserData("username", "jSanders"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "An app that provides visitors to San Diego's Balboa park with a brand new way to explore the buildings and landscape. You can also post your own information about the park using the easy-to-use interface. Jess Saunders has used app inventor for a couple of years and was previously a Flash developer.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol2.add(desc);
      honPlaceCol2.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href=  > Get Info </a>",
          rich  : true
        });

      honPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Samo Gaberscek");
      label.setUserData("username", ""); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "Originally developed by the author who couldn't find an app to extract menu info from websites onto his mobile device, this app provides a general purpose method to extract info from your favorite sites. Samo Gaberscek started using App Inventor just a month before the contest!", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol1.add(desc);
      honPlaceCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D121015%26label%3DCryptoDB > Crypt DB </a>",
          rich  : true
        });

      honPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Tommaso Martino");
      label.setUserData("username", "Tommaso Martino"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "An app that lets you store secret messages with cryptographic keys so that only one with the key can retrieve. The app was created by Tommaso Martino a medical student at University of Bari.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol2.add(desc);
      honPlaceCol2.add(new qx.ui.core.Spacer(20));  

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D148012%26label%3DSimplex%20Solver> Simplex Solver </a>",
          rich  : true
        });

      honPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Natengall");
      label.setUserData("username", "Natengall"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "An app for solving linear equations that can be used by engineers in the field. The app was created by Allen Tang, a CS undergrad at UM-Amherst.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol1.add(desc);
      honPlaceCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D119002%26label%3DComic%20Mania > Comic Mania </a>",
          rich  : true
        });

      honPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Napu Taitano");
      label.setUserData("username", "Pig16"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol2.add(label); 

      //label = new qx.ui.basic.Label("Notes");
      //honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This app collects comic books from the web to provide a nice one-stop-shop for browsing comics on your mobile device. You can cull the list down in settings, making it easy to choose your reading for the day. It was created by Napu Taitano, a home schooler, and it has already received top reviews on Google Play.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol2.add(desc);
      honPlaceCol2.add(new qx.ui.core.Spacer(20));

      //label = new qx.ui.basic.Label("Napu on his family and"
	//			    + " software testing procedure:");
      honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "My name is Napu Taitano. I am home schooled & have never taken a class on programming. About a year ago i began getting interested in developing Android applications and thought that App Inventor was the best choice. Since then i have posted a total of 7 Apps on Google Play.(I go by the name of Pig16).I live in a family of 7 (Soon to be 8) and at the moment our ages range from (Children wise including me) 2-16 so i have a lot of people to test my apps.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      //honPlaceCol2.add(desc);
      //honPlaceCol2.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D147004%26label%3DCar%20Run > CarRun </a>",
          rich  : true
        });

      honPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Cayden Caulfield");
      label.setUserData("username", "Cayden Caulfield"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This fun game lets you dodge the cars coming down the freeway and catch coins to increase your health. Cayden Caulfield is a student at Copper Hills High school in Jordan Utah and the Canyons Tech Education Center (CTEC) in Sandy, Utah.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol1.add(desc);
      honPlaceCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D121037%26label%3DWinDroid > Windroid </a>",
          rich  : true
        });

      honPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By George Dan");
      label.setUserData("username", "Ninja Enterprises"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This app collects some common app inventor apps -- a calculator, pong, minigolf-- into a Windows-type UI. The user interface is really nice and the app is a clever mashup of existing apps. George Dan is a 6th grader at CGS.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol2.add(desc);
      honPlaceCol2.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol1.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href=http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D124022%26label%3DSpellCoaster > SpellCoaster </a>",
          rich  : true
        });

      honPlaceCol1.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Saajidah Kalla");
      label.setUserData("username", "SaajidahKalla"); 
      this.addUserLink(label); 
      label.setFont(authorFont); 
      honPlaceCol1.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "Learn spelling by watching video of a roller coaster! Saajidah is a senior at Atlanta Girls School and this was her first experience engineering software.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol1.add(desc);
      honPlaceCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(20);
      label.setFont(font);

      honPlaceCol2.add(label);

      // App
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href=https://docs.google.com/open?id=0B_hxLosyph9cVXJoZC12SzFGaGM. > Starband </a>",
          rich  : true
        });

      honPlaceCol2.add(label); 

      // Author Label
      label = new qx.ui.basic.Label("Made By Steve Marcus");
      label.setFont(authorFont); 
      honPlaceCol2.add(label); 

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "This  \"space trading and exploration\" game is  loosely based on the 1984 game Elite. Steve Marcus  has been programming with App Inventor since its inception and was previously a Web/Html programmer. The zip file for this app won't load due to its size, but you can get to the APK via the link.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          width    : 450,
          height   : 100   
        }
      );

      honPlaceCol2.add(desc);
      honPlaceCol2.add(new qx.ui.core.Spacer(20));

      // Comments from the winners
      label = new qx.ui.basic.Label("Arjun says this of App Inventor:");
      font.setSize(20);

      comCol1.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "I was looking for a good programming class a month back…that’s when my parents suggested MIT App Inventor. As soon as I got started with this tool, I got fascinated since it supported and fueled my passion towards technology. Today, I feel so amazed and excited looking at the possibilities of extending App Inventor’s strengths using the numerous APIs available in the market.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          maxWidth    : 900,
          height   : 100   
        }
      );

      comCol1.add(desc);
      comCol1.add(new qx.ui.core.Spacer(20));

      // Comments from the winners
      label = new qx.ui.basic.Label("Duke:");
      font.setSize(20);

      comCol2.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "I have been playing around with App Inventor since it was first released by Google in 2010. I have an engineering background, not a programming background, but my brain works in computer logic which is why I enjoy making apps. I am very much an App Inventor hobbyist, usually making apps simply to satisfy a need that I have. For example the first app that I made would take predefined strings of text and randomly parse them together to send my wife a text message when I got to work each day. I've also been able to develop apps for my job. I work as a defense contractor and was able to develop multiple choice quiz apps for my client. Unfortunately I cannot share them with the community gallery because I technically don't own them! App Inventor has served as the perfect way to scratch my programming itch and my love for working with the Android OS. Thank you for all of your hard work to keep App Inventor running and evolving!!!", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          maxWidth    : 900,
          height   : 200   
        }
      );

      comCol2.add(desc);
      comCol2.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Jack:");
      font.setSize(20);

      comCol1.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "I am in third grade at Cumberland Elementary School in Whitefish Bay, WI. I am very interested in computers and programming. I started programming this year. First, I taught myself how to use Scratch and then I moved on to App Inventor. I wanted to be able to make apps for my Kindle Fire, so I decided to use App Inventor because it was a lot like Scratch. This is my first original app, but I have done others based off of tutorials.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          maxWidth    : 900,
          height   : 100   
        }
      );

      comCol1.add(desc);
      comCol1.add(new qx.ui.core.Spacer(20));

      label = new qx.ui.basic.Label("Napu on his family and software testing procedure:");
      font.setSize(20);

      comCol2.add(label);

      desc = new  qx.ui.form.TextArea("");
      desc.set(
        {
          value      : "My name is Napu Taitano. I am home schooled & have never taken a class on programming. About a year ago i began getting interested in developing Android applications and thought that App Inventor was the best choice. Since then i have posted a total of 7 Apps on Google Play.(I go by the name of Pig16).I live in a family of 7 (Soon to be 8) and at the moment our ages range from (Children wise including me) 2-16 so i have a lot of people to test my apps.", 
          appearance : "widget",
          readOnly : true,
          wrap     : true,
          maxWidth    : 900,
          height   : 100   
        }
      );

      comCol2.add(desc);
      comCol2.add(new qx.ui.core.Spacer(20));


      // Add everything properly 
      introCanvas.add(canvas); 

      // Second place header label
      font.setSize(24);
      label = new qx.ui.basic.Label("First Place");
      label.setFont(font);    
      canvas.add(label); 

      colLayout1.add(fsPlaceCol1); 
      colLayout1.add(fsPlaceCol2); 
      //colLayout1.add(fsPlaceCol3); 
      canvas.add(colLayout1); 

      // Second place header label 
      label = new qx.ui.basic.Label("Second Place");
      font.setSize(24);
      label.setFont(font);
      canvas.add(label);

      colLayout2.add(secPlaceCol1); 
      colLayout2.add(secPlaceCol2); 
      //colLayout2.add(secPlaceCol3);
      canvas.add(colLayout2);
      
      // Honorable mention label
      label = new qx.ui.basic.Label("Honorable Mention");
      font.setSize(24);
      label.setFont(font);
      canvas.add(label);

      colLayout3.add(honPlaceCol1);  
      colLayout3.add(honPlaceCol2);
      canvas.add(colLayout3); 

      // Comment label
      label = new qx.ui.basic.Label("Comments from the Winners");
      font.setSize(24);
      label.setFont(font);
      canvas.add(label);

      canvas.add(comCol1);
      canvas.add(comCol2); 
    },

    
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },

    /** Add a link to the user profile and set the cursor to a pointer*/
    addUserLink : function(label)
    {
      label.setCursor("pointer");

      label.addListener(
        "click",
        function(e)
        {
          var query;
          var displayName;

          // Prevent the default 'click' behavior
          //e.preventDefault();
          //e.stop();

          // Remove "by" from displayName
          //displayName = e.getTarget().getValue().substring(8); 
          displayName = e.getTarget().getUserData("username"); 

          // Launch user page module
          aiagallery.module.dgallery.userinfo.UserInfo.addPublicUserView(
            displayName);
        }); 
    }
  }
});
