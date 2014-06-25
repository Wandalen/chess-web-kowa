package chess.web;

import chess.GameState;
import chess.GameStateStringifier;
import chess.Player;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import static chess.web.GameStateTestUtils.makeStateBeanWithMoves;
import static chess.web.GameStateTestUtils.makeStateWithMoves;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Tests to exercise the GameStateChanger
 */
@RunWith(MockitoJUnitRunner.class)
public class GameStateChangerTest {

    private GameStateChanger changer;

    @Before
    public void setUp() {
        changer = new GameStateChanger();
    }

    @Test
    public void testValidateGoodMove() {
        GameState current = makeGameState(new String[]{
                "        ",
                "P       ",
                "        ",
                "        ",
                "        ",
                "        ",
                "p       ",
                "        "
        }, Player.Black);

        // This should be perfectly fine
        GameStateBean proposed = makeStateBeanWithMoves(current, "a7 a5");
        assertTrue("Valid move should be accepted", changer.isValid(current, proposed));
    }

    @Test
    public void testValidateBadMove() {
        GameState current = makeStateWithMoves("d2 d4", "a7 a5", "b1 c3");

        // This should be an invalid move
        GameStateBean proposed = makeStateBeanWithMoves(current, "a5 a3");

        assertTrue("Invalid move should not be accepted", !changer.isValid(current, proposed));
    }

    @Test
    public void testValidateTakingPiece() {
        GameState current = makeGameState(new String[]{
                "        ",
                "        ",
                "        ",
                "   P    ",
                "    p   ",
                "        ",
                "        ",
                "        "
        }, Player.Black);

        GameStateBean proposed = makeStateBeanWithMoves(current, "d5 e4");
        assertTrue("Taking a piece should be a valid move", changer.isValid(current, proposed));
    }

    @Test
    public void testApplyState() {
        GameState current = makeGameState(new String[]{
                "        ",
                "        ",
                "        ",
                "   P    ",
                "    p   ",
                "        ",
                "        ",
                "        "
        }, Player.Black);

        GameStateBean proposed = makeStateBeanWithMoves(current, "d5 e4");
        GameState newState = changer.applyNewState(current, proposed);

        assertEquals("Black should have one piece on the board", 1, newState.getPiecesOnBoard(Player.Black).size());
        assertEquals("White should have zero pieces on the board", 0, newState.getPiecesOnBoard(Player.White).size());
    }


    private GameState makeGameState(String[] rows, Player nextToMove) {
        GameStateStringifier gameStateStringifier = new GameStateStringifier(rows, nextToMove);
        return gameStateStringifier.getGameState();
    }
}
