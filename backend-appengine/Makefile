DESTDIR = war/WEB-INF/classes

CLASSES =					\
  $(DESTDIR)/startup/Environment.class		\
  $(DESTDIR)/startup/Main.class			\
  $(DESTDIR)/startup/RpcServlet.class		\
  $(DESTDIR)/startup/GuiServlet.class


all : $(CLASSES)

clean :
	find $(DESTDIR) -type f -exec rm {} \;

$(DESTDIR)/startup/%.class : startup/%.java
	mkdir -p $(DESTDIR)
	javac -classpath $(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')	\
	  -d $(DESTDIR)							\
	  $<

.PHONY: upload
upload :	all
	appengine-java-sdk-1.5.0.1/bin/appcfg.sh update war
