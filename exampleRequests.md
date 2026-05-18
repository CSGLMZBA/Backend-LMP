# REGISTER USER
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "",
    "userName": "",
    "email": "",
    "password": ""
  }'


# LOGIN USER
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "",
    "password": ""
  }'


# UPDATE USER
curl -X PATCH http://localhost:3000/api/auth/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BEARER_TOKEN" \
  -d '{
    "displayName": "",
    "userName": "",
    "email": "",
    "password": ""
  }'


# DELETE USER (SOFT DELETE)
curl -X DELETE http://localhost:3000/api/auth/USER_ID \
  -H "Authorization: Bearer BEARER_TOKEN"


# CREATE TEAM
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BEARER_TOKEN" \
  -d '{
    "name": "",
    "password": ""
  }'


# GET MY TEAMS
curl -X GET http://localhost:3000/api/teams \
  -H "Authorization: Bearer BEARER_TOKEN"


# GET SPECIFIC TEAM
curl -X GET http://localhost:3000/api/teams/TEAM_ID \
  -H "Authorization: Bearer BEARER_TOKEN"