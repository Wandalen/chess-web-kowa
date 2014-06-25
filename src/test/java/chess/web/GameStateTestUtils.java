package chess.web;

import chess.GameState;
import chess.Move;

/**
 * Methods to generate GameState instances for testing
 */
public class GameStateTestUtils {


    /**
     * Create a GameState that starts a new game and applies the given moves.  Note
     * that the moves applied here are validated.
     * @param moves The moves to apply
     * @return The created GameState
     */
    public static GameState makeStateWithMoves(String... moves) {
        GameState gameState = new GameState();
        gameState.reset();

        for (String move : moves) {
            gameState.makeMove(move);
        }
        return gameState;
    }

    /**
     * Create a game state bean starting with the given state and then appending the given moves.
     * Note that the moves are not validated
     * @param initialState The game state to start with
     * @param moves The moves to apply
     * @return A created GameStateBean with the given moves
     */
    public static GameStateBean makeStateBeanWithMoves(GameState initialState, String... moves) {
        GameState gameState = new GameState(initialState);
        for (String move : moves) {
            // Make the move without validation
            gameState.makeMove(new Move(move), false);
        }

        return new GameStateBean(gameState);
    }

}
