#!/bin/sh
set -e

mc alias set postflow http://minio:9000 postflow postflowsecret
mc mb --ignore-existing postflow/postflow-media
mc anonymous set download postflow/postflow-media
