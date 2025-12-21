// Converted from C# Expressions.cs
import { MidsContext } from './Base/Master_Classes/MidsContext';

export enum ExpressionType {
  Duration,
  Magnitude,
  Probability
}

export enum ExprKeywordType {
  Keyword,
  Function
}

export enum ExprCommandToken {
  None,
  Numeric,
  ExpressionNumeric,
  Modifier,
  AttackVector,
  PowerName,
  PowerGroup,
  PowerGroupPrefix,
  ArchetypeName
}

export enum ExprKeywordInfix {
  Atomic,
  Prefix,
  Suffix
}

export interface ErrorData {
  Type: ExpressionType;
  Found: boolean;
  Message: string;
}

export interface ExprCommand {
  Keyword: string;
  KeywordType: ExprKeywordType;
  InfixMode: ExprKeywordInfix;
  CommandTokenType: ExprCommandToken;
  SingleToken: boolean;
}

export class Expressions {
  Duration: string = '';
  Magnitude: string = '';
  Probability: string = '';

  static readonly CommandsList: ExprCommand[] = [
    {
      Keyword: 'power.base>activateperiod',
      KeywordType: ExprKeywordType.Keyword,
      InfixMode: ExprKeywordInfix.Atomic,
      CommandTokenType: ExprCommandToken.None,
      SingleToken: true
    },
    {
      Keyword: 'power.base>activatetime',
      KeywordType: ExprKeywordType.Keyword,
      InfixMode: ExprKeywordInfix.Atomic,
      CommandTokenType: ExprCommandToken.None,
      SingleToken: true
    }
    // Note: More commands would be added here
  ];

  static Parse(sourceFx: import('./Base/Data_Classes/Effect').Effect, exprType: ExpressionType, error: { value: ErrorData }): number {
    error.value = { Type: exprType, Found: false, Message: '' };
    let retValue: number;

    switch (exprType) {
      case ExpressionType.Duration:
        retValue = this.InternalParsing(sourceFx, exprType, error);
        break;

      case ExpressionType.Probability:
        retValue = this.InternalParsing(sourceFx, exprType, error);
        break;

      case ExpressionType.Magnitude:
        // Special case for a specific magnitude expression pattern
        const specialPattern = '.8 rechargetime power.base> 1 30 minmax * 1.8 + 2 * @StdResult * 10 / areafactor power.base> /';
        if (sourceFx.Expressions.Magnitude.toLowerCase().indexOf(specialPattern.toLowerCase()) > -1) {
          const power = sourceFx.GetPower();
          if (power) {
            retValue = (Math.max(Math.min(power.RechargeTime, 30), 0) * 0.8 + 1.8) / 5.0 / power.AoEModifier * sourceFx.Scale;
            if (sourceFx.Expressions.Magnitude.length > specialPattern.length + 2) {
              const multiplier = parseFloat(sourceFx.Expressions.Magnitude.substring(specialPattern.length + 1, specialPattern.length + 3));
              if (!isNaN(multiplier)) {
                retValue *= multiplier;
              }
            }
            return retValue;
          }
        }

        if (!sourceFx.Expressions.Magnitude || sourceFx.Expressions.Magnitude.trim() === '') {
          return 0;
        }

        const baseFx = sourceFx.Clone() as import('./Base/Data_Classes/Effect').Effect;
        retValue = this.InternalParsing(baseFx, exprType, error);
        break;

      default:
        throw new Error(`Invalid ExpressionType: ${exprType}`);
    }

    return error.value.Found ? 0 : retValue;
  }

  private static InternalParsing(sourceFx: import('./Base/Data_Classes/Effect').Effect, exprType: ExpressionType, error: { value: ErrorData }): number {
    
    const pickedPowerNames: (string | null)[] = MidsContext.Character?.CurrentBuild?.Powers
      ?.map((pe: any) => pe?.Power?.FullName) ?? [];

    error.value = { Type: exprType, Found: false, Message: '' };
    
    const expr = exprType === ExpressionType.Duration
      ? sourceFx.Expressions.Duration
      : exprType === ExpressionType.Magnitude
        ? sourceFx.Expressions.Magnitude
        : sourceFx.Expressions.Probability;

    if (!expr || expr.trim() === '') {
      return 0;
    }

    // Note: Full implementation would use a math engine (like NCalc or similar)
    // For now, we'll do basic parsing for simple numeric expressions
    try {
      // Replace common command patterns
      let processedExpr = expr;
      const power = sourceFx.GetPower();
      
      // Replace power.base>activateperiod
      if (power) {
        processedExpr = processedExpr.replace(/power\.base>activateperiod/gi, power.ActivatePeriod.toString());
        processedExpr = processedExpr.replace(/power\.base>activatetime/gi, power.CastTime.toString());
        processedExpr = processedExpr.replace(/power\.base>rechargetime/gi, power.RechargeTime.toString());
        processedExpr = processedExpr.replace(/power\.base>range/gi, power.Range.toString());
        processedExpr = processedExpr.replace(/power\.base>radius/gi, power.Radius.toString());
        processedExpr = processedExpr.replace(/power\.base>arc/gi, power.Arc.toString());
        processedExpr = processedExpr.replace(/power\.base>maxtargets/gi, power.MaxTargets.toString());
        processedExpr = processedExpr.replace(/areafactor power\.base>/gi, power.AoEModifier.toString());
      }

      // Replace @StdResult with scale
      processedExpr = processedExpr.replace(/@StdResult/gi, sourceFx.Scale.toString());

      // For complex expressions, we'd need a proper math engine
      // For now, try to evaluate simple numeric expressions
      if (/^[\d+\-*/().\s]+$/.test(processedExpr)) {
        // Simple numeric expression - use eval as fallback (not ideal, but works for basic cases)
        // In production, should use a proper math parser
        const result = Function(`"use strict"; return (${processedExpr})`)();
        return typeof result === 'number' ? result : 0;
      }

      // If expression contains functions or complex logic, return 0 with error
      error.value = {
        Type: exprType,
        Found: true,
        Message: 'Complex expression parsing not yet fully implemented. Math engine required.'
      };
      return 0;
    } catch (ex: any) {
      error.value = {
        Type: exprType,
        Found: true,
        Message: ex.message || 'Expression parsing failed'
      };
      return 0;
    }
  }
}

