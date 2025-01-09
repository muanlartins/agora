import { ErrorHandler, Injectable } from "@angular/core";
import { NotificationService } from "../services/notification.service";

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  constructor(private notificationService: NotificationService) {}

  handleError(error: Error) {
    this.notificationService.createErrorNotification(error.message);
  }
}
