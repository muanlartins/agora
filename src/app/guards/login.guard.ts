import { CanActivateFn } from "@angular/router";

export const isLoggedIn: CanActivateFn = (route) => {
  return true;
}
