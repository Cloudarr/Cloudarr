#!/bin/bash

# Sets up guacamole db and folders

# Function to parse .env file and export variables
load_env() {
  local env_file="$1"
  if [ -f "$env_file" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      # Skip comments and empty lines
      if [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]]; then
        continue
      fi

      # Check if the line contains a valid key-value pair
      if ! [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*=.*$ ]]; then
        echo "Skipping malformed line: $line"
        continue
      fi

      # Export each line as an environment variable
      export "$line"
    done < "$env_file"
  else
    echo "File $env_file not found"
    return 1
  fi
}

# Load .env file
load_env ".env"

CONFIGDIR=$(echo $CONFIGDIR | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//")
CONFIGDIR=$(realpath ${CONFIGDIR})
echo $CONFIGDIR
mkdir -p $CONFIGDIR/guacamole
if ! (docker ps >/dev/null 2>&1)
then
	echo "Docker daemon not running, exiting!"
	exit
fi
echo "Preparing folder init and creating $CONFIGDIR/guacamole/postgres/init/initdb.sql"
mkdir  -p $CONFIGDIR/guacamole/postgres/init/ >/dev/null 2>&1
chmod -R +x $CONFIGDIR/guacamole/postgres/init/
docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --postgresql > $CONFIGDIR/guacamole/postgres/init/initdb.sql
echo "done"

# Maybe later, openid setup
# if [ -e "${CONFIGDIR}/authelia/keys/private.pem" ]; then
#   echo "Authelia certificates already generated. Skipping generation."
# else
#   echo "Authelia certificates not found. Generating new certificates."
#   # Creates public and private.pem
#   sudo docker run -u "$(id -u):$(id -g)" -v ${CONFIGDIR}/authelia/keys/:/keys authelia/authelia:latest authelia crypto pair rsa generate --bits 4096 --directory /keys
#   # Creates public.crt
#   sudo docker run -u "$(id -u):$(id -g)" -v ${CONFIGDIR}/authelia/keys:/keys authelia/authelia:latest authelia crypto certificate rsa generate --common-name $DOMAINNAME --directory /keys
# fi