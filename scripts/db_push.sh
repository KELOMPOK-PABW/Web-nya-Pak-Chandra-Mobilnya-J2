#!/bin/bash
cd "$(dirname "$0")/../backend"
export DATABASE_URL="mysql://root:impro123@localhost:3306/pabw"
npx prisma db push
