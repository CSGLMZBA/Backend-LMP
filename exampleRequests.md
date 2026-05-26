#REGISTER
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "userName": "johndoe",
    "email": "john@test.com",
    "password": "123456"
  }'


#LOGIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "newpassword123"
  }'

"success":true,"message":"Login successfull","data":{"user":{"id":"Cs7Uu52DyaH7iDqHnqN1","displayName":"John Doe","userName":"johndoe","email":"john@test.com","rol":"cliente","active":true,"createdAt":{"_seconds":1779253361,"_nanoseconds":415000000},"updatedAt":{"_seconds":1779253361,"_nanoseconds":415000000}},"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1MzQ3LCJleHAiOjE3NzkyNTg5NDd9.yZaiuw1QBZ_52OUQtUqeMRSeHJvMk1fw8xgyQUEKEAI","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkNzN1V1NTJEeWFIN2lEcUhucU4xIiwicm9sIjoiY2xpZW50ZSIsInRva2VuVmVyc2lvbiI6MCwiaWF0IjoxNzc5MjU1MzQ3LCJleHAiOjE3NzkyODA1NDd9.UqekJ2X1l6dDK2HZXJSwR88_3uAGkrTT5kgqJK6GoSU"}}

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