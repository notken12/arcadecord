curl "https://api.mogo.gov/socket.io/?EIO=4&transport=polling" -k --cookie "INGRESSCOOKIE=1653356583.102.43.266935|2f7b94802c77e7067b59a3bb091ed2aa

curl --include \
       --no-buffer \
       --header "Connection: Upgrade" \
       --header "Upgrade: websocket" \
       --header "Host: api.mogo.gov" \
       --header "Origin: http://mogo.gov" \
       --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
       --header "Sec-WebSocket-Version: 13" \
  -k \
  --cookie "INGRESSCOOKIE=1653356583.102.43.266935|2f7b94802c77e7067b59a3bb091ed2aa" \
       "https://api.mogo.gov/socket.io/?EIO=4&transport=polling&sid=v18imDNJEdE38lWjAAAE"
