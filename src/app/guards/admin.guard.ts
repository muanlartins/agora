import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import jwtDecode from "jwt-decode";
import { Role } from "../models/enums/role";

@Injectable()
export class AdminGuard  {
  public constructor (private router: Router) {}

  public canActivate() {
    const token = localStorage.getItem('token');

    if (token) {
      const decryptedToken: any = jwtDecode(token);

      return decryptedToken.role === Role.admin;
    }

    this.router.navigate(['']);

    return false;
  }
}
