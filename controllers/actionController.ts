import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as actionService from "../services/actionService";

const createActionSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  method: z.string().min(1),
});

const patchActionSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
  method: z.string().optional(),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
});

function parseId(id: string | undefined) {
  if (!id) return null;
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

export async function createAction(req: Request, res: Response, next: NextFunction) {
  const parse = createActionSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Missing required fields: name, url, method", details: parse.error.format() });
  }
  try {
    const action = await actionService.createAction(parse.data);
    res.status(201).json(action);
  } catch (err) {
    next(err);
  }
}

export async function listActions(_: Request, res: Response, next: NextFunction) {
  try {
    const actions = await actionService.listActions();
    res.json(actions);
  } catch (err) {
    next(err);
  }
}

export async function executeAction(req: Request, res: Response, next: NextFunction) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid action id" });
  }
  try {
    const updated = await actionService.updateAction(id, { status: "SUCCESS" });
    res.json({ message: "Action executed", action: updated });
  } catch (err: any) {
    if (err && err.code === "P2025") {
      return res.status(404).json({ error: "Action not found" });
    }
    next(err);
  }
}

export async function patchAction(req: Request, res: Response, next: NextFunction) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid action id" });
  }
  const parse = patchActionSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "No valid fields to update", details: parse.error.format() });
  }
  const updates = parse.data;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }
  try {
    const updated = await actionService.updateAction(id, updates as Record<string, any>);
    res.json({ message: "Action updated", action: updated });
  } catch (err: any) {
    if (err && err.code === "P2025") {
      return res.status(404).json({ error: "Action not found" });
    }
    next(err);
  }
}
