import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as AOS from 'aos';
import * as Typed from 'typed.js';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements AfterViewInit {
  @ViewChild('title')
  public title: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    AOS.init();

    this.initTyped();
  }

  public initTyped() {
    const typed = new Typed.default(this.title.nativeElement, {
      strings: ['Debater é <b>arte</b>.', 'Debater é <b>história<b>.', 'Debater é <b>vida</b>.'],
      typeSpeed: 60,
      loop: true
    });

    typed.start();
  }
}
