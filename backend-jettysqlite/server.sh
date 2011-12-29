#!/bin/sh

java \
  -Djava.library.path=. \
  -classpath 'jars/*' \
  org.mozilla.javascript.tools.shell.Main source/script/jettysqlite.js $*
