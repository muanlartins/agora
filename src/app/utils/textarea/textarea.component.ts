import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit, AfterViewInit {
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
  public ref: ElementRef<HTMLTextAreaElement>;

  constructor() {}

  ngOnInit(): void {
    this.form.controls[this.control].valueChanges.subscribe(() => {
        this.ref.nativeElement.style.height = '';
        this.ref.nativeElement.style.height = `${this.ref.nativeElement.scrollHeight}px`;
      }
    )
  }

  ngAfterViewInit(): void {
    this.ref.nativeElement.style.height = `${this.ref.nativeElement.scrollHeight}px`;
  }
}
