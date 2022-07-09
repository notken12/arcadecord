# azure-container-registry-deploy.sh - Arcadecord
#
# Copyright (C) 2022 Ken Zhou
#
# This file is part of Arcadecord.
#
# Arcadecord can not be copied and/or distributed
# without the express permission of Ken Zhou.

echo "Logging in to Azure..."
az acr login --name arcadecord
docker tag arcadecord_web arcadecord.azurecr.io/arcadecord_web:latest
docker tag arcadecord_gameserver arcadecord.azurecr.io/arcadecord_gameserver:latest
docker tag arcadecord_shardmanager arcadecord.azurecr.io/arcadecord_shardmanager:latest
docker push arcadecord.azurecr.io/arcadecord_web:latest
docker push arcadecord.azurecr.io/arcadecord_gameserver:latest
docker push arcadecord.azurecr.io/arcadecord_shardmanager:latest
echo "Images now in the registry:"
az acr repository list --name arcadecord --output table
