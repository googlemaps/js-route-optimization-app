export enum MapLayerId {
  PostSolveVisitRequests,
  Routes,
  PostSolveFourWheel,
  PostSolveWalking
}

export interface MapLayer {
  name: string;
  icon: string;
  visible?: boolean;
}
