import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Interview from "../models/interview.model.js";

describe("API Endpoint Validations & Security", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("Authentication Middleware (isAuth)", () => {
    it("should return 401 if access token is missing", async () => {
      const response = await request(app)
        .post("/api/interview/submit-answer")
        .send({});
      
      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Access token is missing");
    });

    it("should return 401 if token validation fails (JsonWebTokenError)", async () => {
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        const err = new Error("invalid token");
        err.name = "JsonWebTokenError";
        throw err;
      });

      const response = await request(app)
        .post("/api/interview/submit-answer")
        .set("Cookie", ["token=invalid_token"])
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Invalid token format");
    });
  });

  describe("Interview Endpoints Input Validation", () => {
    let mockUserId;

    beforeEach(() => {
      mockUserId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(jwt, "verify").mockReturnValue({ userId: mockUserId });
    });

    it("should return 400 if submit-answer receives an invalid interviewId format", async () => {
      const response = await request(app)
        .post("/api/interview/submit-answer")
        .set("Cookie", ["token=valid_token"])
        .send({
          interviewId: "invalid_id",
          questionIndex: 0,
          answer: "My answer",
          timeTaken: 10
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Valid Interview ID is required");
    });

    it("should return 400 if submit-answer receives an invalid questionIndex type", async () => {
      const response = await request(app)
        .post("/api/interview/submit-answer")
        .set("Cookie", ["token=valid_token"])
        .send({
          interviewId: new mongoose.Types.ObjectId().toString(),
          questionIndex: "not-a-number",
          answer: "My answer",
          timeTaken: 10
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Valid non-negative question index is required");
    });

    it("should return 400 if generate-questions receives an invalid interview mode", async () => {
      const response = await request(app)
        .post("/api/interview/generate-questions")
        .set("Cookie", ["token=valid_token"])
        .send({
          role: "Developer",
          experience: "Mid",
          mode: "InvalidMode"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid mode. Must be 'HR' or 'Technical'");
    });

    it("should return 400 if getInterviewReport receives an invalid interview id in params", async () => {
      const response = await request(app)
        .get("/api/interview/report/invalid-id-format")
        .set("Cookie", ["token=valid_token"]);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Valid Interview ID is required");
    });
  });
});
