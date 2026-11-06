import { Application, Router } from "express";
import authController from "../controllers/auth.controllers";

export default (app: Application): void => {
  const router = Router();

  // POST /api/auth/login
  router.post("/login", authController.login);

  app.use("/api/auth", router);
};
