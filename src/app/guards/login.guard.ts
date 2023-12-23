import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import jwtDecode from "jwt-decode";

@Injectable()
export class LoginGuard implements CanActivate {
  public constructor (private router: Router) {}

  public canActivate() {
    const token = localStorage.getItem('token');

    if (token) {
      const decryptedToken: any = jwtDecode(token);

      if (Date.now() > decryptedToken.exp * 1000) {
        this.router.navigate(['/login']);
        return false;
      }

      return true;
    }

    this.router.navigate(['/login']);

    return false;
  }
}
