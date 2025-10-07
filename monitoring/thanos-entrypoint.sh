#!/bin/sh

sed "s/\${ACCESS_KEY_ID}/$ACCESS_KEY_ID/g; s/\${SECRET_ACCESS_KEY}/$SECRET_ACCESS_KEY/g" \
    /etc/thanos/objstore.yml.template > /etc/thanos/objstore.yml

exec /bin/thanos "$@"
