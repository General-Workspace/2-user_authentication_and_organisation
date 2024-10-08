import jwt, { Secret, TokenExpiredError } from "jsonwebtoken";

export class JWTService {
  private secret: Secret;
  private expiresIn: string | number;

  constructor(secret: Secret, expiresIn: string | number) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  /**
   * @description Generate a JWT token
   * @param {object} payload
   * @param expiresIn - time it will take for the token to expire
   * @returns {string} token
   */

  public generateToken(payload: Record<string, unknown>): string {
    const token = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    if (!token) {
      throw new Error("Token generation failed");
    }
    return token;
  }

  /**
   * @description Verify a JWT token
   * @param {string} token
   * @returns {object} payload
   */

  public verifyToken(token: string): Record<string, unknown> | null {
    try {
      const payload = jwt.verify(token, this.secret);
      return payload as Record<string, unknown>;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const err = {
          name: error.name,
          message: error.message,
          expiredAt: error.expiredAt,
        };
        throw err;
      }
      return null;
    }
  }
}

const jwtService = new JWTService(
  process.env["JWT_SECRET"] as Secret,
  process.env["JWT_EXPIRES_IN"] as string
);

export default jwtService;
