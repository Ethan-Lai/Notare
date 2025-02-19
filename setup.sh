#!/bin/bash

set -e  # Exit immediately if any command fails

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib nodejs npm
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew update
    brew install postgresql node
else
    echo "add more or just leave it here, unsupported"
    exit 1
fi
if pgrep -x "postgres" > /dev/null
then
    echo "postgreSQL is already running? did you think it wasn't?"
else
    sudo service postgresql start
fi
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'newpassword';
    END IF;
END
\$\$;

CREATE DATABASE notesdb OWNER postgres;
EOF
cd "$(dirname "$0")"
cat > .env <<EOF
DATABASE_URL="postgresql://postgres:newpassword@localhost:5432/notesdb?schema=public"
EOF
npm install
npx prisma generate
npx prisma migrate dev --name init_postgres
npm run dev

