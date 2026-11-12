import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";
import { requireAuth } from "../middlewares/auth";

export default (app: Application): void => {
  const router = Router();

  // Every pollution route is for signed-in users only
  router.use(requireAuth);

  // Route GET /api/pollutions
  router.get("/", pollutionController.getAll);

  // Route GET /api/pollutions/:id
  router.get("/:id", pollutionController.getById);

  router.post("/", pollutionController.create);
  router.put("/:id", pollutionController.update);
  router.delete("/:id", pollutionController.remove);

  // Exposition sous /api/pollutions et /api/pollution (singulier et pluriel)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};

