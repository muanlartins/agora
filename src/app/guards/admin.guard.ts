import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { isAdmin } from "../utils/auth";

@Injectable()
export class AdminGuard  {
  public constructor (private router: Router) {}

  public canActivate() {
    if (isAdmin()) return true;

    this.router.navigate(['']);

    return false;
  }
}
