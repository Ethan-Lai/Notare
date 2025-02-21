#!/bin/bash

set -e
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib nodejs npm
    POSTGRES_START_CMD="sudo service postgresql start"
    PSQL_CMD="sudo -u postgres psql"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew update
    brew install postgresql node
    POSTGRES_START_CMD="brew services start postgresql"
    PSQL_CMD="sudo psql -U postgres"
else
    echo "currently unsupported OS: $OSTYPE"
    exit 1
fi
$POSTGRES_START_CMD

$PSQL_CMD <<EOF
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
DATABASE_URL="postgresql://postgres:momongausagi@localhost:5432/notesdb?schema=public"
EOF
npm install
npx prisma generate
npx prisma migrate dev --name init_postgres
npm run dev

