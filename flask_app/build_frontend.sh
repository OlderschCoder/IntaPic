#!/bin/bash
cd ..
npm run build
mkdir -p flask_app/static
cp -r dist/* flask_app/static/
echo "Frontend built and copied to flask_app/static/"
