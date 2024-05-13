import { Component, Input, OnInit } from '@angular/core';
import { NzShapeSCType } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-pfp',
  templateUrl: './pfp.component.html',
  styleUrls: ['./pfp.component.scss']
})
export class PfpComponent {
  @Input()
  public id: string;

  @Input()
  public hasPfp: boolean = false;

  @Input()
  public size?: number;

  @Input()
  public shape: NzShapeSCType = 'circle';

  @Input()
  public path: string = 'pfps';

  public getSrc() {
    return 'https://www.agoradebates.com/assets/' + (this.hasPfp ? this.path + '/' + this.id : 'user.png');
  }
}
