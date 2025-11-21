import request from "supertest";
import express from "express";
import { router } from "../routes/routes"; 
import { PrismaClient } from "@prisma/client";

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    action: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient() as any;

const app = express();
app.use(express.json());
app.use("/", router);

describe("Actions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe("POST /actions", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/actions").send({ name: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields: name, url, method");
    });

    it("should create an action", async () => {
      const mockAction = { id: 1, name: "Test", url: "/test", method: "GET" };

      prisma.action.create.mockResolvedValue(mockAction);

      const res = await request(app)
        .post("/actions")
        .send({ name: "Test", url: "/test", method: "GET" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockAction);
    });
  });


  describe("GET /actions", () => {
    it("should return all actions", async () => {
      const mockActions = [
        { id: 1, name: "A", url: "/a", method: "GET" },
        { id: 2, name: "B", url: "/b", method: "POST" },
      ];

      prisma.action.findMany.mockResolvedValue(mockActions);

      const res = await request(app).get("/actions");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockActions);
    });
  });


  describe("POST /actions/:id/execute", () => {
    it("should return 400 for invalid id", async () => {
      const res = await request(app).post("/actions/abc/execute");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid action id");
    });

    it("should update status to SUCCESS", async () => {
      const mockUpdated = {
        id: 1,
        name: "A",
        url: "/a",
        method: "GET",
        status: "SUCCESS",
      };

      prisma.action.update.mockResolvedValue(mockUpdated);

      const res = await request(app).post("/actions/1/execute");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Action executed",
        action: mockUpdated,
      });
    });

    it("should return 404 if not found", async () => {
      const err: any = new Error("Not found");
      err.code = "P2025";

      prisma.action.update.mockRejectedValue(err);

      const res = await request(app).post("/actions/99/execute");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Action not found");
    });
  });

  describe("PATCH /actions/:id", () => {
    it("should return 400 for invalid id", async () => {
      const res = await request(app).patch("/actions/xyz").send({ name: "A" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid action id");
    });

    it("should return 400 if no valid fields", async () => {
      const res = await request(app)
        .patch("/actions/1")
        .send({ invalid: true });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No valid fields to update");
    });

    it("should update action", async () => {
      const mockUpdated = {
        id: 1,
        name: "Updated",
        url: "/test",
        method: "POST",
        status: "SUCCESS",
      };

      prisma.action.update.mockResolvedValue(mockUpdated);

      const res = await request(app)
        .patch("/actions/1")
        .send({ name: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Action updated",
        action: mockUpdated,
      });
    });

    it("should return 404 if action not found", async () => {
      const err: any = new Error("Not found");
      err.code = "P2025";

      prisma.action.update.mockRejectedValue(err);

      const res = await request(app).patch("/actions/99").send({ name: "X" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Action not found");
    });
  });

  describe("Error handler", () => {
    it("should return 500 for unknown errors", async () => {
      prisma.action.findMany.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/actions");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Internal Server Error");
    });
  });
});
