# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 26.03.2025 to 02.04.2025

| **Student**          | **Date**   | **Link to Commit**                                                                                           | **Description**                                                                                                                                                                   | **Relevance**                                                                                                                                          |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **@stevaniaeilyn**   | 26.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/403f08d3c106311c8747e6a4ea60168c79b3f66f | Base Layout Template for All Pages + First implementation of Landing Page, Landing Page User, Rules Page, Register Page & Login Page                                              | This contribution is relevant because it marks the first implementation of frontend pages & laid the foundation to build further features.             |
|                      | 26.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/e2fa873b10e09e674eb5d03a98b0dd21b4ad4924 | Complete Implementation of Register Page & Login Page without Avatars                                                                                                             | This commit is relevant because it completes the implementation of the Register and Login pages, enabling users to create & login into their accounts. |
|                      | 28.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/b787ce2c8961c709221a5162fce104604c56209c | Add avatars, develop join page, first implementation of settings, start page & users/[id] page                                                                                    | This contribution laid the foundation to build further features.                                                                                       |
| **@diderot5038**     | 2025-03-28 | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/f1e38928b21363c0875c8187d7db987f69b820c4 | Created API GET /leaderboard                                                                                                                                                      | For our leaderboard feature, we need to be able to pull that data from the db, while sorting, filtering, paginating it.                                |
|                      | 2025-03-28 | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/282ab373f31af73064006048b89915649c0a91e1 | Created API POST /users and GET /users/{userId}                                                                                                                                   | POST to /users creates a new User account; GET to /users/{userId} retrieves data on individual User.                                                   |
|                      | 2025-03-30 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/b80a7e0e6a1bc4608e5251e7518c2ffe7577c3a7 | Created API PUT /users and an accompanying client page /profile so username, birthday and avatar can be changed and saved.                                                        | Users need to be able to change their profiles.                                                                                                        |
| **@borislav-rakic**  | 28.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/ee21341f0ea5d7f0989b6927e116d700f297765e | Create the DTO classes for the match management                                                                                                                                   | The DTO classes are needed for the implementation of the game logic.                                                                                   |
|                      | 29.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/d8e9815d03c5b8cc32d832583efb24e499fa0dc8 | Some match management API calls for starting a match, getting information from all matches, and getting information for a specific match (+test cases).                           | These API calls will be used, when creating a new match, and searching for an existing match to join.                                                  |
|                      | 30.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/db3b794a4c6e53a595302653ba7e7ddb9bb1367a | Makes sure that the POST request comes from a valid user.                                                                                                                         | This is important, because we don't want just anyone to be able to start a new match. Instead, a user should be logged in with a valid account.        |
|                      | 31.03.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/47abc11746257f5685530273b49e7caa8a30258a | GET request at /matches to get match information                                                                                                                                  | This is important for players to be able to find all currently active matches in order to join.                                                        |
| **@dominiqueheller** | 02.04.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/00c5c0f8d96874c533fcbcab0bdfc3d175a518f1 | Made a general layout of how the match screen should look, along with various styles.                                                                                             | Without an existing Match page it is hard to continue development of the game itself                                                                   |
|                      | 02.04.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/00c5c0f8d96874c533fcbcab0bdfc3d175a518f1 | Added first buttons to test local functionality of the game itself, such as adding a card to a players hand                                                                       | Users need to be able to see the information regarding the game, such as how many cards and what kinds of cards they have in their hand                |
|                      | 02.04.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/00c5c0f8d96874c533fcbcab0bdfc3d175a518f1 | Added extra UI elements to match page such as a scoreboard and settings widget, as well as areas for player information such as username, current round score and profile picture | Keeping track of who a user is playing against and what the score of the game and round is needs to be handled by the app, not the player              |

---

## Contributions Week 2 - 03.04.2025 to 09.04.2025

| **Student**          | **Date**              | **Link to Commit**                                                                                                                                                                                                            | **Description**                                                                      | **Relevance**                                                                                                                                                                     |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **@stevaniaeilyn**   | 05.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/6b14f6b0feebea27cf9cd3f1cb4ddb7954071524<br/>https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/590cc64eb11ac2a234a153b1b1bcaabcf88a1fa8 | Implement Start Page and Invitation Handling                                         | Retrieves and setting all Match Informations, invite other players, accept or decline requests.                                                                                   |
|                      | 06.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/d49b1a4a7576a37414656facab676e5bffe4d741<br/>https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/7af4212ae80241d778ddcd09ea6aaf9e767a01e0 | Implement Join Page and Join Handling                                                | Users can join matches                                                                                                                                                            |
| **@diderot5038**     | 04.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/a8bfd7f853b2f8819753e815d02aa73d819b6fec                                                                                                                  | Implemented friends page in frontend.                                                | Users can search for friends, send and unsend them friendship requests; accept or decline such requests and terminate friendships now.                                            |
|                      | 04.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/ed3ade3c26932488bfd79ae0c3f5b5cf64d2d92a                                                                                                                  | Implemented APIs GET /users/me/friends and POST/GET/PUT/DELETE /users/{id}/friends.  | Backend now handles friends requests consistently and reliably.                                                                                                                   |
|                      | 04.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/42e28a079c80cbb8c514c0862a4271ea9cffea8f                                                                                                                  | Added numerous tests on UserServices and FriendshipController.                       | Trying to get closer to those 50% in SonarCloud test coverage.                                                                                                                    |
| **@borislav-rakic**  | 05.04.2025/06.04.2025 | https://github.com/borislav-rakic/sopra-fs25-group-12-client/commit/effdb8afb7f14ae4ddd658f9d20498ed2cdc0ef7                                                                                                                  | The client requests new information about the match every 5 seconds while in a game. | The returned information gives the client information like, which player is in what position, whose turn is it, what are my cards, etc.                                           |
|                      | 06.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/5458a126ce360188fd1b94e183d5369fc659ec0e                                                                                                                  | Additional fields + a relation were added                                            | These additional fields and the relation will be used when implementing the game logic.                                                                                           |
|                      | 06.04.2025            | https://github.com/borislav-rakic/sopra-fs25-group-12-server/commit/27178cbe7508b17bcd9451bef2478f45b9e0a98e                                                                                                                  | Additional fields and an API access point were added.                                | The additional fields are used for the Front-end to receive the match information, which can be requested by accessing the additional API acces point (/matches/{matchId}/logic). |
| **@dominiqueheller** | 08.04.2025 | [commit link] | Added a settings popup menu, which allows the player to change details of the game. Currently playmat and cardback | One of our userstories is to allow cosmetic customizations during a game |
|                      | 09.04.2025 | [commit link] | Made a specific card object with interface, allowing for card generation according to information the server will provide | We need to generate the cards the server sends us in order to play the game |
|                      | 09.04.2025 | [commit link] | Allows cards to be clickable to perform a function, currently simply flips the card | Most of the game controlls are handled via clicking cards |

---

## Contributions Week 3 - [Begin Date] to [End Date]

| **Student**          | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| -------------------- | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@stevaniaeilyn**   | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@diderot5038**     | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@borislav-rakic**  | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@dominiqueheller** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 4 - [Begin Date] to [End Date]

| **Student**          | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| -------------------- | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@stevaniaeilyn**   | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@diderot5038**     | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@borislav-rakic**  | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@dominiqueheller** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 5 - [Begin Date] to [End Date]

| **Student**          | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| -------------------- | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@stevaniaeilyn**   | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@diderot5038**     | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@borislav-rakic**  | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@dominiqueheller** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 6 - [Begin Date] to [End Date]

| **Student**          | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| -------------------- | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@stevaniaeilyn**   | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@diderot5038**     | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@borislav-rakic**  | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@dominiqueheller** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                      | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
