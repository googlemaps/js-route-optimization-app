export enum MapLayerId {
  PostSolveVisitRequests,
  Routes,
  PostSolveVehicles,
}

export interface MapLayer {
  name: string;
  icon: string;
  visible?: boolean;
}
