#!/bin/sh

java \
  -Djava.library.path=. \
  -classpath 'jars/*' \
  org.mozilla.javascript.tools.debugger.Main build/script/jettysqlite.js $*
