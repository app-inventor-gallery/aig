DESTDIR = war/WEB-INF/classes

CLASSES =					\
  $(DESTDIR)/startup/Main.class			\
  $(DESTDIR)/startup/Environment.class


all : $(CLASSES)

clean :
	find $(DESTDIR) -type f -exec rm {} \;

$(DESTDIR)/startup/Main.class : startup/Main.java
	mkdir -p $(DESTDIR)
	javac -classpath $(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')	\
	  -d $(DESTDIR)							\
	  $<

$(DESTDIR)/startup/Environment.class : startup/Environment.java
	mkdir -p $(DESTDIR)
	javac -classpath $(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')	\
	  -d $(DESTDIR)							\
	  $<
