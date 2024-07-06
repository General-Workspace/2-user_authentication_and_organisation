import bcrypt from "bcryptjs";

export class BcryptHelper {
  /**
   * @description Hashes a password using bcrypt
   * @param {string} password - The password to hash
   * @returns {Promise<string>} - The hashed password
   */

  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * @description Compares a password with a hashed password
   * @param {string} password - The password to compare
   * @param {string} hashedPassword - The hashed password to compare against
   * @returns {Promise<boolean>} - True if the passwords match, false otherwise
   */

  public async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

export default new BcryptHelper();
