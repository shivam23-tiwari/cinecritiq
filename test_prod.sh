export NODE_ENV=production
node dist/server.cjs &
sleep 2
curl -s http://localhost:3000/api/foo | head -n 5
kill %1
