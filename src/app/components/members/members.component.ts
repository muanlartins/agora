import { Component } from '@angular/core';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent {
  public isNavbarHamburgerActive: boolean = false;

  public constructor() {}

  public onNavbarHamburgerChange(checkbox: boolean) {
    this.isNavbarHamburgerActive = checkbox;
  }
}
