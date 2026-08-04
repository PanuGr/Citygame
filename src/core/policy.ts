export interface PolicyConfig {
  displayName: string;
  type: 'slider';
  step: number;
  effects: {
    treasuryPerStep?: number;
    approvalPerStep?: number;
    pollutionPct?: number;
    utilitiesOutputPct?: number;
    upkeepPctOfTreasury?: number;
    jobsGrowthPct?: number;
  };
}

// All policies are 0-100 sliders. effect values are "full strength at 100";
// the game scales them by slider / 100.
export const POLICY_DATA: Record<string, PolicyConfig> = {
  TAX_RATE: {
    displayName: 'Tax Rate',
    type: 'slider',
    step: 10,
    effects: {
      treasuryPerStep: 10,
      approvalPerStep: -2,
    },
  },
  GREEN_ENERGY_MANDATE: {
    displayName: 'Green Energy Mandate',
    type: 'slider',
    step: 10,
    effects: {
      pollutionPct: -0.30,
      utilitiesOutputPct: 0.20,
      upkeepPctOfTreasury: 0.02,
    },
  },
  INDUSTRIAL_SUBSIDIES: {
    displayName: 'Industrial Subsidies',
    type: 'slider',
    step: 10,
    effects: {
      jobsGrowthPct: 0.15,
      pollutionPct: 0.25,
      upkeepPctOfTreasury: 0.06,
    },
  },
  PUBLIC_TRANSIT_FUNDING: {
    displayName: 'Public Transit Funding',
    type: 'slider',
    step: 10,
    effects: {
      pollutionPct: -0.15,
      upkeepPctOfTreasury: 0.015,
    },
  },
};
