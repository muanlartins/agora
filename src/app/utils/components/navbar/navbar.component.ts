import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { isAdmin } from '../../auth';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public form: FormGroup;

  @Output()
  public checkbox: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      checkbox: [false]
    });

    this.form.controls['checkbox'].valueChanges.subscribe((checkbox) => {
      this.checkbox.emit(checkbox);
    });
  }

  ngOnInit(): void {}

  public isAdmin() {
    return isAdmin();
  }
}
