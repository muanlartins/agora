import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input()
  public control: string;

  @Input()
  public placeholder: string;

  @Input()
  public type: string = 'text';

  @Input()
  public label: string;

  @Input()
  public form: FormGroup;

  @Input()
  public width: string;

  constructor() { }

  ngOnInit(): void {
  }

}
