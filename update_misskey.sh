#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$(realpath "$0")")
ENV_FILE="$SCRIPT_DIR/.env_update"
BACKUP_FILE="$SCRIPT_DIR/.env_update.bak"

source $ENV_FILE

cp "$ENV_FILE" "$BACKUP_FILE"

echo "Fetching the latest Misskey tag ..."

# Docker Hubからタグを取得してフィルタ
LATEST_TAG=$(curl -s "https://hub.docker.com/v2/repositories/misskey/misskey/tags?page_size=100" \
  | jq -r '.results[].name | select(test("^[0-9]+\\.[0-9]+\\.[0-9]+(-[a-z]+\\.[0-9]+)?$"))' \
  | head -n1)

if [ -z "$LATEST_TAG" ]; then
  echo "Error: No valid tags found."
  exit 1
fi

echo "Latest Misskey tag: $LATEST_TAG"

# .env の MISSKEY_TAG を更新または追加
if grep -q "^MISSKEY_TAG=" "$ENV_FILE"; then
  sed -i.bak "s/^MISSKEY_TAG=.*/MISSKEY_TAG=$LATEST_TAG/" "$ENV_FILE"
else
  echo "MISSKEY_TAG=$LATEST_TAG" >> "$ENV_FILE"
fi

if cmp -s "$ENV_FILE" "$BACKUP_FILE"; then
  echo "skipping docker compose pull because .env is unchanged."
else
  echo "env file is changed."
  /usr/bin/docker compose -f $SCRIPT_DIR/compose.yml pull mi
  echo "docker compose pull completed."

  curl -s -X POST "$MISSKEY_INSTANCE/api/notes/create" \
  -H "Content-Type: application/json" \
  -d '{"i": "'"$ACCESS_TOKEN"'", "text": "'60秒後に"$LATEST_TAG"にバージョンアップします。'"}'

  sleep 60
  echo "docker compose down and up started."
  /usr/bin/docker compose -f $SCRIPT_DIR/compose.yml down mi
  /usr/bin/docker compose -f $SCRIPT_DIR/compose.yml up mi -d

  sleep 60
  curl -s -X POST "$MISSKEY_INSTANCE/api/notes/create" \
  -H "Content-Type: application/json" \
  -d '{"i": "'"$ACCESS_TOKEN"'", "text": "'バージョンアップ完了しました。'"}'

  /usr/bin/docker system prune -fa
fi

rm "$BACKUP_FILE"

echo "completed"