import { Injectable } from '@angular/core';
import { Debate } from '../models/types/debate';
import { Member } from '../models/types/member';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  public getDebatesWithSociety(debates: Debate[], society: string) {
    return debates.filter((debate) =>
      debate.chair.society === society ||
      (debate.wings && debate.wings.some((wing) => wing.society === society)) ||
      debate.debaters.some((debater) => debater.society === society)
    );
  }

  public getMembersFromSociety(members: Member[], society: string) {
    return members.filter((member) => member.society === society);
  }

  public getDebatesWithPs(debates: Debate[], ps: string) {
    return debates.filter((debate) =>
      debate.chair.isTrainee ||
      (debate.wings && debate.wings.some((wing) => wing.isTrainee)) ||
      debate.debaters.some((debater) => debater.isTrainee)
    );
  }

  public getMembersFromPs(members: Member[], ps: string) {
    return members.filter((member) => member.isTrainee);
  }

  public getFirstDebaterIndexByHouseIndex(houseIndex: number) {
    return houseIndex%2 + Math.floor(houseIndex/2) * 4;
  }

  public isDebaterIronOnDebate(debate: Debate, member: Member) {
    return debate.debaters.filter((debater) => debater.id === member.id).length > 1;
  }

  public sortDebates(debates: Debate[])  {
    return debates.sort((a, b) =>
        this.getDatetimeMoment(b.date, b.time).toDate().getTime() - this.getDatetimeMoment(a.date, a.time).toDate().getTime()
      );
  }

  private getDatetimeMoment(date: string, time: string) {
    let datetime = moment(date);

    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));

    return datetime;
    }
}
