export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 50,
  GRID_WIDTH: 16,
  GRID_HEIGHT: 12,
  TICK_INTERVAL_MS: 3000, // Monthly tick base interval at 1x speed
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
  taxRate: number; // 0 to 25 (%)
  greenEnergyMandate: boolean; // upkeep $50, env +15, tycoon -10
  industrialSubsidies: boolean; // upkeep $60, tycoon +20, env -15, jobs +15%
  publicTransitFunding: boolean; // upkeep $40, union +15, residents +15, pollution -5
}

export const DEFAULT_POLICIES: PolicySettings = {
  taxRate: 10,
  greenEnergyMandate: false,
  industrialSubsidies: false,
  publicTransitFunding: false,
};

export interface ChoiceOption {
  text: string;
  description: string;
  moneyChange: number;
  approvalChanges: {
    env?: number;
    tycoon?: number;
    labor?: number;
    residents?: number;
  };
  pollutionChange?: number;
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
        description: 'Gain $500, +15 Environmentalist approval, -15 Tycoon approval',
        moneyChange: 500,
        approvalChanges: { env: 15, tycoon: -15 },
        pollutionChange: -5,
      },
      {
        text: 'Offer government cleanup assistance',
        description: 'Cost $300, +10 Tycoon approval, +5 Resident approval',
        moneyChange: -300,
        approvalChanges: { tycoon: 10, residents: 5, env: -5 },
        pollutionChange: -10,
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
        description: 'Cost $400, +20 Union approval, +10 Resident approval',
        moneyChange: -400,
        approvalChanges: { labor: 20, residents: 10, tycoon: -10 },
        happinessChange: 10,
      },
      {
        text: 'Refuse negotiation',
        description: 'Save money, -20 Union approval, -10 Resident approval',
        moneyChange: 0,
        approvalChanges: { labor: -20, residents: -10, tycoon: 10 },
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
        description: 'Cost $500, +20 Environmentalist approval, +10 Resident approval',
        moneyChange: -500,
        approvalChanges: { env: 20, residents: 10 },
        pollutionChange: -15,
        happinessChange: 5,
      },
      {
        text: 'Decline for now',
        description: 'Save funds, -5 Environmentalist approval',
        moneyChange: 0,
        approvalChanges: { env: -5 },
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
        description: 'Cost $400, +15 Resident approval, +15 Union approval',
        moneyChange: -400,
        approvalChanges: { residents: 15, labor: 15, tycoon: -5 },
        happinessChange: 15,
      },
      {
        text: 'Allow market self-regulation',
        description: '+15 Tycoon approval, -15 Resident approval',
        moneyChange: 0,
        approvalChanges: { tycoon: 15, residents: -15 },
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
        description: 'Cost $300, +25 Tycoon approval, +10 Labor approval',
        moneyChange: -300,
        approvalChanges: { tycoon: 25, labor: 10 },
        happinessChange: 5,
      },
      {
        text: 'Decline invitation',
        description: '-15 Tycoon approval',
        moneyChange: 0,
        approvalChanges: { tycoon: -15 },
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
        description: 'Cost $200, +20 Env approval, -15 Tycoon approval',
        moneyChange: -200,
        approvalChanges: { env: 20, tycoon: -15 },
        pollutionChange: -20,
        happinessChange: 5,
      },
      {
        text: 'Issue health warnings only',
        description: '-15 Resident approval, -10 Env approval',
        moneyChange: 0,
        approvalChanges: { residents: -15, env: -10 },
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
