package chess.web;

import org.glassfish.grizzly.http.server.*;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

import java.io.IOException;
import java.net.URI;

/**
 * Class to launch a Grizzly web server to host ourselves
 */
public class Server {

    // Base URI the Grizzly HTTP server will listen on
    public static final String BASE_URI = "http://localhost:8080/";

    /**
     * Starts Grizzly HTTP server exposing JAX-RS resources defined in this application.
     * @return Grizzly HTTP server.
     */
    public static HttpServer startServer() {
        // create a resource config that scans for JAX-RS resources and providers
        // in chess.web package
        final ResourceConfig rc = new ResourceConfig().packages("chess.web");
        rc.register(JacksonFeature.class);

        HttpServer httpServer = GrizzlyHttpServerFactory.createHttpServer(URI.create(BASE_URI), rc);
        ServerConfiguration config = httpServer.getServerConfiguration();
        config.addHttpHandler(new ChessStaticHttpHandler(), "/chess");
        //config.addHttpHandler(new ChessStaticHttpHandler(), "/");

        return httpServer;
    }

    public static void main(String[] args) throws IOException {
        System.out.println("Starting Embedded Web Server ...");

        HttpServer httpServer = startServer();
        System.out.println(" ===================================================================== ");
        System.out.println("Server started.  See the UI at: " + BASE_URI + "chess");
        System.out.println("To stop the server, just hit <return>");
        System.out.println(" ===================================================================== ");

        //noinspection ResultOfMethodCallIgnored
        System.in.read();

        System.out.println("Stopping Server");
        httpServer.shutdownNow();
        System.out.println("Exiting!");
    }

    /**
     * This extension of StaticHttpHandler correctly looks for 'index.html' when mapped to
     * the root, and also explicitly disables the file cache.
     */
    static class ChessStaticHttpHandler extends StaticHttpHandler {

        ChessStaticHttpHandler() {
            super("src/main/webapp");
            setFileCacheEnabled(false);
        }
    }

}
