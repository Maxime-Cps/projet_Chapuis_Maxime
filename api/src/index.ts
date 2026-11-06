import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import db from "./models";
import initRoutes from "./routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "Authorization"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate([
          { label: "Bouteilles sur la berge", type: { id: 0, name: "Plastique" }, description: "Une vingtaine de bouteilles plastiques accumulées sous le pont.", date: "2026-09-12T09:30", place: "Quai de la Seine, Paris", latitude: "48.8530", longitude: "2.3499", image: "" },
          { label: "Fumée noire", type: { id: 4, name: "Air" }, description: "Fumée épaisse s'échappant d'un entrepôt.", date: "2026-10-02T18:15", place: "Zone industrielle, Compiègne", latitude: "49.4179", longitude: "2.8261", image: "" },
          { label: "Gravats en forêt", type: { id: 2, name: "Dépôt sauvage" }, description: "Sacs de gravats et pots de peinture abandonnés au bord du chemin.", date: "2026-10-14T14:00", place: "Forêt de Chantilly", latitude: "49.1866", longitude: "2.4614", image: "" }
        ]);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });


initRoutes(app);

// set port, listen on 0.0.0.0 for Render and container environments
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
