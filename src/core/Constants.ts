export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  GRID_WIDTH: 16,
  GRID_HEIGHT: 12,
  TICK_INTERVAL_MS: 12000, // Monthly tick base interval at 1x speed (12 seconds per month)
  // Isometric diamond tile: HALF_W:HALF_H keeps the 2:1 iso ratio. Map spans
  // (GRID_WIDTH + GRID_HEIGHT) * HALF_W wide by (GRID_WIDTH + GRID_HEIGHT) * HALF_H tall.
  ISO_HALF_W: 28,
  ISO_HALF_H: 14,
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface BuildingTypeConfig {
  key: string;
  displayName: string;
  category: 'residential' | 'industrial' | 'utility' | 'civic';
  cost: number;
  upkeep: number;
  population: number;
  jobs: number;
  utilitySupply: number;
  utilityDemand: number;
  pollution: number;
  taxBonus: number;
  textureKey: string;
}

export const BUILDINGS: Record<string, BuildingTypeConfig> = {
  HOUSE: {
    key: 'HOUSE',
    displayName: 'Residential House',
    category: 'residential',
    cost: 100,
    upkeep: 5,
    population: 4,
    jobs: 0,
    utilitySupply: 0,
    utilityDemand: 2,
    pollution: 1,
    taxBonus: 30,
    textureKey: 'house1',
  },
  FACTORY: {
    key: 'FACTORY',
    displayName: 'Industrial Factory',
    category: 'industrial',
    cost: 250,
    upkeep: 15,
    population: 0,
    jobs: 6,
    utilitySupply: 0,
    utilityDemand: 5,
    pollution: 8,
    taxBonus: 80,
    textureKey: 'factory',
  },
  UTILITIES_DIRTY: {
    key: 'UTILITIES_DIRTY',
    displayName: 'Coal Power Plant',
    category: 'utility',
    cost: 200,
    upkeep: 20,
    population: 0,
    jobs: 2,
    utilitySupply: 40,
    utilityDemand: 0,
    pollution: 10,
    taxBonus: 0,
    textureKey: 'powerplant',
  },
  UTILITIES_CLEAN: {
    key: 'UTILITIES_CLEAN',
    displayName: 'Green Energy Station',
    category: 'utility',
    cost: 450,
    upkeep: 25,
    population: 0,
    jobs: 2,
    utilitySupply: 40,
    utilityDemand: 0,
    pollution: 0,
    taxBonus: 0,
    textureKey: 'tower',
  },
  PARK: {
    key: 'PARK',
    displayName: 'Public Park',
    category: 'civic',
    cost: 150,
    upkeep: 10,
    population: 0,
    jobs: 1,
    utilitySupply: 0,
    utilityDemand: 1,
    pollution: -8,
    taxBonus: 0,
    textureKey: 'park',
  },
};

export interface PolicySettings {
  taxRate: number; // 0 to 100 (%), 10% steps
  greenEnergyMandate: number; // 0 to 100 (% strength)
  industrialSubsidies: number; // 0 to 100 (% strength)
  publicTransitFunding: number; // 0 to 100 (% strength)
}

export const DEFAULT_POLICIES: PolicySettings = {
  taxRate: 10,
  greenEnergyMandate: 0,
  industrialSubsidies: 0,
  publicTransitFunding: 0,
};

export interface ChoiceOption {
  text: string;
  description: string;
  moneyChangePct: number; // % of current treasury, e.g. 0.5 = +50%, -0.3 = -30%
  approvalChanges: {
    residents?: number; // flat approval points (approval is already 0-100)
  };
  pollutionChangePct?: number; // % of current pollution, e.g. -0.5 = -50%
  happinessChange?: number;
}

export interface CityEvent {
  id: string;
  title: string;
  description: string;
  options: ChoiceOption[];
}

export const EVENT_DATABASE: CityEvent[] = [
  {
    id: 'chemical_spill',
    title: 'Industrial Chemical Spill',
    description: 'A major chemical leaks from a city factory into the local river basin.',
    options: [
      {
        text: 'Fine the Factory heavily',
        description: 'Gain a portion of treasury, +15 Resident approval',
        moneyChangePct: 0.5,
        approvalChanges: { residents: 15 },
        pollutionChangePct: -0.25,
      },
      {
        text: 'Offer government cleanup assistance',
        description: 'Cost a portion of treasury, +10 Resident approval',
        moneyChangePct: -0.3,
        approvalChanges: { residents: 10 },
        pollutionChangePct: -0.5,
      },
    ],
  },
  {
    id: 'labor_strike',
    title: 'Transit & Utility Workers Strike',
    description: 'Workers demand higher wages and safety protections across municipal facilities.',
    options: [
      {
        text: 'Meet worker demands',
        description: 'Cost a portion of treasury, +15 Resident approval',
        moneyChangePct: -0.4,
        approvalChanges: { residents: 15 },
        happinessChange: 10,
      },
      {
        text: 'Refuse negotiation',
        description: 'Save money, -15 Resident approval',
        moneyChangePct: 0,
        approvalChanges: { residents: -15 },
        happinessChange: -10,
      },
    ],
  },
  {
    id: 'green_tech_grant',
    title: 'Green Innovation Opportunity',
    description: 'Clean energy innovators offer to pilot smart grid infrastructure in your city.',
    options: [
      {
        text: 'Fund the Initiative',
        description: 'Cost a portion of treasury, +15 Resident approval',
        moneyChangePct: -0.5,
        approvalChanges: { residents: 15 },
        pollutionChangePct: -0.75,
        happinessChange: 5,
      },
      {
        text: 'Decline for now',
        description: 'Save funds, -5 Resident approval',
        moneyChangePct: 0,
        approvalChanges: { residents: -5 },
      },
    ],
  },
  {
    id: 'housing_shortage',
    title: 'Housing Affordability Crisis',
    description: 'Surging population leads to rising housing costs and citizen distress.',
    options: [
      {
        text: 'Subsidize Affordable Housing',
        description: 'Cost a portion of treasury, +20 Resident approval',
        moneyChangePct: -0.4,
        approvalChanges: { residents: 20 },
        happinessChange: 15,
      },
      {
        text: 'Allow market self-regulation',
        description: '-15 Resident approval',
        moneyChangePct: 0,
        approvalChanges: { residents: -15 },
        happinessChange: -10,
      },
    ],
  },
  {
    id: 'tycoon_gala',
    title: 'Annual Commerce Summit',
    description: 'Local business leaders invite the Mayor to sponsor the regional industrial expo.',
    options: [
      {
        text: 'Sponsor the Expo',
        description: 'Cost a portion of treasury, +5 Resident approval',
        moneyChangePct: -0.3,
        approvalChanges: { residents: 5 },
        happinessChange: 5,
      },
      {
        text: 'Decline invitation',
        description: '-5 Resident approval',
        moneyChangePct: 0,
        approvalChanges: { residents: -5 },
      },
    ],
  },
  {
    id: 'smog_alert',
    title: 'Severe Urban Smog Alert',
    description: 'Air quality drops to hazardous levels due to industrial emissions.',
    options: [
      {
        text: 'Enforce Emergency Emission Limits',
        description: 'Cost a portion of treasury, +15 Resident approval',
        moneyChangePct: -0.2,
        approvalChanges: { residents: 15 },
        pollutionChangePct: -0.5,
        happinessChange: 5,
      },
      {
        text: 'Issue health warnings only',
        description: '-15 Resident approval',
        moneyChangePct: 0,
        approvalChanges: { residents: -15 },
        happinessChange: -10,
      },
    ],
  },
];

export const EVENTS = {
  STATE_CHANGED: 'state:changed',
  MONTH_TICK: 'time:month_tick',
  TRIGGER_MONTHLY_EVENT: 'event:trigger_monthly',
  EVENT_RESOLVED: 'event:resolved',
  GAME_OVER: 'game:over',
  POLICY_CHANGED: 'policy:changed',
  SPECTACLE_ENTRANCE: 'spectacle:entrance',
  SPECTACLE_ACTION: 'spectacle:action',
  SPECTACLE_HIT: 'spectacle:hit',
};
