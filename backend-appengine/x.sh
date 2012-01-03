#!/bin/bash
set -x
set -v
PWD=`pwd`
JAR_FILE="${PWD}/war/WEB-INF/lib/js.jar:"

cd war/WEB-INF/classes
java -cp "$JAR_FILE" startup/Main
