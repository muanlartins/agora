import { Component, Input, OnInit } from '@angular/core';
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

  public getSrc() {
    return '/assets/' + (this.hasPfp ? 'pfps/' + this.id : 'user.png');
  }
}
