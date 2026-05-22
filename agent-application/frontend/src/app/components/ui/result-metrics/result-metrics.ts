import { Component, effect, inject } from '@angular/core';
import { ChatStore } from '../../../services/data-access/chat-store';
import { IMetrics } from '../../../models/ro';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-result-metrics',
  imports: [CurrencyPipe, DecimalPipe, NgClass],
  templateUrl: './result-metrics.html',
  styleUrl: './result-metrics.scss',
})
export class ResultMetrics {
  protected chatStore = inject(ChatStore);

  metrics: IMetrics | undefined;
  totalShipmentCount = 0;
  totalVehicleCount = 0;

  constructor() {
    effect(() => {
      const request = this.chatStore.optimizeRequest();
      const response = this.chatStore.optimizeResponse();

      this.totalShipmentCount =
        request?.model?.shipments?.filter(shipment => !shipment.ignore).length || 0;
      this.totalVehicleCount =
        request?.model?.vehicles?.filter(vehicle => !vehicle.ignore).length || 0;
      this.metrics = response?.metrics || undefined;
    });
  }
}
