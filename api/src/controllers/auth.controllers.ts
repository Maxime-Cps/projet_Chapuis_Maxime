import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import db from "../models";
import { UserInstance } from "../models/users.model";
import { hashPassword, verifyPassword } from "../utils/password";

const Users = db.users;

/** Public view of a user: everything but the password hash. */
function toPublic({ id, firstName, lastName, email }: UserInstance) {
  return { id, firstName, lastName, email };
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Creates an account. Responds 201 with the user, 409 if the email is taken.
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password } = req.body ?? {};
  if (![firstName, lastName, email, password].every(isText)) {
    res.status(400).json({ message: "firstName, lastName, email and password are required." });
    return;
  }

  try {
    const existing = await Users.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await Users.create({ firstName, lastName, email, passwordHash });
    res.status(201).json(toPublic(user));
  } catch (err: unknown) {
    // Concurrent signup with the same email
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    res.status(500).json({ message: "Failed to sign up: " + errorMessage(err) });
  }
};

/**
 * Checks credentials. Responds 200 with the user, 401 if they do not match.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (!isText(email) || !isText(password)) {
    res.status(400).json({ message: "email and password are required." });
    return;
  }

  try {
    const user = await Users.findOne({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    res.status(200).json(toPublic(user));
  } catch (err: unknown) {
    res.status(500).json({ message: "Failed to log in: " + errorMessage(err) });
  }
};

export default { signUp, login };
