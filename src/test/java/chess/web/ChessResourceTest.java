package chess.web;

import chess.GameState;
import org.glassfish.grizzly.http.server.Request;
import org.glassfish.grizzly.http.server.Response;
import org.glassfish.grizzly.http.server.Session;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static chess.web.GameStateTestUtils.makeStateWithMoves;
import static org.junit.Assert.*;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the ApiController
 */
@RunWith(MockitoJUnitRunner.class)
public class ChessResourceTest {

    private ChessResource chess;

    @Mock
    private Request request;

    @Mock
    private Response response;

    @Mock
    private Session session;

    @Mock
    private GameStateChanger gameChanger;

    @Before
    public void setUp() {
        chess = new ChessResource(gameChanger);

        when(request.getSession()).thenReturn(session);
    }

    @Test
    public void testInitialGetCreatesNewGame() {
        // No game state in the session
        when(session.getAttribute(eq(ChessResource.CHESS_GAME))).thenReturn(null);

        GameStateBean game = chess.getGame(request, response);
        assertNotNull("getGame(...) should never return null", game);
    }

    @Test
    public void testGetFetchesFromSession() {
        GameStateBean storedGame = new GameStateBean(mockWhiteFirstMove());

        GameStateBean returnedGame = chess.getGame(request, response);
        assertEquals("Wrong return from getGame()", storedGame, returnedGame);
    }

    @Test
    public void testPutMakesTransition() {
        GameState storedGame = mockWhiteFirstMove();
        GameState blackFirstMove = makeStateWithMoves("d2 d4", "d7 d5");
        GameStateBean proposedMove = new GameStateBean(blackFirstMove);
        when(gameChanger.isValid(eq(storedGame), eq(proposedMove))).thenReturn(true);
        when(gameChanger.applyNewState(eq(storedGame), eq(proposedMove))).thenReturn(storedGame);

        GameStateBean result = chess.putGame(request, response, proposedMove);
        verify(gameChanger, times(1)).isValid(eq(storedGame), eq(proposedMove));
        verify(gameChanger, times(1)).applyNewState(eq(storedGame), eq(proposedMove));

        assertNotNull("Result cannot be null", result);
    }

    @Test(expected = BadRequestException.class)
    public void testInvalidMovePut() {
        GameState storedGame = mockWhiteFirstMove();
        GameState blackFirstMove = makeStateWithMoves("d2 d4");
        GameStateBean proposedMove = new GameStateBean(blackFirstMove);
        when(gameChanger.isValid(eq(storedGame), eq(proposedMove))).thenReturn(false);
        chess.putGame(request, response, proposedMove);
    }

    @Test
    public void testPostGame() {
        GameState storedGame = mockWhiteFirstMove();
        chess.postGame(request, response);

        ArgumentCaptor<GameState> captor = ArgumentCaptor.forClass(GameState.class);
        verify(session).setAttribute(eq(ChessResource.CHESS_GAME), captor.capture());

        assertTrue("Stored value should not be the same", !captor.getValue().equals(storedGame));
    }

    private GameState mockWhiteFirstMove() {
        GameState gameState = makeStateWithMoves("d2 d4");
        when(session.getAttribute(eq(ChessResource.CHESS_GAME))).thenReturn(gameState);
        return gameState;
    }



}
