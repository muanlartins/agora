import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private nzNotificationService: NzNotificationService) { }

  public createSuccessNotification(value: string) {
    this.nzNotificationService.success(
      'Sucesso',
      value,
      { nzClass: 'nz-notification', nzPlacement: 'bottomRight' }
    )
  }

  public createErrorNotification() {
    this.nzNotificationService.error(
      'Erro',
      'Algo deu errado',
      { nzClass: 'nz-notification', nzPlacement: 'bottomRight' }
    )
  }
}
