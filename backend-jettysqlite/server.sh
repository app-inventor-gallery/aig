#!/bin/sh

echo "load(\"$1/script/jettysqlite.js\");" |
  java \
    -Xbootclasspath:/usr/lib/jvm/java-6-openjdk/jre/lib/rt.jar \
    -Djava.library.path=. \
    -classpath 'jars/*' \
    org.mozilla.javascript.tools.shell.Main
