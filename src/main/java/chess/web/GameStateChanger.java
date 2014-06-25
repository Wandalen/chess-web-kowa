package chess.web;

import chess.GameState;
import chess.Move;
import chess.Position;
import chess.pieces.Piece;

import java.util.Map;
import java.util.Set;

/**
 * This provides the functionality of changing a game state.
 */
public class GameStateChanger {

    public GameStateChanger() {
    }

    /**
     * Determine if moving from one game state to another is valid.
     * @param current The current game state
     * @param proposedBean The next game state
     * @return True if this is a valid transition.  False otherwise.
     */
    public boolean isValid(GameState current, GameStateBean proposedBean) {

        Move move = getDelta(current, proposedBean);
        if (move == null) {
            // There was not a single move as a delta between current & proposed
            return false;
        } else {
            Piece movingPiece = current.getPieceAt(move.getOrigin());
            Set<Move> validMoves = current.findValidMovesFor(movingPiece);
            return validMoves.contains(move);
        }
    }

    /**
     * Get the single move that represents the change from one state to the next.
     * If the transition represents more than one moved piece, this will return null.
     * Note this does zero validation.
     * @param current The current state
     * @param proposedBean The proposed new state
     * @return The single move to go from 'current' to 'proposed', or null if there
     * are more than one move needed.
     */
    private Move getDelta(GameState current, GameStateBean proposedBean) {
        GameState proposed = GameStateBean.toGameState(proposedBean);

        Map<Position, Piece> currentPositions = current.getPiecePositions();
        Map<Position, Piece> newPositions = proposed.getPiecePositions();

        // First, find the position in the new state that is empty
        // where the old state is occupied.
        Position startPosition = null;
        for (Position position : currentPositions.keySet()) {
            Piece currentPiece = currentPositions.get(position);
            Piece proposedPiece = newPositions.get(position);

            if (proposedPiece == null && currentPiece != null) {
                if (startPosition != null) {
                    // Found more than one position where pieces have moved from.
                    // Illegal delta.
                    return null;
                } else {
                    startPosition = position;
                }
            }
        }

        // Then find the position in the new state that is different
        // from the old state
        Position endPosition = null;
        for (Position position : newPositions.keySet()) {
            Piece proposedPiece = newPositions.get(position);
            Piece currentPiece = currentPositions.get(position);

            if (isChanged(currentPiece, proposedPiece)) {
                if (endPosition != null) {
                    // More than one move!
                    return null;
                } else {
                    endPosition = position;
                }
            }
        }

        return new Move(startPosition, endPosition);
    }

    private boolean isChanged(Piece currentPiece, Piece proposedPiece) {
        //noinspection SimplifiableIfStatement
        if (proposedPiece == null ) {
            // No piece was moved here.
            return false;
        } else {
            return currentPiece == null ||
                    currentPiece.getIdentifier() !=
                            proposedPiece.getIdentifier();
        }
    }


    public GameState applyNewState(GameState currentState, GameStateBean newState) {
        Move delta = getDelta(currentState, newState);
        currentState.makeMove(delta, true);

        return currentState;
    }
}
