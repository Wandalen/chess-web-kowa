package chess.web;

import chess.Move;

/**
 * Bean to encapsulate a Move object
 */
public class MoveBean {

    private String origin;
    private String destination;

    /**
     * Bean-ness constructor
     */
    @SuppressWarnings("UnusedDeclaration")
    public MoveBean() {
    }

    /**
     * Create a move bean from a given move
     * @param move The move to translate into a bean
     */
    public MoveBean(Move move) {
        origin = move.getOrigin().toString();
        destination = move.getDestination().toString();
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    @Override
    public String toString() {
        return origin + " " + destination;
    }
}
