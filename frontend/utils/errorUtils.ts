

import { CUSTOM_CODES } from "@/app/types/types.utils";
import { AuthError } from "@/store/auth/reducer";

export const getAuthError = (error: any): AuthError => {
  // console.log("\n\nPassed in error on login : ", error);
  if (error["custom_code"] as CUSTOM_CODES) {
    return {
      customCode: error["custom_code"] as CUSTOM_CODES,
      message: error["detail"] || "Unkown error",
    };
  }

  // console.log("\n\nError is not axios error...")

  return { customCode: CUSTOM_CODES.OTHER, message: "Unkown error" };
};
