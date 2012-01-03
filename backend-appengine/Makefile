war/WEB-INF/classes/startup/Main.class : startup/Main.java
	mkdir -p war/WEB-INF/classes
	javac -classpath	$(shell find war/WEB-INF/lib		\
			    -name '*.jar' -print0 | tr '\0' ':')	\
	  -d war/WEB-INF/classes					\
	  startup/Main.java

#war/WEB-INF/classes/Main.class : startup/Main.js
#	mkdir -p war/WEB-INF/classes
#	java -classpath	$(shell find war/WEB-INF/lib			\
#			    -name '*.jar' -print0 | tr '\0' ':')	\
#	  org.mozilla.javascript.tools.jsc.Main				\
#	  -d war/WEB-INF/classes					\
#	  -package startup						\
#	  -extends javax.servlet.http.HttpServlet			\
#	  startup/Main.js
#
