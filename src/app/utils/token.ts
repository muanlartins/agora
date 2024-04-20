import { Token } from "../models/types/token"

export function getToken(): Token {
  return localStorage.getItem('token') ?? '';
}

export function setToken(token: Token): void {
  localStorage.setItem('token', token);
}
