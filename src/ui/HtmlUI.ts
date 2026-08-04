import { GameState } from '../core/GameState';
import { EVENT_DATABASE, CityEvent, EVENTS, MONTH_NAMES } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { PolicyManager } from '../systems/PolicyManager';
import { SaveManager } from '../systems/SaveManager';
import { EventManager } from '../systems/EventManager';

export class HtmlUI {
  private eventManager: EventManager;

  // UI DOM References
  private hudElement!: HTMLDivElement;
  private policySidePanelElement!: HTMLDivElement;
  private eventModalElement!: HTMLDivElement;
  private gameOverModalElement!: HTMLDivElement;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.setupStyles();
    this.createHUD();
    this.createPolicySidePanel();
    this.createEventModal();
    this.createGameOverModal();

    // Listen to game state changes to update the UI
    EventBus.on(EVENTS.STATE_CHANGED, () => this.updateUI());
    EventBus.on(EVENTS.TRIGGER_MONTHLY_EVENT, (event: CityEvent) => this.showEventModal(event));
    EventBus.on(EVENTS.GAME_OVER, () => this.showGameOverModal());

    this.updateUI();
  }

  private setupStyles(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #f5f6fa;
        overflow-x: hidden;
        background: #1e272e;
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
        gap: 6px;
      }
      .action-btn {
        background: #3c6382;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
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
      .action-btn.success {
        background: #2ed573;
        color: #1e272e;
      }
      .action-btn.success:hover {
        background: #26af5f;
      }
      .policy-panel {
        position: fixed;
        top: 90px;
        left: 20px;
        width: 280px;
        background: rgba(30, 39, 46, 0.95);
        border: 2px solid #3c6382;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        z-index: 999;
      }
      .policy-panel-header {
        font-size: 16px;
        font-weight: bold;
        color: #00a8ff;
        border-bottom: 2px solid #3c6382;
        padding-bottom: 8px;
        margin-bottom: 12px;
        text-align: center;
      }
      .policy-group {
        margin-bottom: 15px;
      }
      .slider-container {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .aux-panel {
        position: fixed;
        bottom: 15px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
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

  private createPolicySidePanel(): void {
    this.policySidePanelElement = document.createElement('div');
    this.policySidePanelElement.className = 'policy-panel';
    this.policySidePanelElement.innerHTML = `
      <div class="policy-panel-header">Policy Council</div>
      <div class="policy-group slider-container">
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="font-weight: bold;">Income Tax Rate</span>
          <span id="tax-val-display" style="color: #4cd137; font-weight: bold;">10%</span>
        </div>
        <input type="range" id="tax-slider" min="0" max="100" step="10" value="10" style="width: 100%; cursor: pointer;">
      </div>
      <div class="policy-group slider-container">
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="font-weight: bold;">Green Energy Mandate</span>
          <span id="policy-green-val" style="color: #4cd137; font-weight: bold;">0%</span>
        </div>
        <div style="font-size: 10px; color: #a4b0be;">Pollution ↓ · Utilities ↑</div>
        <input type="range" id="policy-green" min="0" max="100" step="10" value="0" style="width: 100%; cursor: pointer;">
      </div>
      <div class="policy-group slider-container">
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="font-weight: bold;">Industrial Subsidies</span>
          <span id="policy-subsidy-val" style="color: #4cd137; font-weight: bold;">0%</span>
        </div>
        <div style="font-size: 10px; color: #a4b0be;">Jobs ↑ · Pollution ↑</div>
        <input type="range" id="policy-subsidy" min="0" max="100" step="10" value="0" style="width: 100%; cursor: pointer;">
      </div>
      <div class="policy-group slider-container">
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="font-weight: bold;">Public Transit Funding</span>
          <span id="policy-transit-val" style="color: #4cd137; font-weight: bold;">0%</span>
        </div>
        <div style="font-size: 10px; color: #a4b0be;">Pollution ↓</div>
        <input type="range" id="policy-transit" min="0" max="100" step="10" value="0" style="width: 100%; cursor: pointer;">
      </div>
    `;
    document.body.appendChild(this.policySidePanelElement);

    // Wire up policy side panel inputs
    const slider = this.policySidePanelElement.querySelector('#tax-slider') as HTMLInputElement;
    slider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      const display = this.policySidePanelElement.querySelector('#tax-val-display');
      if (display) display.textContent = `${val}%`;
      PolicyManager.setPolicyValue('taxRate', val);
    });

    const wireSlider = (id: string, valId: string, policyKey: 'greenEnergyMandate' | 'industrialSubsidies' | 'publicTransitFunding') => {
      const input = this.policySidePanelElement.querySelector(id) as HTMLInputElement;
      input?.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value);
        const display = this.policySidePanelElement.querySelector(valId);
        if (display) display.textContent = `${val}%`;
        PolicyManager.setPolicyValue(policyKey, val);
      });
    };

    wireSlider('#policy-green', '#policy-green-val', 'greenEnergyMandate');
    wireSlider('#policy-subsidy', '#policy-subsidy-val', 'industrialSubsidies');
    wireSlider('#policy-transit', '#policy-transit-val', 'publicTransitFunding');
  }

  private createEventModal(): void {
    this.eventModalElement = document.createElement('div');
    this.eventModalElement.className = 'modal';
    this.eventModalElement.innerHTML = `
      <div class="modal-content event-card">
        <div id="event-title" class="modal-header">Chemical Spill</div>
        <div id="event-stats-banner" style="display: flex; justify-content: space-around; background: #2f3640; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-size: 12px;">
          <div>💰 <span id="ev-money" style="font-weight: bold; color: #4cd137;">$500</span></div>
          <div>⭐ <span id="ev-approval" style="font-weight: bold; color: #00a8ff;">50%</span></div>
          <div>👥 <span id="ev-pop" style="font-weight: bold; color: #eccc68;">100</span></div>
          <div>☣ <span id="ev-pollution" style="font-weight: bold; color: #ff4757;">0</span></div>
        </div>
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
        <div style="font-size: 14px; color: #a4b0be; margin-bottom: 10px;">CAMPAIGN TERM COMPLETED (12 MONTHS)</div>
        <div id="final-grade" class="grade-banner">B+</div>
        <div class="report-card-grid">
          <div class="report-item">
            <div class="lbl">Final Treasury</div>
            <div id="rep-money" class="val" style="color: #4cd137;">$500</div>
          </div>
          <div class="report-item">
            <div class="lbl">Mayor Approval</div>
            <div id="rep-approval" class="val" style="color: #00a8ff;">50%</div>
          </div>
          <div class="report-item">
            <div class="lbl">City Population</div>
            <div id="rep-pop" class="val" style="color: #eccc68;">100</div>
          </div>
          <div class="report-item">
            <div class="lbl">Pollution Level</div>
            <div id="rep-pollution" class="val" style="color: #ff4757;">0</div>
          </div>
        </div>
        <button id="btn-replay" class="action-btn success" style="width: 100%; font-size: 16px; padding: 12px;">Start New Campaign</button>
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
    const curMonthName = MONTH_NAMES[GameState.month - 1];

    this.hudElement.innerHTML = `
      <div class="hud-stat-group">
        <div class="hud-stat">
          <span class="label">Treasury</span>
          <span class="value">$${GameState.money}</span>
        </div>
        <div class="hud-stat">
          <span class="label">Approval</span>
          <span class="value">${GameState.overallApproval}%</span>
        </div>
        <div class="hud-stat">
          <span class="label">Population</span>
          <span class="value">${GameState.population}</span>
        </div>
        <div class="hud-stat">
          <span class="label">Utilities</span>
          <span class="value" style="color: ${GameState.utilitiesBalance < 100 ? '#ff4757' : GameState.utilitiesBalance > 100 ? '#4cd137' : '#ffffff'}">
            ${GameState.utilitiesBalance}
          </span>
        </div>
        <div class="hud-stat">
          <span class="label">Pollution</span>
          <span class="value">${GameState.pollution}%</span>
        </div>
      </div>
      <div class="timeline-container">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">
          ${curMonthName} (Month ${GameState.month}/12)
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="action-btn success" id="btn-next-month">Advance Month</button>
          <button class="action-btn danger" id="btn-reset-game">Reset</button>
        </div>
      </div>
    `;

    // Hook Next Month & Reset buttons
    const nextBtn = this.hudElement.querySelector('#btn-next-month');
    nextBtn?.addEventListener('click', () => {
      this.eventManager.advanceMonth();
    });

    const resetBtn = this.hudElement.querySelector('#btn-reset-game');
    resetBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your city? All progress will be lost.')) {
        GameState.reset();
        SaveManager.clearSave();
      }
    });

    // Update Side Panel state
    const syncSlider = (id: string, valId: string, value: number) => {
      const input = this.policySidePanelElement.querySelector(id) as HTMLInputElement;
      if (input) input.value = value.toString();
      const display = this.policySidePanelElement.querySelector(valId);
      if (display) display.textContent = `${value}%`;
    };

    syncSlider('#tax-slider', '#tax-val-display', GameState.policies.taxRate);
    syncSlider('#policy-green', '#policy-green-val', GameState.policies.greenEnergyMandate);
    syncSlider('#policy-subsidy', '#policy-subsidy-val', GameState.policies.industrialSubsidies);
    syncSlider('#policy-transit', '#policy-transit-val', GameState.policies.publicTransitFunding);
  }

  private showEventModal(event: CityEvent): void {
    this.updateUI();

    const titleDiv = this.eventModalElement.querySelector('#event-title') as HTMLDivElement;
    const descDiv = this.eventModalElement.querySelector('#event-desc') as HTMLDivElement;
    const optsDiv = this.eventModalElement.querySelector('#event-opts') as HTMLDivElement;

    const moneySpan = this.eventModalElement.querySelector('#ev-money');
    const approvalSpan = this.eventModalElement.querySelector('#ev-approval');
    const popSpan = this.eventModalElement.querySelector('#ev-pop');
    const pollutionSpan = this.eventModalElement.querySelector('#ev-pollution');

    if (moneySpan) moneySpan.textContent = `$${GameState.money}`;
    if (approvalSpan) approvalSpan.textContent = `${GameState.overallApproval}%`;
    if (popSpan) popSpan.textContent = GameState.population.toString();
    if (pollutionSpan) pollutionSpan.textContent = `${GameState.pollution}%`;

    if (titleDiv) titleDiv.textContent = event.title;
    if (descDiv) descDiv.textContent = event.description;

    if (optsDiv) {
      optsDiv.innerHTML = '';
      event.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'event-opt-btn';
        btn.innerHTML = `
          <div class="event-opt-title">${opt.text}</div>
          <div class="event-opt-effects">${opt.description}</div>
        `;
        btn.addEventListener('click', () => {
          this.eventModalElement.classList.remove('show');
          this.eventManager.resolveEventChoice(opt);
        });
        optsDiv.appendChild(btn);
      });
    }

    this.eventModalElement.classList.add('show');
  }

  private showGameOverModal(): void {
    this.updateUI();

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
    const pollutionDiv = this.gameOverModalElement.querySelector('#rep-pollution');

    if (gradeDiv) gradeDiv.textContent = grade;
    if (moneyDiv) moneyDiv.textContent = `$${GameState.money}`;
    if (approvalDiv) approvalDiv.textContent = `${score}%`;
    if (popDiv) popDiv.textContent = GameState.population.toString();
    if (pollutionDiv) pollutionDiv.textContent = `${GameState.pollution}%`;

    this.gameOverModalElement.classList.add('show');
  }
}
