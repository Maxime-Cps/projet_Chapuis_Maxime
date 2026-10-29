import { Request, Response } from "express";
import db from "../models";
import { PollutionCreationAttributes } from "../models/pollutions.model";

const Pollutions = db.pollutions;

/**
 * Récupère la liste de toutes les mesures de pollution depuis la base PostgreSQL.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [["id", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de la récupération des données de pollution: " + message
    });
  }
};

/**
 * Récupère une mesure de pollution par son identifiant.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        message: `Aucune pollution trouvée avec l'id=${id}.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la récupération de la pollution id=${id}: ` + message
    });
  }
};

const REQUIRED_TEXT_FIELDS = ["label", "description", "date", "place", "latitude", "longitude"] as const;

/** Extracts the writable pollution fields from a request body, or null when invalid. */
function readPollution(body: unknown): PollutionCreationAttributes | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const fields = body as Record<string, unknown>;
  if (REQUIRED_TEXT_FIELDS.some((key) => typeof fields[key] !== "string")) {
    return null;
  }

  const type = fields.type as Record<string, unknown> | undefined;
  if (typeof type?.id !== "number" || typeof type?.name !== "string") {
    return null;
  }

  return {
    label: fields.label as string,
    type: { id: type.id, name: type.name },
    description: fields.description as string,
    date: fields.date as string,
    place: fields.place as string,
    latitude: fields.latitude as string,
    longitude: fields.longitude as string,
    image: typeof fields.image === "string" ? fields.image : ""
  };
}

/** Route id as a positive integer, or null when it is not one (e.g. "abc"). */
function readId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Creates a pollution report. Responds 201 with the saved report.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const fields = readPollution(req.body);
  if (!fields) {
    res.status(400).json({ message: "Invalid pollution report." });
    return;
  }

  try {
    const data = await Pollutions.create(fields);
    res.status(201).json(data);
  } catch (err: unknown) {
    res.status(500).json({ message: "Failed to create pollution: " + errorMessage(err) });
  }
};

/**
 * Replaces a pollution report. Responds 200 with the saved report, 404 if unknown.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = readId(req);
  if (id === null) {
    res.status(404).json({ message: `No pollution with id=${req.params.id}.` });
    return;
  }

  const fields = readPollution(req.body);
  if (!fields) {
    res.status(400).json({ message: "Invalid pollution report." });
    return;
  }

  try {
    const data = await Pollutions.findByPk(id);
    if (!data) {
      res.status(404).json({ message: `No pollution with id=${id}.` });
      return;
    }

    await data.update(fields);
    res.status(200).json(data);
  } catch (err: unknown) {
    res.status(500).json({ message: `Failed to update pollution id=${id}: ` + errorMessage(err) });
  }
};

/**
 * Deletes a pollution report. Responds 204, or 404 if unknown.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = readId(req);
  if (id === null) {
    res.status(404).json({ message: `No pollution with id=${req.params.id}.` });
    return;
  }

  try {
    const deleted = await Pollutions.destroy({ where: { id } });
    if (deleted === 0) {
      res.status(404).json({ message: `No pollution with id=${id}.` });
      return;
    }

    res.status(204).end();
  } catch (err: unknown) {
    res.status(500).json({ message: `Failed to delete pollution id=${id}: ` + errorMessage(err) });
  }
};

export default { getAll, getById, create, update, remove };
