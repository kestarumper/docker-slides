#!/bin/sh
curl --unix-socket /var/run/docker.sock localhost/images/json
