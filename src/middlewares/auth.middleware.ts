import { Request as ExRequest } from "express"
import { TSTError } from "../models/error.model"
import { User } from "../types/users.type"

export async function expressAuthentication(
  req: ExRequest,
  securityName: string,
  _scopes: string[]=[],
): Promise<User> {
  if (securityName !== "bearerAuth") {
    throw new TSTError('UNKNOWN_SERVER_ERROR', 'Unknown securityName in ' + req.path)
  }

  const [authType, accessToken, ...rest] = req.headers.authorization?.split(' ') || []
  if (authType !== 'Bearer' || !accessToken || rest.length > 0) {
    throw new TSTError('AUTH_REQUIRE', `Set authorization header like "Bearer <accessToken>"`)
  }

  // TODO: Add your authentication codes.
  // For the example, it use accessToken as userId

  return {id: 'a', email: 'a@example.com', scopes: []}
}
