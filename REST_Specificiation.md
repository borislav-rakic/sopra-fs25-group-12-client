# SoPra: Group 12

## REST Specification

### User

| Mapping         | Method | Request / DTO | Response / DTO                | Status Code                 | Description                                                                     |
| --------------- | ------ | ------------- | ----------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| /users          | GET    | [path only]   | UserDTO[]<br>ErrorResponseDTO | 200 OK<br>500 Server Error  | Return list of all users.                                                       |
| /users          | POST   | UserCreateDTO | UserDTO<br>ErrorResponseDTO   | 201 Created<br>409 Conflict | Successfully added user.<br>Failed:username exists.                             |
| /users/{userId} | GET    | Long userId   | UserDTO<br>ErrorResponseDTO   | 200 OK<br>404 Not Found     | Retrieve (limited) user profile with userId.<br>User with userId was not found. |
| /users/{userId} | PUT    | UserUpdateDTO | UserDTO<br>ErrorResponseDTO   | 200 OK<br>404 Not Found     | Updated user profile.<br>User with userId was not found.                        |

### Login/Logout

| Mapping | Method | Request / DTO   | Response / DTO                       | Status Code                        | Description                                            |
| ------- | ------ | --------------- | ------------------------------------ | ---------------------------------- | ------------------------------------------------------ |
| /login  | POST   | LoginRequestDTO | LoginResponseDTO<br>ErrorResponseDTO | 200 OK<br>401 Unauthorized         | Successful login.<br>Error: Faulty credentials.        |
| /logout | POST   |                 | 204 No Content<br>ErrorResponseDTO   | 204 No Content<br>401 Unauthorized | Successful logout.<br>Denied logout: token was not ok. |

### Friends

| Mapping                  | Method | Request / DTO | Response / DTO                       | Status Code                     | Description                                        |
| ------------------------ | ------ | ------------- | ------------------------------------ | ------------------------------- | -------------------------------------------------- |
| /users/me/friends        | GET    | [path only]   | List <FriendDTO><br>ErrorResponseDTO | 200 OK<br>401 Unauthorized      | Get list of logged-in user's friends.              |
| /users/{userId}/friends  | GET    | Long userId   | List <FriendDTO><br>ErrorResponseDTO | 200 OK<br>401 Unauthorized      | Show list of user {userId}'s friends.              |
| /users/{userId}/friends/ | POST   | Long userId   | 204 No Content<br>ErrorResponseDTO   | 204 No Content<br>404 Not Found | Friend request sent.<br>Found no User with userId. |
| /users/{userId}/friends/ | DELETE | Long userId   | 204 No Content<br>ErrorResponseDTO   | 204 No Content<br>404 Not Found | Friend removed.<br>Found no User with userId.      |
| /users/{userId}/friends/ | PUT    | Long userId   | 204 No Content<br>ErrorResponseDTO   | 204 No Content<br>404 Not Found | Update friendship status                           |

### Matches

| Mapping                             | Method | Request / DTO                | Response / DTO                                     | Status Code                                | Description                                                                            |
| ----------------------------------- | ------ | ---------------------------- | -------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| /matches                            | POST   | MatchCreateDTO               | MatchDTO<br>ErrorResponseDTO                       | 201 Created<br>401 Unauthorized.           | Successfully created match.<br>Error: Faulty token.                                    |
| /matches/{matchId}                  | GET    | Long matchId                 | MatchDTO<br>ErrorResponseDTO                       | 200 OK<br>404 Not Found                    | Get match details.<br>No match with matchID found.                                     |
| /matches/{matchId}/join             | POST   | PlayerDTO                    | MatchDTO<br>ErrorResponseDTO                       | 200 OK<br>400 Bad Request                  | Seat reserved on match.<br>Joining not possible (e.g. overbooked).                     |
| /matches/{matchId}/start            | POST   | [GameOwnerOnly]              | MatchDTO<br>ErrorResponseDTO                       | 200 OK<br>403 Forbidden                    | Start the game.<br>Not all Players ready.                                              |
| /matches/{matchId}/rounds/{roundId} | GET    | Long matchID,<br>int roundId | RoundDTO<br>ErrorResponseDTO                       | 200 OK<br>404 Not Found                    | Get stats on round.<br>No such round played, yet.                                      |
| /matches/{matchId}/play/            | POST   | PlayCardDTO                  | PlayedCardDTO ErrorResponseDTO<br>ErrorResponseDTO | 200 OK<br>404 Not Found<br>400 Bad Request | Card accepted in this round.<br>No such game or round at play.<br>Illegal card played. |

### Leaderboard

| Mapping              | Method | Request / DTO    | Response / DTO                                         | Status Code                                        | Description                                                                                                  |
| -------------------- | ------ | ---------------- | ------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| /leaderboard/        | GET    | n/a              | LeaderBDTO                                             | 200 OK                                             | Return leaderboard data.                                                                                     |
| /leaderboard/friends | GET    | n/a              | LeaderBDTO                                             | 200 OK<br>401 Unauthorized                         | Return leaderboard data of friends only.<br>Only logged in users can use this feature.                       |
| /leaderboard/update  | POST   | LeaderBUpdateDTO | 204 No Content<br>ErrorResponseDTO<br>ErrorResponseDTO | 204 No Content<br>404 Not Found<br>400 Bad Request | Score of listed players was updated.<br>This matchId/matchToken not found.<br>Mismatch of match and players. |
