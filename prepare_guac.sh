# Sets up guacamole db
if ! (docker ps >/dev/null 2>&1)
then
	echo "docker daemon not running, exiting!"
	exit
fi
echo "Preparing folder init and creating ./config/guacamole/postgress/init/initdb.sql"
mkdir  -p ./config/guacamole/postgress/init/ >/dev/null 2>&1
chmod -R +x ./config/guacamole/postgress/init/
docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --postgresql > ./config/guacamole/postgress/init/initdb.sql
echo "done"

