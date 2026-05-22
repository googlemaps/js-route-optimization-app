import { google } from '@googlemaps/routeoptimization/build/protos/protos';
import v1 = google.maps.routeoptimization.v1;

import OptimizeToursRequest = v1.OptimizeToursRequest;
import OptimizeToursResponse = v1.OptimizeToursResponse;
import IOptimizeToursResponse = v1.IOptimizeToursResponse;
import IMetrics = v1.OptimizeToursResponse.IMetrics;
import IShipment = v1.IShipment;
import IVehicle = v1.IVehicle;
import IShipmentRoute = v1.IShipmentRoute;
import IShipmentModel = v1.IShipmentModel;
import IVisit = v1.ShipmentRoute.IVisit;

export { OptimizeToursRequest, OptimizeToursResponse };
export type {
  IMetrics,
  IShipmentRoute,
  IShipment,
  IVehicle,
  IShipmentModel,
  IOptimizeToursResponse,
  IVisit,
};
