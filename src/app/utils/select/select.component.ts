import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectOption } from 'src/app/models/select-option';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  @Input()
  public control: string;

  @Input()
  public type: string = 'text';

  @Input()
  public label: string;

  @Input()
  public form: FormGroup;

  @Input()
  public width: string;

  @Input()
  public options: SelectOption[];

  @Input()
  public placeholder: string;

  public showDropdown: boolean = false;

  public hasValue: boolean = false;

  public outside: boolean = false;

  public value: string;

  constructor(private ref: ElementRef) { }

  ngOnInit(): void {
    this.subscribeToValueChanges();
  }

  @HostListener('document:click', ['$event'])
  public outsideClick(event: Event): void {
    if (this.ref.nativeElement.contains(event.target)) return;
    this.showDropdown = false;
  }

  public select(option: SelectOption) {
    this.form.controls[this.control].patchValue(option.id);
    this.showDropdown = false;
    this.hasValue = true;
    this.value = option.value;
  }

  public openDropdown() {
    this.showDropdown = true;
  }

  public closeDropdown() {
    this.showDropdown = false;
  }

  public removeValue() {
    this.form.controls[this.control].patchValue("");
    this.hasValue = false;
    this.showDropdown = false;
  }

  public subscribeToValueChanges() {
    this.form.controls[this.control].valueChanges.subscribe((value: string) => {
      this.hasValue = !!value;
      this.value = this.hasValue ? this.options.find((option: SelectOption) => option.id === value)!.value : '';
    });
  }
}
