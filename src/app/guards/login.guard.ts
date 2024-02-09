import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import jwtDecode from "jwt-decode";

@Injectable()
export class LoginGuard  {
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
