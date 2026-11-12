import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import db from "../models";
import { byEmail, toPublicUser } from "../models/users.model";
import { hashPassword } from "../utils/password";
import { errorMessage } from "../utils/request";
import { issueSession } from "../utils/token";
import { PASSWORD_MIN_LENGTH, readNewUser } from "../validators/users.validator";

const Users = db.users;

/**
 * Creates a user and signs them in. Responds 201 with the session, 409 if the email is taken.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const fields = readNewUser(req.body);
  if (!fields) {
    res.status(400).json({
      message: `firstName, lastName, a valid email and a password of ${PASSWORD_MIN_LENGTH}+ characters are required.`
    });
    return;
  }

  const { firstName, lastName, email, password } = fields;
  try {
    const existing = await Users.findOne({ where: byEmail(email) });
    if (existing) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await Users.create({ firstName, lastName, email, passwordHash });
    res.status(201).json(issueSession(user));
  } catch (err: unknown) {
    // Concurrent creation with the same email
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    res.status(500).json({ message: "Failed to create user: " + errorMessage(err) });
  }
};

/**
 * Lists every user, without password hashes. Responds 200.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await Users.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(users.map(toPublicUser));
  } catch (err: unknown) {
    res.status(500).json({ message: "Failed to list users: " + errorMessage(err) });
  }
};

export default { create, getAll };
