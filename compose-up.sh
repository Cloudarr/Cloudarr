sudo docker compose -f ./docker-compose-requesters.yml down
sudo docker compose -f ./docker-compose-services.yml down
sudo docker compose -f ./docker-compose-network.yml down

sudo rm ./logs/traefik/traefik.log
sudo rm ./logs/authelia/authelia.log
python3 apply_config.py

sudo docker compose -f ./docker-compose-network.yml up -d
sudo docker compose -f ./docker-compose-services.yml up -d
sudo docker compose -f ./docker-compose-requesters.yml up -d