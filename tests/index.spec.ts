import jwt from "jsonwebtoken";
import { JWTService } from "../src/utils/helpers/jwt.helpers";

jest.mock("jsonwebtoken");

describe("JWT Service", () => {
  const JWT_SECRET = "secret";
  const expiresIn = "1h";

  const jwtService = new JWTService(JWT_SECRET, expiresIn);
  describe("generateToken", () => {
    it("should generate a token with the correct payload and expiration time", () => {
      const userPayload = {
        userId: "1234",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@test.com",
        phone: "08012345678",
      };
      const token = "mocked.jwt.token";

      (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
        expect(payload).toEqual(userPayload);
        expect(secret).toBe(JWT_SECRET);
        expect(options.expiresIn).toEqual(expiresIn);
        return token;
      });

      const result = jwtService.generateToken(userPayload);
      expect(result).toBe(token);
    });

    it("should throw an error if token generation fails", () => {
      const userPayload = {
        userId: "1234",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@test.com",
        phone: "08012345678",
      };

      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      expect(() => jwtService.generateToken(userPayload)).toThrow(
        "Token generation failed"
      );
    });
  });
});
