// Converted from C# BooleanExprPreprocessor.cs
import type { IEffect } from './IEffect';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { DatabaseAPI } from './DatabaseAPI';
import { ConfigData } from './ConfigData';
import { evaluate } from 'mathjs';

export class BooleanExprPreprocessor {
  private static GetConditions(effect: IEffect): string[] {
    const ret: string[] = [];
    if (!effect.ActiveConditionals || effect.ActiveConditionals.length === 0) {
      return ret;
    }

    for (let i = 0; i < effect.ActiveConditionals.length; i++) {
      const prefix = i > 0 && effect.ActiveConditionals[i].Key.startsWith('OR ') ? 'OR ' : '';
      const value = effect.ValidateConditional(i) ? '1' : '0';
      ret.push(`${prefix}${value}`);
    }

    return ret;
  }

  private static BuildGlobalExpression(expressions: string[]): string {
    return expressions
      .map(expr => expr.trim())
      .reduce((current, s) => {
        if (current === '') {
          return s.startsWith('OR ') ? s.replace('OR ', '') : s;
        }
        return s.startsWith('OR ') ? `${current} ${s}` : `${current} AND ${s}`;
      }, '');
  }

  private static GetConfigValue(cond: string, stringFormat: boolean = true): string | number {
    const chunks = cond.toLowerCase().split('.');
    if (chunks.length !== 3) {
      return stringFormat ? '0' : 0;
    }

    // Use ConfigData.CombatContext static methods
    const { CombatContext } = require('./ConfigData');
    const groupName = CombatContext.GetConfigChunkName(chunks[1]);
    if (!groupName) {
      return stringFormat ? '0' : 0;
    }

    const group = (MidsContext.Config?.CombatContextSettings as any)?.[groupName];
    if (!group) {
      return stringFormat ? '0' : 0;
    }

    const propertyName = CombatContext.GetConfigChunkName(chunks[2]);
    if (!propertyName) {
      return stringFormat ? '0' : 0;
    }

    const value = (group as any)?.[propertyName];
    const condType = CombatContext.ConfigChunkType(chunks[2]);

    if (stringFormat) {
      if (condType === 'bool') {
        return (value as boolean) ?? true ? '1' : '0';
      } else {
        return `${(value as number) ?? 100}`;
      }
    } else {
      if (condType === 'bool') {
        return ((value as boolean) ?? true) ? 1 : 0;
      } else {
        return (value as number) ?? 100;
      }
    }
  }

  private static BuildGlobalExpressionWithType(effect: IEffect, cType: string, cPowerName: string): string {
    if (!effect.ActiveConditionals || effect.ActiveConditionals.length === 0) {
      return '0';
    }

    const getCondition = /(:.*)/;
    const getConditionItem = /(.*:)/;
    const conditionResults: boolean[] = [];
    const conditionTypes: string[] = [];

    for (const cVp of effect.ActiveConditionals) {
      conditionTypes.push(cVp.Key.includes('OR ') ? 'OR' : 'AND');

      let k = cVp.Key.replace('AND ', '').replace('OR ', '');
      const condition = k.replace(getCondition, '');
      const conditionItemName = k.replace(getConditionItem, '').replace(':', '');
      const conditionPower = condition === 'Config' ? null : DatabaseAPI.GetPowerByFullName(conditionItemName);
      const configValueInt = this.GetConfigValue(condition === 'Config' ? conditionItemName : '', false) as number;
      const cVal = cVp.Value.split(' ');
      const powerDisplayName = conditionPower?.DisplayName;

      if (condition !== 'Config') {
        if (!powerDisplayName || !powerDisplayName.includes(cPowerName)) {
          return '0';
        }
      }

      if (cType.toLowerCase() === condition.toLowerCase() && condition === 'Active') {
        const boolVal = cVp.Value.toLowerCase() === 'true';
        conditionResults.push((MidsContext.Character?.CurrentBuild?.PowerActive(conditionPower as any) ?? false) === boolVal);
      } else if (cType.toLowerCase() === condition.toLowerCase() && condition === 'Taken') {
        conditionResults.push((MidsContext.Character?.CurrentBuild?.PowerUsed(conditionPower as any) ?? false) === (cVp.Value.toLowerCase() === 'true'));
      } else if (cType.toLowerCase() === condition.toLowerCase() && condition === 'Stacks') {
        const stackValue = parseInt(cVal[1] || '0', 10);
        const stacks = conditionPower?.Stacks ?? 0;
        conditionResults.push(
          cVal[0] === '=' ? stacks === stackValue :
          cVal[0] === '>' ? stacks > stackValue :
          cVal[0] === '<' ? stacks < stackValue :
          true
        );
      } else if (cType.toLowerCase() === condition.toLowerCase() && condition === 'Team') {
        const teamValue = parseInt(cVal[1] || '0', 10);
        const teamCount = MidsContext.Config?.TeamMembers?.get(conditionItemName) ?? 0;
        conditionResults.push(
          cVal[0] === '=' ? teamCount === teamValue :
          cVal[0] === '>' ? teamCount > teamValue :
          cVal[0] === '<' ? teamCount < teamValue :
          true
        );
      } else if (cType.toLowerCase() === condition.toLowerCase() && condition === 'Config') {
        if (conditionItemName.toLowerCase() === 'cfg.player.isalive') {
          const isAlive = MidsContext.Config?.CombatContextSettings?.PlayerSettings?.IsAlive ?? true;
          conditionResults.push(cVal[1] === 'True' ? isAlive : !isAlive);
        } else {
          conditionResults.push(
            cVal[0] === '=' ? configValueInt === parseInt(cVal[1] || '0', 10) :
            cVal[0] === '>' ? configValueInt > parseInt(cVal[1] || '0', 10) :
            cVal[0] === '<' ? configValueInt < parseInt(cVal[1] || '0', 10) :
            true
          );
        }
      } else {
        conditionResults.push(true);
      }
    }

    let expr = '';
    for (let i = 0; i < conditionResults.length; i++) {
      expr += i === 0
        ? (conditionResults[i] ? '1' : '0')
        : ` ${conditionTypes[i]} ${conditionResults[i] ? '1' : '0'}`;
    }

    return expr;
  }

  private static BuildGlobalExpressionWithPower(effect: IEffect, cPowerName: string): string {
    if (!effect.ActiveConditionals || effect.ActiveConditionals.length === 0) {
      return '0';
    }

    const getCondition = /(:.*)/;
    const getConditionItem = /(.*:)/;
    const conditionResults: boolean[] = [];
    const conditionTypes: string[] = [];

    for (const cVp of effect.ActiveConditionals) {
      conditionTypes.push(cVp.Key.includes('OR ') ? 'OR' : 'AND');

      let k = cVp.Key.replace('AND ', '').replace('OR ', '');
      const condition = k.replace(getCondition, '');
      const conditionItemName = k.replace(getConditionItem, '').replace(':', '');
      const conditionPower = condition === 'Config' ? null : DatabaseAPI.GetPowerByFullName(conditionItemName);
      const configValueInt = this.GetConfigValue(condition === 'Config' ? conditionItemName : '', false) as number;
      const buildPowers = MidsContext.Character?.CurrentBuild?.Powers ?? [];
      const cVal = cVp.Value.split(' ');
      const powerDisplayName = conditionPower?.DisplayName;

      if (condition !== 'Config') {
        if (!powerDisplayName || !powerDisplayName.includes(cPowerName)) {
          return '0';
        }
      }

      switch (condition) {
        case 'Active': {
          const boolVal = cVp.Value.toLowerCase() === 'true';
          conditionResults.push((MidsContext.Character?.CurrentBuild?.PowerActive(conditionPower as any) ?? false) === boolVal);
          break;
        }
        case 'Taken': {
          conditionResults.push((MidsContext.Character?.CurrentBuild?.PowerUsed(conditionPower as any) ?? false) === (cVp.Value.toLowerCase() === 'true'));
          break;
        }
        case 'Stacks': {
          const stacks = buildPowers
            .filter(x => x && x.Power === conditionPower)
            .map(x => x.Power?.Stacks ?? 0);
          const stackValue = stacks.length > 0 ? stacks[0] : 0;
          const targetValue = parseInt(cVal[1] || '0', 10);
          conditionResults.push(
            cVal[0] === '=' ? stackValue === targetValue :
            cVal[0] === '>' ? stackValue > targetValue :
            cVal[0] === '<' ? stackValue < targetValue :
            true
          );
          break;
        }
        case 'Team': {
          const teamValue = parseInt(cVal[1] || '0', 10);
          const teamCount = MidsContext.Config?.TeamMembers?.get(conditionItemName) ?? 0;
          conditionResults.push(
            cVal[0] === '=' ? teamCount === teamValue :
            cVal[0] === '>' ? teamCount > teamValue :
            cVal[0] === '<' ? teamCount < teamValue :
            true
          );
          break;
        }
        case 'Config': {
          if (conditionItemName.toLowerCase() === 'cfg.player.isalive') {
            const isAlive = MidsContext.Config?.CombatContextSettings?.PlayerSettings?.IsAlive ?? true;
            conditionResults.push(cVal[1] === 'True' ? isAlive : !isAlive);
          } else {
            conditionResults.push(
              cVal[0] === '=' ? configValueInt === parseInt(cVal[1] || '0', 10) :
              cVal[0] === '>' ? configValueInt > parseInt(cVal[1] || '0', 10) :
              cVal[0] === '<' ? configValueInt < parseInt(cVal[1] || '0', 10) :
              true
            );
          }
          break;
        }
        default:
          conditionResults.push(true);
          break;
      }
    }

    let expr = '';
    for (let i = 0; i < conditionResults.length; i++) {
      expr += i === 0
        ? (conditionResults[i] ? '1' : '0')
        : ` ${conditionTypes[i]} ${conditionResults[i] ? '1' : '0'}`;
    }

    return expr;
  }

  private static Tokenize(expr: string): string[] {
    return expr.split(/ (AND|OR) /);
  }

  private static Merge(exprTokens: string[], op: string): string[] {
    // Work on a local copy
    let mergedTokens = [...exprTokens];
    let m = true;
    let n = 0;
    let l = mergedTokens.length;

    while (m && n++ < 30) {
      let lastPos = -1;
      const tokensPos = new Map<number, number[]>(); // Position of tokens, positions of members

      for (let i = 0; i < mergedTokens.length; i++) {
        if (mergedTokens[i] !== op) {
          continue;
        }

        if (lastPos === -1 || i - lastPos > 1) {
          lastPos = i;
          tokensPos.set(i, [i - 1, i + 1]);
        }
      }

      // No more matching operators
      if (tokensPos.size <= 0) {
        return mergedTokens;
      }

      // Process only first operator found
      const firstEntry = tokensPos.entries().next().value;
      if (!firstEntry) {
        return mergedTokens;
      }
      const t = { key: firstEntry[0], value: firstEntry[1] };

      if (t.value[0] < mergedTokens.length && t.value[1] < mergedTokens.length) {
        mergedTokens[t.key] = `${op}(${mergedTokens[t.value[0]]}, ${mergedTokens[t.value[1]]})`;

        // Remove values from t.value
        mergedTokens = mergedTokens
          .map((e, i) => ({ index: i, value: e }))
          .filter(e => !t.value.includes(e.index))
          .map(e => e.value);

        m = l !== mergedTokens.length;
        l = mergedTokens.length;
      } else {
        m = false;
      }
    }

    return mergedTokens;
  }

  private static BuildFromEffect(effect: IEffect): string {
    const conditionals = this.GetConditions(effect);
    const expr = this.BuildGlobalExpression(conditionals);
    let tokens = this.Tokenize(expr);

    tokens = this.Merge(tokens, 'AND');
    tokens = this.Merge(tokens, 'OR');

    return tokens.join(' ');
  }

  private static BuildFromExpression(expr: string): string {
    let tokens = this.Tokenize(expr);
    tokens = this.Merge(tokens, 'AND');
    tokens = this.Merge(tokens, 'OR');

    return tokens.join(' ');
  }

  static PreprocessConditionals(effect: IEffect): string {
    const conditions = this.GetConditions(effect);
    return this.BuildGlobalExpression(conditions);
  }

  private static EvaluateExpression(prefixExpr: string, effect: IEffect): boolean {
    // Note: C# uses Jace CalculationEngine, we'll use Function() as a fallback
    // In production, should use a proper math parser library
    if (!prefixExpr || prefixExpr.trim() === '') {
      return true;
    }

    try {
      // Replace AND and OR with function calls
      let processedExpr = prefixExpr
        .replace(/AND\(([^,]+),\s*([^)]+)\)/g, (_, a, b) => `(${a} > 0 and ${b} > 0) ? 1 : 0`)
        .replace(/OR\(([^,]+),\s*([^)]+)\)/g, (_, a, b) => `(${a} > 0 or ${b} > 0) ? 1 : 0`);

      const result = evaluate(processedExpr);
      return typeof result === 'number' ? result > 0 : false;
    } catch (ex: any) {
      console.warn(`Conditional check failed in ${prefixExpr}\nPower: ${effect.GetPower()?.FullName}\n${ex.message}`);
      return false;
    }
  }

  static Parse(effect: IEffect, cTypeOrPowerName?: string, cPowerName?: string): boolean {
    // Handle overload: Parse(effect)
    if (cTypeOrPowerName === undefined) {
      const prefixExpr = this.BuildFromEffect(effect);
      return this.EvaluateExpression(prefixExpr, effect);
    }

    // Handle overload: Parse(effect, cType, cPowerName)
    if (cPowerName !== undefined) {
      if (!effect.ActiveConditionals || effect.ActiveConditionals.length === 0) {
        return false;
      }
      const expr = this.BuildGlobalExpressionWithType(effect, cTypeOrPowerName, cPowerName);
      const prefixExpr = this.BuildFromExpression(expr);
      return this.EvaluateExpression(prefixExpr, effect);
    }

    // Handle overload: Parse(effect, cPowerName)
    if (!effect.ActiveConditionals || effect.ActiveConditionals.length === 0) {
      return false;
    }
    const expr = this.BuildGlobalExpressionWithPower(effect, cTypeOrPowerName);
    const prefixExpr = this.BuildFromExpression(expr);
    return this.EvaluateExpression(prefixExpr, effect);
  }
}

