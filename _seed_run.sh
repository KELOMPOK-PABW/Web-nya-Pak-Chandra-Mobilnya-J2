#!/bin/bash
export DATABASE_URL="mysql://root:impro123@localhost:3306/pabw"
node backend/scripts/seed_products.js
