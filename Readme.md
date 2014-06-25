# Chess Web
An exercise in browser-based data management and presentation.

## Introduction
This exercise is meant to demonstrate front-end skills (HTML, CSS, JavaScript).  To that end, the goal is to build
a Chess game in a web page.  We provide you quite a bit of a head-start, including a fully functioning Chess engine
accessible via a REST-ful API.  All you have to do (ahem) is create a UI.

## Dependencies
This exercise depends on a modern version of Java installed (1.7+), as well as the Maven build tool.  Please install
those tools so that you can do something like the following:

```
$ java -version
java version "1.7.0_51"
Java(TM) SE Runtime Environment (build 1.7.0_51-b13)
Java HotSpot(TM) 64-Bit Server VM (build 24.51-b03, mixed mode)

$ mvn -version
Apache Maven 3.0.4 (r1232337; 2012-01-17 03:44:56-0500)
Maven home: /Users/foo/tools/maven-3.0.4
Java version: 1.7.0_51, vendor: Oracle Corporation
Java home: /Library/Java/JavaVirtualMachines/jdk1.7.0_51.jdk/Contents/Home/jre
Default locale: en_US, platform encoding: UTF-8
```

## Getting Started
Once you have Java and Maven installed, you should be able to get started quickly.  Clone this directory and run:

```
$ mvn clean compile exec:java
{{ ... lots of Maven output ...}}
Server started at: http://localhost:8080/
To stop the server, just hit <return>
```

At this point you should have an HTTP server running locally.  The existing Chess UI (it's just a static page) is available at /chess:
[http://localhost:8080/chess](http://localhost:8080/chess)

That path is mapped to `src/main/webapp` in the project tree.  You should be able to modify the 'index.html' file there and see it immediately reflected in a web page.

The API to talk to the Chess Engine is available here:
[http://localhost:8080/chess/api](http://localhost:8080/chess/api)

The detail of the API are described throughly below.

## The Game of Chess
We assume you have at least passing knowledge of the game of chess, but no strategy is necessary for this project.  If
you have little knowledge of the game, the Wikipedia article is an excellent reference:

http://en.wikipedia.org/wiki/Chess

Additionally, the chess engine embedded in this project can run a chess game via a CLI.  To run it, do the following:

```
$ java -cp src/local-libs/conductor/chess-core/0.9.1/chess-core-0.9.1.jar chess.CLI
Welcome to Chess!
Type 'help' for a list of commands.
    a   b   c   d   e   f   g   h
  +---+---+---+---+---+---+---+---+
8 | R | N | B | Q | K | B | N | R | 8
  +---+---+---+---+---+---+---+---+
7 | P | P | P | P | P | P | P | P | 7
  +---+---+---+---+---+---+---+---+
6 |   |   |   |   |   |   |   |   | 6
  +---+---+---+---+---+---+---+---+
5 |   |   |   |   |   |   |   |   | 5
  +---+---+---+---+---+---+---+---+
4 |   |   |   |   |   |   |   |   | 4
  +---+---+---+---+---+---+---+---+
3 |   |   |   |   |   |   |   |   | 3
  +---+---+---+---+---+---+---+---+
2 | p | p | p | p | p | p | p | p | 2
  +---+---+---+---+---+---+---+---+
1 | r | n | b | q | k | b | n | r | 1
  +---+---+---+---+---+---+---+---+
    a   b   c   d   e   f   g   h

White's Move
>
```

## The API
The API for interacting with the provided Chess engine is a REST-ful set of endpoints, described below.  Note that some
functionality (for instance, executing a move) is possible in more than one way.  Feel free to choose the API that
best suits your client-side design.


### Debugging The Game
To help you follow the current state of the game without having to decode JSON documents, the API provides
custom headers that show the state of the board in text form.  After executing any call to the endpoints described below, examine the response headers in your browser's network debugger.  You should see a collection of custom headers showing the current state of the game, like:

```
X-Chess-000:----a   b   c   d   e   f   g   h
X-Chess-001:--+---+---+---+---+---+---+---+---+
X-Chess-002:8 | R | N | B | Q | K | B | N | R | 8
X-Chess-003:--+---+---+---+---+---+---+---+---+
X-Chess-004:7 | P | P | P | P | P | P | P | P | 7
X-Chess-005:--+---+---+---+---+---+---+---+---+
X-Chess-006:6 |   |   |   |   |   |   |   |   | 6
X-Chess-007:--+---+---+---+---+---+---+---+---+
X-Chess-008:5 |   |   |   |   |   |   |   |   | 5
X-Chess-009:--+---+---+---+---+---+---+---+---+
X-Chess-010:4 |   |   |   | p |   |   |   |   | 4
X-Chess-011:--+---+---+---+---+---+---+---+---+
X-Chess-012:3 |   |   |   |   |   |   |   |   | 3
X-Chess-013:--+---+---+---+---+---+---+---+---+
X-Chess-014:2 | p | p | p |   | p | p | p | p | 2
X-Chess-015:--+---+---+---+---+---+---+---+---+
X-Chess-016:1 | r | n | b | q | k | b | n | r | 1
X-Chess-017:--+---+---+---+---+---+---+---+---+
X-Chess-018:----a   b   c   d   e   f   g   h
X-Chess-019:> Black's Move
```

If you squint your eyes, you can make out the 8 x 8 chess board there.  Each square on a chess board is described by its column-and-row pair.  So, the bottom-left square on the board is `a1`, while the middle four squares are `d4`, `d5`, `e4`, and `e5`.  The header output shown here shows the board in text form, with row- and column-labels around the outside of the board.  The White pieces are represented as lower case, while the Black pieces are upper case.

This isn't a useful UI, but may be helpful to you when getting started.

### Game State Endpoint
*Endpoint:  http://localhost:8080/api/chess*

This endpoint represents the state of the game.  It supports GET, POST, and PUT requests, as described below.

####GET http://localhost:8080/api/chess
Issuing an HTTP GET request to `/api/chess` will retrieve the current state of the game as a JSON object.  The format of the data looks like:
```json
{
  "currentPlayer" : "White",
  "inCheck" : false,
  "gameOver" : false,
  "positionToPieces" : {
    "f7" : {
      "owner" : "Black",
      "type" : "p"
    },
    "f8" : {
      "owner" : "Black",
      "type" : "b"
    },
    ... and so on
  }
}
```
Each square on a chess board is described by its column-and-row pair.  So, the bottom-left square on the board is `a1`,
while the middle four squares are `d4`, `d5`, `e4`, and `e5`, and the top right square is `h8`.

The `positionToPieces` element in the returned data contains one entry for each piece on the board, describing its
owner (`White` or `Black`), and its piece type.  The piece types are listed below:

* p - Pawn
* r - Rook
* n - Knight
* b - Bishop
* q - Queen
* k - King

Note that, contrary to the output in the custom headers described above, the piece type will always be lower case for each player.

####POST http://localhost:8080/api/chess
Issuing a POST to this endpoint will create a brand new game, resetting the pieces back to their original starting
positions.  Any content provided in the body of the request is ignored.  This is the only way to restart the game, apart from restarting the server.

####PUT http://localhost:8080/api/chess
Issuing a PUT request to this endpoint will alter the state of the game.  The body of the PUT request should match that
returned from the GET request.  However, only the `positionToPieces` element will be interpreted; everything else is
ignored.

For example, suppose the complete state of the game is the following:

```json
{
  "currentPlayer" : "White",
  "inCheck" : false,
  "gameOver" : false,
  "positionToPieces" : {
    "d5" : {
      "owner" : "Black",
      "type" : "k"
    },
    "d3" : {
      "owner" : "White",
      "type" : "k"
    },
    "d2" : {
        "owner" : "White",
        "type" : "q"
    }
  }
}
```

The Black player only has his king left, while the White player has his king and queen.  Since it is currently White's
turn, a valid request to the API would be to PUT the following content to the `/api/chess` endpoint:

```json
{
  "positionToPieces" : {
    "d5" : {
      "owner" : "Black",
      "type" : "k"
    },
    "d3" : {
      "owner" : "White",
      "type" : "k"
    },
    "a5" : {
        "owner" : "White",
        "type" : "q"
    }
  }
}
```
This request would move the White Queen out to `a5`, putting the Black King in Check.

### Moves Endpoint

*Endpoint:  http://localhost:8080/api/chess/moves*
This endpoint represents moves that may be made on the board, altering the game state.  It supports GET and POST requests, as described below.

####GET http://localhost:8080/api/chess/moves
Issuing an HTTP GET to this endpoint will return you the current list of valid moves, given the placement of the
pieces and whose turn it currently is.  For instance, when the game first starts this will return:

```json
[
    {
        "origin": "a2",
        "destination": "a3"
    },
    {
        "origin": "a2",
        "destination": "a4"
    },
    {
        "origin": "f2",
        "destination": "f4"
    },
    {
        "origin": "f2",
        "destination": "f3"
    },
    ... and so on ...
]
```
This is a JSON array represents the 20 opening moves that the White player could make.  As the game progresses, this
endpoint will always return the full set of legal moves.

####POST http://localhost:8080/api/chess/moves
To make a move, you may also issue a POST request to `/api/chess/moves`, instead of issuing a PUT to the game state
endpoint.  For instance, in the scenario described above, to move the White Queen from `a2` to `a5` you could issue
a POST to this endpoint with this body:
```json
    {
        "origin": "d2",
        "destination": "a5"
    }
```
That would move the White Queen at `d2` out to `d5`, putting the Black King in check.

## Your Goals
This exercise is intentionally open-ended.  However, the general goal should be to build a comprehensive browser-based
user interface for playing the game of chess.  You are free to use any browser-based technologies you would like;
JavaScript application frameworks are especially recommended.

Our suggested sequence of milestones is:

1. Be able to draw the chess board with pieces in place
2. Be able to react to a player moving a piece
3. Be able to indicate to the user when the current player is in Check
4. Be able to draw the chess board when the game is over

Note that we are not interested in how your application is served to the browser.  For instance, if you choose to use
a technology for loading JavaScript files as separate modules (i.e. RequireJS), don't worry about integrating the JS
optimizer or other technologies.  Stay focused on delivering a good user experience, modeling the data correctly, and
showing your skills at browser-based applications.  _Just assume deployment is someone else's job_.

Good Luck!
