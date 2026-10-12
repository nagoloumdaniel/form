import bcrypt from "bcryptjs";

import { authConfig } from "./config";

export function hashPassword(password: string) {
  return bcrypt.hash(password, authConfig.bcryptCost);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
