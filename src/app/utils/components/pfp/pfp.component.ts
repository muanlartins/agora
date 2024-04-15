import { Component, Input, OnInit } from '@angular/core';
import { NzShapeSCType } from 'ng-zorro-antd/core/types';
import { MemberService } from 'src/app/services/member.service';

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

  public getSrc() {
    return 'http://agorasdufrj.s3-website-sa-east-1.amazonaws.com/assets/' + (this.hasPfp ? 'pfps/' + this.id : 'user.png');
  }
}
