import { Component, OnInit } from '@angular/core';
import { isAdmin } from '../../auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {}

  public isAdmin() {
    return isAdmin();
  }
}
