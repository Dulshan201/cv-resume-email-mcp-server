#!/bin/bash
cd server
npm install
npx tsc --skipLibCheck
NODE_ENV=production npm start
