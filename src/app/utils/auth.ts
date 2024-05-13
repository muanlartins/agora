import jwtDecode from "jwt-decode";
import { getToken } from "./token";
import { Role } from "../models/enums/role";

export function isAdmin(): boolean {
  const token = getToken();

  if (!token) return false;

  const decodedToken: any = jwtDecode(token);

  return decodedToken.role === Role.admin || decodedToken.role === Role.superadmin;
}

export function isSuperAdmin(): boolean {
  const token = getToken();

  if (!token) return false;

  const decodedToken: any = jwtDecode(token);

  return decodedToken.role === Role.superadmin;
}
