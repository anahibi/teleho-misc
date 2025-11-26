# teleho-misc

Misskey(テレホ鯖)と必要なコンポーネントをDockerコンテナで動かすためのスクリプト群です。  
Misskey、Postgresql(PGroonga)、Redis、Nginx(OpenResty)、CloudflareTunnelを使います。  
Misskeyのバージョンアップスクリプトもあります。  

## 設定ファイル作成

設定ファイルを作成します。  

```
cp .env.example .env
cp .env_update.example .env_update
```

.envは、PostgresqlとRedisの認証情報と、Cloudflare Tunnelのトークンを設定します。

```
POSTGRES_DB=mk1
POSTGRES_USER=misskey
POSTGRES_PASSWORD=
REDIS_PASSWORD=
TUNNEL_TOKEN=
```

.env_updateは、MISSKEY_TAGで実行したいMisskeyバージョンを指定します。  
後述するupdate_misskey.shを実行する場合は、MISSKEY_INSTANCEとACCESS_TOKENも設定が必要です。

```
MISSKEY_TAG=2025.11.0
MISSKEY_INSTANCE="https://example.com"
ACCESS_TOKEN=""
```

## Misskeyの設定

./misskey/config.yml にMisskeyの設定を記載してください。

## Nginxの設定

./niginx/conf.d/ 配下に設定ファイルを作成してください。

## コンテナの起動

以下のコマンドでMisskey、Redis、Postgresqlが起動します。

```
docker compose up -d
```

NginxとCloudflare Tunnelを起動する場合は次のコマンドを使います。

```
docker compose --profile cf --profile proxy up -d
```

正常性確認は次のコマンドで行います。

```
docker compose ps
```

結果の例
```
nakkaa@teleho-web:/opt/misskey$ docker compose ps
NAME               IMAGE                              COMMAND                  SERVICE   CREATED      STATUS                  PORTS
misskey-db-1       groonga/pgroonga:4.0.4-alpine-16   "docker-entrypoint.s…"   db        2 days ago   Up 24 hours (healthy)   5432/tcp
misskey-mi-1       misskey/misskey:2025.11.0          "/usr/bin/tini -- pn…"   mi        2 days ago   Up 24 hours (healthy)   
misskey-redis-1    redis:8-alpine                     "docker-entrypoint.s…"   redis     2 days ago   Up 24 hours (healthy)   6379/tcp
misskey-tunnel-1   cloudflare/cloudflared             "cloudflared --no-au…"   tunnel    2 days ago   Up 24 hours             
nginx              nginx:stable-alpine                "/docker-entrypoint.…"   nginx     2 days ago   Up 24 hours             80/tcp
```

## Misskeyのバージョンアップ

`update_misskey.sh` を使うことで、Misskeyを最新の開発版(Alpha, Beta, RC)あるいは GA版に更新できます。

```
./update_misskey.sh
```

cronに仕込むと、毎日最新のMisskeyを適用することができます。  
現状では、開発版と正式版を適用します。正式版のみを適用することはできません。

cronの例
```
0 0 * * * /opt/misskey/update_misskey.sh 
```

## Postrgesqlのチューニング

[PGTune](https://pgtune.leopard.in.ua/)でPostgresqlのチューニングをおすすめします。  
postgresql.confはボリュームマウントしていないため、`ALTER SYSTEM SET` コマンドで投入してください。
