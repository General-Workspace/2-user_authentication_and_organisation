import http from "node:http";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

class Server {
  private server: http.Server;
  private port: string | number;

  constructor() {
    this.port = process.env["PORT"] || 3001;
    app.set("port", this.port);
    this.server = http.createServer(app);
    this.startServer();
    this.handleShutdown();
  }

  private startServer(): void {
    try {
      this.server.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });

      this.server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.syscall !== "listen") {
          throw error;
        }

        const bind =
          typeof this.port === "string"
            ? "Pipe " + this.port
            : "Port " + this.port;

        switch (error.code) {
          case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
          case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
          default:
            throw error;
        }
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  private handleShutdown(): void {
    process.on("SIGINT", () => {
      this.server.close(() => {
        console.log("Server is shutting down");
        process.exit(0);
      });
    });
  }
}

new Server();
