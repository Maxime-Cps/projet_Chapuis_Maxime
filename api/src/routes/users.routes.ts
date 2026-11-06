import { Application, Router } from "express";
import usersController from "../controllers/users.controllers";
import { requireAuth } from "../middlewares/auth";

export default (app: Application): void => {
  const router = Router();

  // POST /api/users (public sign-up), GET /api/users (signed-in only)
  router.post("/", usersController.create);
  router.get("/", requireAuth, usersController.getAll);

  app.use("/api/users", router);
};
