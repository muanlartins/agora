import { Component, ElementRef, HostListener, Input, OnChanges, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectOption } from 'src/app/models/select-option';

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss']
})
export class InputSelectComponent implements OnInit, OnChanges {
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

  public filteredOptions: SelectOption[] = [];

  public showDropdown: boolean = false;

  public hasValue: boolean = false;

  public outside: boolean = false;

  constructor(private ref: ElementRef) { }

  ngOnInit(): void {
    this.subscribeToValueChanges();
    this.filteredOptions = this.options;
  }

  ngOnChanges(changes: any): void {
    if (changes.options) this.filteredOptions = this.options;
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

      this.filteredOptions = this.hasValue ?
        this.options.filter((option: SelectOption) => option.value.toLowerCase().match(value.toLowerCase())) :
        this.options;
    });
  }
}
