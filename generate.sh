#!/usr/bin/env bash

echo "Project Name:"
read PROJECT_NAME


echo "AlexisHR API Key:   (Provisioned in Alexsis Admin Account)"
read ALEXIS_API_KEY


API_KEY=$(openssl rand -base64 12)


cp package.json.tmpl package.json
sed -i "s/<PROJECT_NAME>/${PROJECT_NAME}/g" package.json

cp wrangler.toml.tmpl wrangler.toml
sed -i "s/<PROJECT_NAME>/${PROJECT_NAME}/g" wrangler.toml
sed -i "s/<API_KEY>/${API_KEY}/g" wrangler.toml

npm install

npx wrangler login

STORE_LOG=$(npx wrangler kv:namespace create AlexisStore)
echo "$STORE_LOG"
STORE_KEY=$(echo "$STORE_LOG" | grep -E -o "[0-9a-f]{32}")
sed -i "s/<AlexisStore_ID>/${STORE_KEY}/g" wrangler.toml

STORE_LOG_P=$(npx wrangler kv:namespace create AlexisStore  --preview)
echo "$STORE_LOG_P"
STORE_KEY_P=$(echo "$STORE_LOG_P" | grep -E -o "[0-9a-f]{32}")
sed -i "s/<AlexisStore_PREVIEW_ID>/${STORE_KEY_P}/g" wrangler.toml

echo $ALEXIS_API_KEY | npx wrangler secret put ALEXIS_API_KEY
echo "ALEXIS_API_KEY = \"${ALEXIS_API_KEY}\"" > .dev.vars

echo "Testing run: npx wrangler dev --test-scheduled"
echo "           : sync alexis (cronjob), curl http://localhost:8787/__scheduled"
echo "           : get ical, curl http://localhost:8787?api-key=$API_KEY ## Returns all"
echo "           : get ical, curl http://localhost:8787?api-key=$API_KEY&departments=Devlopers"
echo "           : get ical, curl http://localhost:8787?api-key=$API_KEY&departments=Devlopers,Sales"
echo
echo "Publish to production: npx wrangler deploy"
