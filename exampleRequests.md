#REGISTER
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "userName": "johndoe",
    "email": "john@test.com",
    "password": "123456"
  }'
"success":true,"message":"User Registered","data":{"id":"ws6gsJkzDHmZOafb9Iln","displayName":"John Doe","userName":"johndoe","email":"john@test.com","rol":"cliente","status":"online","active":true,"createdAt":{"_seconds":1779373433,"_nanoseconds":47000000},"updatedAt":{"_seconds":1779373433,"_nanoseconds":47000000}}}s
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe 3",
    "userName": "johndoe3",
    "email": "john3@test.com",
    "password": "123456910"
  }'
{"success":true,"message":"User Registered","data":{"id":"QGNgzOoXg5bPI4y677Hi","displayName":"John Doe 3","userName":"johndoe3","email":"john3@test.com","rol":"cliente","status":"online","active":true,"createdAt":{"_seconds":1779373460,"_nanoseconds":639000000},"updatedAt":{"_seconds":1779373460,"_nanoseconds":639000000}}}


#LOGIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "newpassword123"
  }'



#GET SELF
curl http://localhost:3000/api/auth/me \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1ODMwLCJleHAiOjE3NzkyNTk0MzB9.ugbMzpfZRmBcILhMnG99K2Gt0n-Dc33XBRXv0sg7IDw"

#REFRESH
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1MzQ3LCJleHAiOjE3NzkyODA1NDd9.UqekJ2X1l6dDK2HZXJSwR88_3uAGkrTT5kgqJK6GoSU"
  }'

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1ODMwLCJleHAiOjE3NzkyNTk0MzB9.ugbMzpfZRmBcILhMnG99K2Gt0n-Dc33XBRXv0sg7IDw

#LOGOUT
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1ODMwLCJleHAiOjE3NzkyNTk0MzB9.ugbMzpfZRmBcILhMnG99K2Gt0n-Dc33XBRXv0sg7IDw"

#CHANGE PASSWORD
curl -X PATCH http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1MzQ3LCJleHAiOjE3NzkyNTg5NDd9.yZaiuw1QBZ_52OUQtUqeMRSeHJvMk1fw8xgyQUEKEAI" \
  -d '{
    "oldPassword": "123456",
    "password": "newpassword123"
  }'




curl -X GET http://localhost:3000/api/users

#POST USER
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe 2",
    "userName": "johndoe2",
    "email": "john2@test.com",
    "password": "1234567"
  }'

#PUT USER
curl -X PUT http://localhost:3000/api/users/Cs7Uu52DyaH7iDqHnqN1 \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe 3",
    "userName": "johndoe3",
    "email": "john3@test.com",
    "password": "123456798",
    "activo" : true
  }'

#PUT USERS DON'T WORK
curl -X P http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe 3",
    "userName": "johndoe3",
    "email": "john3@test.com",
    "password": "123456798",
    "activo" : true
  }'

#PATCH STATUS
curl -X PATCH http://localhost:3000/api/users/ws6gsJkzDHmZOafb9Iln/status \
  -H "Content-Type: application/json" \
  -d '{
    "status" : "offline"
  }'

