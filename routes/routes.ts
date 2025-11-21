import express from "express";
import type { Request, Response, NextFunction } from "express";
import * as controller from "../controllers/actionController";

export const router = express.Router();

router.post("/actions", controller.createAction);
router.get("/actions", controller.listActions);
router.post("/actions/:id/execute", controller.executeAction);
router.patch("/actions/:id", controller.patchAction);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});
