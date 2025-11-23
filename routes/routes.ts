import express from "express";
import type { Request, Response, NextFunction } from "express";
import {createAction, listActions, executeAction, patchAction} from "../controllers/actionController";

export const router = express.Router();

router.post("/actions", createAction);
router.get("/actions", listActions);
router.get("/actions/:id/execute", executeAction);
router.patch("/actions/:id", patchAction);

// router.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack || err);
//   res.status(500).json({ error: "Internal Server Error" });
// });
