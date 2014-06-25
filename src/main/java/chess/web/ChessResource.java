package chess.web;

import chess.*;
import chess.pieces.Piece;
import org.glassfish.grizzly.http.server.Request;
import org.glassfish.grizzly.http.server.Response;
import org.glassfish.grizzly.http.server.Session;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.util.*;

/**
 * REST Resource that exposes the Chess Game via
 */
@Path("api/chess")
public class ChessResource {
    static final String CHESS_GAME = "chess.web.game-state";
    private GameStateChanger gameChanger;

    @SuppressWarnings("UnusedDeclaration")
    public ChessResource() {
        this(new GameStateChanger());

    }
    public ChessResource(GameStateChanger gameChanger) {
        this.gameChanger = gameChanger;
    }

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public GameStateBean getGame(@Context Request request, @Context Response response) {
        return getGameStateBean(request, response);
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces({ MediaType.APPLICATION_JSON })
    public GameStateBean putGame(@Context Request request, @Context Response response,
            GameStateBean proposedGameState) {

        GameState currentState = getGameState(request);
        if (gameChanger.isValid(currentState, proposedGameState)) {
            GameState newState = gameChanger.applyNewState(currentState, proposedGameState);
            storeGameState(request, newState);

            return getGameStateBean(request, response);
        } else {
            throw new BadRequestException("Invalid Move");
        }
    }

    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    public GameStateBean postGame(@Context Request request, @Context Response response) {
        GameState gameState = new GameState();
        gameState.reset();
        storeGameState(request, gameState);
        return getGameStateBean(request, response);
    }

    @Path("moves")
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public List<MoveBean> getMovesList(@Context Request request, @Context Response response) {
        GameState gameState = getGameState(request);
        addCustomHeaders(gameState, response);
        return getCurrentMoves(gameState);
    }

    @Path("moves")
    @POST
    @Produces(MediaType.APPLICATION_JSON )
    @Consumes(MediaType.APPLICATION_JSON)
    public GameStateBean postMove(@Context Request request, @Context Response response, MoveBean move) {
        GameState currentState = getGameState(request);

        try {
            currentState.makeMove(move.toString());
            return getGameStateBean(request, response);
        } catch (InvalidMoveException imex) {
            throw new BadRequestException(("Bad Move: " + imex.getMessage()));
        }
    }

    private GameStateBean getGameStateBean(Request request, Response response) {
        GameState gameState = getGameState(request);

        addCustomHeaders(gameState, response);

        return new GameStateBean(gameState);
    }

    /**
     * Convenience for debugging, we add the chess board string representation as
     * custom headers to the response, along with the current
     * @param gameState The current game state
     * @param response The response we are writing
     */
    private void addCustomHeaders(GameState gameState, Response response) {
        GameStateStringifier stringifier = new GameStateStringifier(gameState);

        String board = stringifier.getBoardAsString();
        StringTokenizer tokenizer = new StringTokenizer(board, GameStateStringifier.NEWLINE);

        int lineCount = 0;
        while (tokenizer.hasMoreElements()) {
            String headerName = getHeaderName(lineCount);

            // Most Header displays trim the header values.  Compensate for that by
            // padding the line value
            String lineValue = tokenizer.nextToken();
            String spacerValue = "";
            StringTokenizer lineTokenizer = new StringTokenizer(lineValue, " ", true);
            while (lineTokenizer.hasMoreElements() && (lineTokenizer.nextToken().equals(" "))) {
                spacerValue = "-" + spacerValue;
            }
            lineValue = spacerValue + lineValue.trim();

            response.addHeader(headerName, lineValue);
            lineCount++;
        }

        Player currentPlayer = gameState.getCurrentPlayer();
        if (gameState.isGameOver()) {
            response.addHeader(getHeaderName(lineCount), "The Game Is Over.  Congrats to " + currentPlayer.other());
        } else {
            if (gameState.isInCheck()) {
                response.addHeader(getHeaderName(lineCount), currentPlayer + " is in CHECK");
                lineCount++;
            }
            response.addHeader(getHeaderName(lineCount), "> " + currentPlayer + "'s Move");
        }
    }

    private String getHeaderName(int lineCount) {
        String headerOrdering = String.valueOf(lineCount);
        if (lineCount < 10) {
            headerOrdering = "00" + headerOrdering;
        } else if (lineCount < 100) {
            headerOrdering = "0" + headerOrdering;
        }
        return "X-Chess-" + headerOrdering;
    }

    private void storeGameState(Request request, GameState gameState) {
        Session session = request.getSession();
        session.setAttribute(CHESS_GAME, gameState);
    }

    private GameState getGameState(Request request) {
        Session session = request.getSession();
        GameState gameState = (GameState) session.getAttribute(CHESS_GAME);
        if (gameState == null) {
            gameState = createNewGame(session);
        }
        return gameState;
    }

    private GameState createNewGame(Session session) {
        GameState gameState = new GameState();
        gameState.reset();
        session.setAttribute(CHESS_GAME, gameState);
        return gameState;
    }

    private List<MoveBean> getCurrentMoves(GameState gameState) {
        Map<Piece, Set<Move>> possibleMoves = gameState.findPossibleMoves();
        List<MoveBean> moveBeans = new ArrayList<>();
        for (Piece piece : possibleMoves.keySet()) {
            Set<Move> moves = possibleMoves.get(piece);
            for (Move move : moves) {
                moveBeans.add(new MoveBean(move));
            }
        }

        return moveBeans;
    }
}
