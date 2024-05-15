/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { StatusCode } from 'grpc-web';
import { Solution, Scenario, MessagesConfig, IShipmentModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OptimizeToursMessageService {
  private messages: MessagesConfig = {
    allShipmentsSkippedWarning: 'All shipments skipped',
    trafficInfeasibilitiesInfo: 'One or more traffic infeasibilities found',
  };

  private readonly grpcStatusByCode = new Map<number, string>();

  constructor(private messageService: MessageService) {
    Object.keys(StatusCode).forEach((status) => {
      this.grpcStatusByCode.set(StatusCode[status], status);
    });

    this.messageService.messages$.subscribe((errorMessages) => {
      this.messages = Object.assign(this.messages, errorMessages);
    });
  }

  error(error: any): void {
    const duration = this.determineSnackBarDuration();
    const panelClass: string[] = this.determinePanelClass();
    const errorMessage: string = this.constructErrorMessage(error);
    if (errorMessage === this.messages.unrecognizedError) {
      // eslint-disable-next-line no-console
      console.log(errorMessage, error);
    }
    this.messageService.error(errorMessage, { duration, panelClass });
  }

  generateMessagesForSolution(solution: Solution, scenario: Scenario): void {
    const { routes, skippedShipments } = solution || ({} as Solution);
    if (routes && routes.filter((x) => x.hasTrafficInfeasibilities === true).length > 0) {
      this.messageService.info(this.messages.trafficInfeasibilitiesInfo as string);
    }

    const { shipments, vehicles } = (scenario && scenario.model) || ({} as IShipmentModel);
    if (
      shipments &&
      shipments.length > 0 &&
      vehicles &&
      vehicles.length > 0 &&
      skippedShipments &&
      skippedShipments.length === shipments.length
    ) {
      this.messageService.warning(this.messages.allShipmentsSkippedWarning as string);
    }
  }

  private constructErrorMessage(error: any): string {
    if (!error) {
      return this.messages.unrecognizedError as string;
    }
    if (this.grpcStatusByCode.has(error.code)) {
      return this.constructGrpcErrorMessage(error);
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    return (
      error.error?.error?.message || error.message || (this.messages.unrecognizedError as string)
    );
  }

  private constructGrpcErrorMessage(error: any): string {
    const status = this.grpcStatusByCode.get(error.code);
    const grpcStatusCodes = this.messages.grpcStatusCodes || {};
    const defaultMessage = `gRPC code: ${error.code}<br>gRPC status: ${status}`;

    // Should use a logging service so these messages aren't visible by default in production builds
    // eslint-disable-next-line no-console
    console.log(`gRPC code: ${error.code}\ngRPC status: ${status}\n${error.message}`);

    return grpcStatusCodes[status] || error.message || defaultMessage;
  }

  private determinePanelClass(): string[] {
    return [];
  }

  private determineSnackBarDuration(): number {
    return null;
  }
}
