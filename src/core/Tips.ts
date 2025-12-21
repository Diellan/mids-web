// Converted from C# Tips.cs
import { MidsContext } from './Base/Master_Classes/MidsContext';

export enum TipType {
  TotalsTab,
  FirstPower,
  FirstSlot,
  FirstEnhancement,
  PowerToggle,
  ProcToggle
}

export class Tips {
  private _tipShown: Map<TipType, boolean> | null = null;

  get TipShown(): Map<TipType, boolean> | null {
    return this._tipShown;
  }

  set TipShown(value: Map<TipType, boolean> | null) {
    this._tipShown = value ?? this.InitializeTipStatus();
  }

  constructor() {
    this._tipShown = this.InitializeTipStatus();
  }

  private InitializeTipStatus(): Map<TipType, boolean> {
    const status = new Map<TipType, boolean>();
    for (const tip of Object.values(TipType)) {
      if (typeof tip === 'number') {
        status.set(tip, false);
      }
    }
    return status;
  }

  Show(tip: TipType): void {
    if (this._tipShown === null || !this._tipShown.has(tip) || this._tipShown.get(tip)) {
      return;
    }

    if (MidsContext.Config?.DisableTips === true) {
      return;
    }

    const message = this.GetTipMessage(tip);
    this._tipShown.set(tip, true);

    // Note: MessageBoxEx would need to be replaced with web-compatible dialog
    // alert(`${message}\n\nThis message should not appear again.\n`);
  }

  private GetTipMessage(tip: TipType): string {
    const lines: string[] = [];
    switch (tip) {
      case TipType.TotalsTab:
        lines.push(
          'While viewing the Totals tab, the powers which are being included are lit up.',
          "Clicking a power will toggle it on or off. Dimmed powers can't be toggled as they have no effect on your totals."
        );
        break;
      case TipType.FirstPower:
        lines.push(
          'If you decide you want to remove a power and replace it with a different one, click on the power name in the power lists',
          'that appear on the left of the screen, or Alt+Click on the power bar. Then the next power you select will be placed into the empty space.'
        );
        break;
      case TipType.FirstSlot:
        lines.push(
          'To put an enhancement into a slot, Right-Click on it.',
          'To pick up a slot to move it somewhere else, Double-Click it.',
          'Alternatively, Shift+Clicking enhancement slots will allow you to pick up several slots one after the other before placing them again.',
          'You can set the level an Invention enhancement is placed at by keying the number into the enhancement picker before clicking on the enhancement.'
        );
        break;
      case TipType.FirstEnhancement:
        lines.push(
          'To quickly add the next enhancement from a set into a slot,',
          'using your mouse Middle-Click on the next slot. This will automatically add the next enhancement from that set'
        );
        break;
    }
    return lines.join('\n');
  }
}

