sudo docker compose -f ./docker-compose-vpn.yml down
sudo docker compose -f ./docker-compose-services.yml down
sudo docker compose -f ./docker-compose-core.yml down

sudo rm ./logs/traefik/traefik.log
python3 apply_config.py

sudo docker compose -f ./docker-compose-core.yml up -d
sudo docker compose -f ./docker-compose-services.yml up -d
sudo docker compose -f ./docker-compose-vpn.yml up -d