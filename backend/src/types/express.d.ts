import type { GlobalRole } from "../models/user.model.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: GlobalRole;
      name: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
