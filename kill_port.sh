#!/bin/bash

## This script kills ports: 6000, 8080, 5432 on the host machine where it is run

PORTS=(6000 8080 5432)

kill_port() {
  local PORT=$1
  if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    # MacOS or Linux
    PID=$(lsof -t -i :$PORT)
    if [ ! -z "$PID" ]; then
      kill -9 $PID
      echo "Killed process $PID running on port $PORT"
    else
      echo "No process found running on port $PORT"
    fi
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    PID=$(netstat -ano | findstr :$PORT | awk '{print $5}')
    if [ ! -z "$PID" ]; then
      taskkill /PID $PID /F
      echo "Killed process $PID running on port $PORT"
    else
      echo "No process found running on port $PORT"
    fi
  else
    echo "Unsupported OS"
  fi
}

for PORT in "${PORTS[@]}"; do
  kill_port $PORT
done