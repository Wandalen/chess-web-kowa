package chess.web;

import chess.Player;
import chess.pieces.*;

/**
 * A bean representing a Piece
 */
public class PieceBean {
    private String owner;
    private String type;

    public PieceBean() {
    }

    public PieceBean(Piece piece) {
        owner = piece.getPlayer().name();
        type = String.valueOf(piece.getIdentifierCharacter());
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PieceBean pieceBean = (PieceBean) o;

        if (owner != null ? !owner.equals(pieceBean.owner) : pieceBean.owner != null) return false;
        if (type != null ? !type.equals(pieceBean.type) : pieceBean.type != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = owner != null ? owner.hashCode() : 0;
        result = 31 * result + (type != null ? type.hashCode() : 0);
        return result;
    }

    public static Piece toPiece(PieceBean bean) {
        Player player = Player.valueOf(bean.getOwner());

        String type = bean.getType();
        Piece piece;
        // U-G-L-Y  You ain't got ... you know ....
        if (type.equals("p")) {
            piece = new Pawn(player);
        } else if (type.equals("r")) {
            piece = new Rook(player);
        } else if (type.equals("n")) {
            piece = new Knight(player);
        } else if (type.equals("b")) {
            piece = new Bishop(player);
        } else if (type.equals("q")) {
            piece = new Queen(player);
        } else if (type.equals("k")) {
            piece = new King(player);
        } else {
            throw new IllegalArgumentException("No such piece type: " + type);
        }

        return piece;
    }
}
