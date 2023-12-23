import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectOption } from 'src/app/models/select-option';

@Component({
  selector: 'app-textarea-select',
  templateUrl: './textarea-select.component.html',
  styleUrls: ['./textarea-select.component.scss']
})
export class TextareaSelectComponent implements OnInit, OnChanges, AfterViewInit {
  @Input()
  public control: string;

  @Input()
  public placeholder: string;

  @Input()
  public label: string;

  @Input()
  public form: FormGroup;

  @Input()
  public width: string;

  @Input()
  public rows: number;

  @ViewChild('textarea')
  public textareaRef: ElementRef<HTMLTextAreaElement>;

  @Input()
  public type: string = 'text';

  @Input()
  public options: SelectOption[] = [];

  public filteredOptions: SelectOption[] = [];

  public showDropdown: boolean = false;

  public hasValue: boolean = false;

  public outside: boolean = false;

  constructor(private ref: ElementRef) { }

  ngOnInit(): void {
    this.form.controls[this.control].valueChanges.subscribe(() => {
        this.textareaRef.nativeElement.style.height = '';
        this.textareaRef.nativeElement.style.height = `${this.textareaRef.nativeElement.scrollHeight}px`;
      }
    )

    this.filteredOptions = this.options;
    this.subscribeToValueChanges();
  }

  ngOnChanges(changes: any): void {
    if (changes.options) this.filteredOptions = this.options;
  }

  ngAfterViewInit(): void {
    this.textareaRef.nativeElement.style.height = `${this.textareaRef.nativeElement.scrollHeight}px`;
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
