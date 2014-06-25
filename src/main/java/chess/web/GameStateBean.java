package chess.web;

import chess.GameState;
import chess.Position;
import chess.pieces.Piece;

import java.util.HashMap;
import java.util.Map;

/**
 * A bean that represents the GameState in the API
 */
public class GameStateBean {

    private String currentPlayer;
    private boolean inCheck;
    private boolean gameOver;
    private Map<String, PieceBean> positionToPieces;

    /**
     * For bean-ness
     */
    @SuppressWarnings("UnusedDeclaration")
    public GameStateBean() {
    }

    public GameStateBean(GameState state) {
        currentPlayer = state.getCurrentPlayer().name();
        inCheck = state.isInCheck();
        gameOver = state.isGameOver();

        Map<Position, Piece> positions = state.getPiecePositions();

        positionToPieces = new HashMap<String, PieceBean>();
        for (Position position : positions.keySet()) {
            Piece piece = positions.get(position);
            positionToPieces.put(position.toString(), new PieceBean(piece));
        }
    }

    /**
     * Static method to translate from a bean back to a GameState
     * @param bean The bean to translate
     * @return A fully-built GameState object
     */
    public static GameState toGameState(GameStateBean bean) {
        GameState state = new GameState();

        // Set the current player
        String player = bean.getCurrentPlayer();
        if (!state.getCurrentPlayer().name().equals(player)) {
            state.toggleCurrentPlayer();
        }

        // Put the pieces into the game state
        Map<String, PieceBean> map = bean.getPositionToPieces();
        for (String key : map.keySet()) {
            Position position = new Position(key);
            PieceBean pieceBean = map.get(key);
            Piece piece = PieceBean.toPiece(pieceBean);

            state.placePiece(piece, position);
        }

        return state;
    }


    public String getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(String currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void setGameOver(boolean isGameOver) {
        this.gameOver = isGameOver;
    }

    public boolean isInCheck() {
        return inCheck;
    }

    public void setInCheck(boolean inCheck) {
        this.inCheck = inCheck;
    }

    public Map<String, PieceBean> getPositionToPieces() {
        return positionToPieces;
    }

    public void setPositionToPieces(Map<String, PieceBean> positionToPieces) {
        this.positionToPieces = positionToPieces;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GameStateBean that = (GameStateBean) o;

        if (gameOver != that.gameOver) return false;
        if (inCheck != that.inCheck) return false;
        if (currentPlayer != null ? !currentPlayer.equals(that.currentPlayer) : that.currentPlayer != null)
            return false;
        //noinspection RedundantIfStatement
        if (positionToPieces != null ? !positionToPieces.equals(that.positionToPieces) : that.positionToPieces != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = currentPlayer != null ? currentPlayer.hashCode() : 0;
        result = 31 * result + (inCheck ? 1 : 0);
        result = 31 * result + (gameOver ? 1 : 0);
        result = 31 * result + (positionToPieces != null ? positionToPieces.hashCode() : 0);
        return result;
    }
}
