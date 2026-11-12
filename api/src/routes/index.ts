import { Application } from "express";
import pollutionRoutes from "./pollution.routes";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";

export default (app: Application): void => {
  pollutionRoutes(app);
  authRoutes(app);
  usersRoutes(app);
};
