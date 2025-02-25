import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent {
  public isNavbarHamburgerActive: boolean = false;

  public constructor() {}

  public onNavbarHamburgerChange(checkbox: boolean) {
    this.isNavbarHamburgerActive = checkbox;
  }
}
