import { Request, Response } from "express";
import db from "../models";
import { byEmail, toPublicUser } from "../models/users.model";
import { verifyPassword } from "../utils/password";
import { issueToken } from "../utils/token";
import { errorMessage, isText } from "../utils/request";

const Users = db.users;

/**
 * Checks credentials. Responds 200 with the user and a session token, 401 if they do not match.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (!isText(email) || !isText(password)) {
    res.status(400).json({ message: "email and password are required." });
    return;
  }

  try {
    const user = await Users.findOne({ where: byEmail(email) });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    res.status(200).json({ user: toPublicUser(user), token: issueToken(user.id) });
  } catch (err: unknown) {
    res.status(500).json({ message: "Failed to log in: " + errorMessage(err) });
  }
};

export default { login };
