import { GameState } from '../core/GameState';
import { BUILDINGS, EVENT_DATABASE, CityEvent, DEFAULT_POLICIES, EVENTS, MONTH_NAMES } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { PolicyManager } from '../systems/PolicyManager';
import { SaveManager } from '../systems/SaveManager';
import { EventManager } from '../systems/EventManager';

export class HtmlUI {
  private eventManager: EventManager;

  // UI DOM References
  private hudElement!: HTMLDivElement;
  private toolbarElement!: HTMLDivElement;
  private policyModalElement!: HTMLDivElement;
  private eventModalElement!: HTMLDivElement;
  private gameOverModalElement!: HTMLDivElement;

  public selectedAction: string | null = null; // 'HOUSE', 'FACTORY', 'demolish', or null

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.setupStyles();
    this.createHUD();
    this.createToolbar();
    this.createPolicyModal();
    this.createEventModal();
    this.createGameOverModal();

    // Listen to game state changes to update the UI
    EventBus.on(EVENTS.STATE_CHANGED, () => this.updateUI());
    EventBus.on(EVENTS.TRIGGER_MONTHLY_EVENT, (event: CityEvent) => this.showEventModal(event));
    EventBus.on(EVENTS.GAME_OVER, () => this.showGameOverModal());

    this.updateUI();
  }

  private setupStyles(): void {
    // Inject custom CSS styling dynamically to avoid polluting style.css
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #f5f6fa;
        overflow-x: hidden;
      }
      .game-hud {
        position: fixed;
        top: 15px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 900px;
        background: rgba(30, 39, 46, 0.95);
        border: 2px solid #3c6382;
        border-radius: 8px;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        z-index: 1000;
      }
      .hud-stat-group {
        display: flex;
        gap: 15px;
      }
      .hud-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .hud-stat .label {
        font-size: 11px;
        text-transform: uppercase;
        color: #9c88ff;
        font-weight: bold;
      }
      .hud-stat .value {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
      }
      .timeline-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .time-controls {
        display: flex;
        gap: 6px;
      }
      .time-btn {
        background: #2f3640;
        border: 1px solid #718093;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: background 0.2s;
      }
      .time-btn.active {
        background: #4cd137;
        border-color: #4cd137;
        color: #1e272e;
        font-weight: bold;
      }
      .game-toolbar {
        position: fixed;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 900px;
        background: rgba(30, 39, 46, 0.95);
        border: 2px solid #3c6382;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 -4px 15px rgba(0,0,0,0.5);
        z-index: 1000;
      }
      .tool-cards {
        display: flex;
        gap: 10px;
      }
      .tool-card {
        background: #2f3640;
        border: 1px solid #718093;
        border-radius: 6px;
        padding: 6px 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
        transition: all 0.2s;
      }
      .tool-card:hover {
        background: #353b48;
        border-color: #00a8ff;
      }
      .tool-card.active {
        background: #00a8ff;
        border-color: #00d2d3;
        color: #1e272e;
      }
      .tool-card .name {
        font-size: 11px;
        font-weight: bold;
      }
      .tool-card .cost {
        font-size: 10px;
        color: #4cd137;
      }
      .tool-card.active .cost {
        color: #1e272e;
        font-weight: bold;
      }
      .aux-controls {
        display: flex;
        gap: 8px;
      }
      .action-btn {
        background: #3c6382;
        border: none;
        color: white;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.2s;
      }
      .action-btn:hover {
        background: #0a3d62;
      }
      .action-btn.danger {
        background: #e74c3c;
      }
      .action-btn.danger:hover {
        background: #c0392b;
      }
      .action-btn.active {
        background: #f1c40f;
        color: #2c3e50;
      }
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .modal.show {
        opacity: 1;
        pointer-events: auto;
      }
      .modal-content {
        background: #1e272e;
        border: 3px solid #3c6382;
        border-radius: 12px;
        width: 90%;
        max-width: 550px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        position: relative;
      }
      .modal-header {
        font-size: 22px;
        font-weight: bold;
        color: #00a8ff;
        border-bottom: 2px solid #3c6382;
        padding-bottom: 10px;
        margin-bottom: 20px;
        text-align: center;
      }
      .modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: #718093;
        font-size: 20px;
        cursor: pointer;
      }
      .modal-close:hover {
        color: #fff;
      }
      .policy-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        margin-bottom: 20px;
      }
      .slider-container {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .toggle-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #2f3640;
        padding: 10px 15px;
        border-radius: 8px;
      }
      .faction-container {
        margin-top: 20px;
        border-top: 1px solid #3c6382;
        padding-top: 15px;
      }
      .faction-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .faction-bar-bg {
        background: #2f3640;
        width: 150px;
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
      }
      .faction-bar-fill {
        height: 100%;
        background: #4cd137;
        width: 50%;
        transition: width 0.3s;
      }
      .event-card {
        text-align: center;
      }
      .event-description {
        font-size: 15px;
        line-height: 1.5;
        margin-bottom: 25px;
        color: #dcdde1;
      }
      .event-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .event-opt-btn {
        background: #2f3640;
        border: 2px solid #718093;
        border-radius: 8px;
        padding: 12px;
        color: white;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
      }
      .event-opt-btn:hover {
        background: #353b48;
        border-color: #f1c40f;
      }
      .event-opt-title {
        font-weight: bold;
        color: #f1c40f;
        margin-bottom: 4px;
      }
      .event-opt-effects {
        font-size: 12px;
        color: #a4b0be;
      }
      .report-card-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 25px;
      }
      .report-item {
        background: #2f3640;
        padding: 10px;
        border-radius: 6px;
        text-align: center;
      }
      .report-item .lbl {
        font-size: 12px;
        color: #718093;
      }
      .report-item .val {
        font-size: 18px;
        font-weight: bold;
      }
      .grade-banner {
        font-size: 48px;
        font-weight: 900;
        color: #f1c40f;
        text-shadow: 0 0 10px rgba(241,196,15,0.5);
        margin: 20px 0;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  private createHUD(): void {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'game-hud';
    document.body.appendChild(this.hudElement);
  }

  private createToolbar(): void {
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.className = 'game-toolbar';
    document.body.appendChild(this.toolbarElement);
  }

  private createPolicyModal(): void {
    this.policyModalElement = document.createElement('div');
    this.policyModalElement.className = 'modal';
    this.policyModalElement.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-header">Democracy Policy Council</div>
        <div class="policy-grid">
          <div class="slider-container">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: bold;">Income Tax Rate</span>
              <span id="tax-val-display" style="color: #4cd137; font-weight: bold;">10%</span>
            </div>
            <input type="range" id="tax-slider" min="0" max="25" value="10" style="width: 100%; cursor: pointer;">
          </div>
          <div class="toggle-option">
            <div>
              <div style="font-weight: bold;">Green Energy Mandate</div>
              <div style="font-size: 11px; color: #a4b0be;">Upkeep $50 | Environmentalist +15 | Tycoon -10</div>
            </div>
            <input type="checkbox" id="policy-green" style="transform: scale(1.3); cursor: pointer;">
          </div>
          <div class="toggle-option">
            <div>
              <div style="font-weight: bold;">Industrial Subsidies</div>
              <div style="font-size: 11px; color: #a4b0be;">Upkeep $60 | Tycoon +20 | Env -15 | Job output +15%</div>
            </div>
            <input type="checkbox" id="policy-subsidy" style="transform: scale(1.3); cursor: pointer;">
          </div>
          <div class="toggle-option">
            <div>
              <div style="font-weight: bold;">Public Transit Funding</div>
              <div style="font-size: 11px; color: #a4b0be;">Upkeep $40 | Union +15 | Residents +15 | Pollution -5</div>
            </div>
            <input type="checkbox" id="policy-transit" style="transform: scale(1.3); cursor: pointer;">
          </div>
        </div>
        <div class="faction-container">
          <div style="font-weight: bold; margin-bottom: 15px; color: #00a8ff; text-align: center;">Faction Approval ratings</div>
          <div class="faction-row">
            <span>Environmentalists</span>
            <div class="faction-bar-bg"><div id="fac-env" class="faction-bar-fill"></div></div>
          </div>
          <div class="faction-row">
            <span>Business Tycoons</span>
            <div class="faction-bar-bg"><div id="fac-tycoon" class="faction-bar-fill"></div></div>
          </div>
          <div class="faction-row">
            <span>Labor Union</span>
            <div class="faction-bar-bg"><div id="fac-labor" class="faction-bar-fill"></div></div>
          </div>
          <div class="faction-row">
            <span>City Residents</span>
            <div class="faction-bar-bg"><div id="fac-residents" class="faction-bar-fill"></div></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.policyModalElement);

    // Event listeners
    const closeBtn = this.policyModalElement.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => {
      this.policyModalElement.classList.remove('show');
      this.eventManager.setSpeed(1); // Resume play automatically
    });

    const slider = this.policyModalElement.querySelector('#tax-slider') as HTMLInputElement;
    slider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      const display = this.policyModalElement.querySelector('#tax-val-display');
      if (display) display.textContent = `${val}%`;
      PolicyManager.setTaxRate(val);
    });

    const greenToggle = this.policyModalElement.querySelector('#policy-green') as HTMLInputElement;
    greenToggle?.addEventListener('change', () => {
      PolicyManager.togglePolicy('greenEnergyMandate');
    });

    const subsidyToggle = this.policyModalElement.querySelector('#policy-subsidy') as HTMLInputElement;
    subsidyToggle?.addEventListener('change', () => {
      PolicyManager.togglePolicy('industrialSubsidies');
    });

    const transitToggle = this.policyModalElement.querySelector('#policy-transit') as HTMLInputElement;
    transitToggle?.addEventListener('change', () => {
      PolicyManager.togglePolicy('publicTransitFunding');
    });
  }

  private createEventModal(): void {
    this.eventModalElement = document.createElement('div');
    this.eventModalElement.className = 'modal';
    this.eventModalElement.innerHTML = `
      <div class="modal-content event-card">
        <div id="event-title" class="modal-header">Chemical Spill</div>
        <div id="event-desc" class="event-description">A major leak has been reported.</div>
        <div id="event-opts" class="event-options"></div>
      </div>
    `;
    document.body.appendChild(this.eventModalElement);
  }

  private createGameOverModal(): void {
    this.gameOverModalElement = document.createElement('div');
    this.gameOverModalElement.className = 'modal';
    this.gameOverModalElement.innerHTML = `
      <div class="modal-content" style="text-align: center;">
        <div class="modal-header" style="color: #4cd137;">Year-End Mayor Report Card</div>
        <div style="font-size: 14px; color: #a4b0be; margin-bottom: 10px;">CONGRATULATIONS ON COMPLETING A FULL 12-MONTH TERM!</div>
        <div id="final-grade" class="grade-banner">B+</div>
        <div class="report-card-grid">
          <div class="report-item">
            <div class="lbl">Final Money</div>
            <div id="rep-money" class="val" style="color: #4cd137;">$1,500</div>
          </div>
          <div class="report-item">
            <div class="lbl">Overall Approval</div>
            <div id="rep-approval" class="val" style="color: #00a8ff;">84%</div>
          </div>
          <div class="report-item">
            <div class="lbl">City Population</div>
            <div id="rep-pop" class="val" style="color: #eccc68;">150</div>
          </div>
          <div class="report-item">
            <div class="lbl">Citizen Happiness</div>
            <div id="rep-happy" class="val" style="color: #ff4757;">92%</div>
          </div>
        </div>
        <button id="btn-replay" class="action-btn" style="width: 100%; font-size: 16px; padding: 12px;">Start a New Campaign</button>
      </div>
    `;
    document.body.appendChild(this.gameOverModalElement);

    const replayBtn = this.gameOverModalElement.querySelector('#btn-replay');
    replayBtn?.addEventListener('click', () => {
      this.gameOverModalElement.classList.remove('show');
      GameState.reset();
      SaveManager.clearSave();
      EventBus.emit(EVENTS.SPECTACLE_ACTION, { action: 'replay' });
    });
  }

  private updateUI(): void {
    // 1. HUD Updates
    const curMonthName = MONTH_NAMES[GameState.month - 1];
    let speedText = '1x';
    if (GameState.gameSpeed === 0) speedText = 'PAUSED';
    else if (GameState.gameSpeed === 2) speedText = '2x';

    this.hudElement.innerHTML = `
      <div class="hud-stat-group">
        <div class="hud-stat">
          <span class="label">Treasury</span>
          <span class="value">$${GameState.money}</span>
        </div>
        <div class="hud-stat">
          <span class="label">Mayor Approval</span>
          <span class="value">${GameState.overallApproval}%</span>
        </div>
        <div class="hud-stat">
          <span class="label">Happiness</span>
          <span class="value">${GameState.happiness}%</span>
        </div>
        <div class="hud-stat">
          <span class="label">Utilities balance</span>
          <span class="value" style="color: ${GameState.utilitySupply >= GameState.utilityDemand ? '#4cd137' : '#ff4757'}">
            ${GameState.utilitySupply - GameState.utilityDemand}
          </span>
        </div>
        <div class="hud-stat">
          <span class="label">Pollution</span>
          <span class="value">${GameState.pollution}</span>
        </div>
      </div>
      <div class="timeline-container">
        <div style="font-size: 14px; font-weight: bold;">
          ${curMonthName} (Month ${GameState.month}/12)
        </div>
        <div class="time-controls">
          <button class="time-btn ${GameState.gameSpeed === 0 ? 'active' : ''}" data-speed="0">PAUSE</button>
          <button class="time-btn ${GameState.gameSpeed === 1 ? 'active' : ''}" data-speed="1">1x</button>
          <button class="time-btn ${GameState.gameSpeed === 2 ? 'active' : ''}" data-speed="2">2x</button>
        </div>
      </div>
    `;

    // Hook HUD time controls
    const timeBtns = this.hudElement.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseInt((e.target as HTMLButtonElement).dataset.speed || '1');
        this.eventManager.setSpeed(speed);
      });
    });

    // 2. Toolbar Updates
    let cardsHTML = '';
    for (const key in BUILDINGS) {
      const b = BUILDINGS[key];
      const activeClass = this.selectedAction === key ? 'active' : '';
      cardsHTML += `
        <div class="tool-card ${activeClass}" data-action="${key}">
          <span class="name">${b.displayName}</span>
          <span class="cost">$${b.cost}</span>
        </div>
      `;
    }

    this.toolbarElement.innerHTML = `
      <div class="tool-cards">
        ${cardsHTML}
      </div>
      <div class="aux-controls">
        <button class="action-btn danger ${this.selectedAction === 'demolish' ? 'active' : ''}" id="btn-demolish">Demolish</button>
        <button class="action-btn" id="btn-policy-panel">Policies</button>
        <button class="action-btn" id="btn-save-game">Save</button>
        <button class="action-btn danger" id="btn-clear-game">Reset</button>
      </div>
    `;

    // Attach toolbar listeners
    const cards = this.toolbarElement.querySelectorAll('.tool-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLDivElement;
        const act = target.dataset.action || null;
        this.selectedAction = this.selectedAction === act ? null : act;
        this.updateUI();
      });
    });

    const demolishBtn = this.toolbarElement.querySelector('#btn-demolish');
    demolishBtn?.addEventListener('click', () => {
      this.selectedAction = this.selectedAction === 'demolish' ? null : 'demolish';
      this.updateUI();
    });

    const policyBtn = this.toolbarElement.querySelector('#btn-policy-panel');
    policyBtn?.addEventListener('click', () => {
      this.eventManager.setSpeed(0); // Pause automatically
      this.updateUI();
      this.policyModalElement.classList.add('show');
    });

    const saveBtn = this.toolbarElement.querySelector('#btn-save-game');
    saveBtn?.addEventListener('click', () => {
      const saved = SaveManager.saveGame();
      if (saved) {
        alert('Game Saved Successfully to LocalStorage!');
      } else {
        alert('Failed to save game.');
      }
    });

    const clearBtn = this.toolbarElement.querySelector('#btn-clear-game');
    clearBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your city? All progress will be lost.')) {
        GameState.reset();
        SaveManager.clearSave();
        this.selectedAction = null;
        this.updateUI();
      }
    });

    // 3. Policy Modal elements
    const taxSlider = this.policyModalElement.querySelector('#tax-slider') as HTMLInputElement;
    if (taxSlider) {
      taxSlider.value = GameState.policies.taxRate.toString();
      const display = this.policyModalElement.querySelector('#tax-val-display');
      if (display) display.textContent = `${GameState.policies.taxRate}%`;
    }

    const greenToggle = this.policyModalElement.querySelector('#policy-green') as HTMLInputElement;
    if (greenToggle) greenToggle.checked = GameState.policies.greenEnergyMandate;

    const subsidyToggle = this.policyModalElement.querySelector('#policy-subsidy') as HTMLInputElement;
    if (subsidyToggle) subsidyToggle.checked = GameState.policies.industrialSubsidies;

    const transitToggle = this.policyModalElement.querySelector('#policy-transit') as HTMLInputElement;
    if (transitToggle) transitToggle.checked = GameState.policies.publicTransitFunding;

    // Faction levels update
    const setBar = (id: string, val: number) => {
      const fill = this.policyModalElement.querySelector(id) as HTMLDivElement;
      if (fill) {
        fill.style.width = `${val}%`;
        if (val < 30) fill.style.backgroundColor = '#ff4757';
        else if (val < 60) fill.style.backgroundColor = '#f1c40f';
        else fill.style.backgroundColor = '#2ed573';
      }
    };

    setBar('#fac-env', GameState.factionApproval.env);
    setBar('#fac-tycoon', GameState.factionApproval.tycoon);
    setBar('#fac-labor', GameState.factionApproval.labor);
    setBar('#fac-residents', GameState.factionApproval.residents);
  }

  private showEventModal(event: CityEvent): void {
    this.eventManager.setSpeed(0); // Pause game tick automatically
    this.updateUI();

    const titleDiv = this.eventModalElement.querySelector('#event-title') as HTMLDivElement;
    const descDiv = this.eventModalElement.querySelector('#event-desc') as HTMLDivElement;
    const optsDiv = this.eventModalElement.querySelector('#event-opts') as HTMLDivElement;

    if (titleDiv) titleDiv.textContent = event.title;
    if (descDiv) descDiv.textContent = event.description;

    if (optsDiv) {
      optsDiv.innerHTML = '';
      event.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'event-opt-btn';
        btn.innerHTML = `
          <div class="event-opt-title">${opt.text}</div>
          <div class="event-opt-effects">${opt.description}</div>
        `;
        btn.addEventListener('click', () => {
          this.eventModalElement.classList.remove('show');
          this.eventManager.resolveEventChoice(opt);
          this.eventManager.setSpeed(1); // Resume play automatically
        });
        optsDiv.appendChild(btn);
      });
    }

    this.eventModalElement.classList.add('show');
  }

  private showGameOverModal(): void {
    this.eventManager.setSpeed(0);
    this.updateUI();

    // Calculate Grade
    const score = GameState.overallApproval;
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B+';
    else if (score >= 60) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 40) grade = 'D';

    const gradeDiv = this.gameOverModalElement.querySelector('#final-grade');
    const moneyDiv = this.gameOverModalElement.querySelector('#rep-money');
    const approvalDiv = this.gameOverModalElement.querySelector('#rep-approval');
    const popDiv = this.gameOverModalElement.querySelector('#rep-pop');
    const happyDiv = this.gameOverModalElement.querySelector('#rep-happy');

    if (gradeDiv) gradeDiv.textContent = grade;
    if (moneyDiv) moneyDiv.textContent = `$${GameState.money}`;
    if (approvalDiv) approvalDiv.textContent = `${score}%`;
    if (popDiv) popDiv.textContent = GameState.population.toString();
    if (happyDiv) happyDiv.textContent = `${GameState.happiness}%`;

    this.gameOverModalElement.classList.add('show');
  }
}
