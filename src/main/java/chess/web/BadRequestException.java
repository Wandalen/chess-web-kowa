package chess.web;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * An exception that symbolizes an HTTP 400 BAD_REQUEST
 */
public class BadRequestException extends WebApplicationException {

    public BadRequestException(String message) {
        super(Response.status(Response.Status.BAD_REQUEST)
                .entity(message).type(MediaType.APPLICATION_JSON).build());
    }
}
