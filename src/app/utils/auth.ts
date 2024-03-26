import jwtDecode from "jwt-decode";
import { getToken } from "./token";
import { Role } from "../models/enums/role";

export function isAdmin(): boolean {
  const token = getToken();

  const decodedToken: any = jwtDecode(token);

  return decodedToken.role === Role.admin;
}
