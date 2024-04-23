export interface ScenarioKpis {
    shipmentKpis: {
      total: number,
      selected: number,
      demands: {
        selected: number,
        total: number,
        type: string,
      }[],
      pickups: number,
      deliveries: number,
      dwellTime: number,
    },
    vehicleKpis: {
      total: number,
      selected: number,
      capacities: {
        selected: number,
        total: number,
        type: string,
      }[],
    },
  }