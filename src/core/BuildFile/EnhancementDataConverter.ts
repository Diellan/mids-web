// Converted from C# EnhancementDataConverter.cs
// Note: JsonConverter is C# specific (Newtonsoft.Json).
// In TypeScript, custom serialization/deserialization can be handled using
// JSON.stringify/parse with replacer/reviver functions or a custom serializer.
import type { EnhancementData } from './DataModels/EnhancementData';
import { DatabaseAPI } from '../DatabaseAPI';

export class EnhancementDataConverter {
    static WriteJson(eData: EnhancementData | null): any {
        if (eData === null) return null;

        return {
            Uid: eData.Uid,
            Grade: eData.Grade,
            IoLevel: eData.IoLevel,
            RelativeLevel: eData.RelativeLevel,
            Obtained: eData.Obtained
        };
    }

    static ReadJson(jsonValue: any): EnhancementData | null {
        // Handle null JSON value, which signifies no data to load for this slot
        if (jsonValue === null || jsonValue === undefined) {
            return null; // Return null to indicate no enhancement data
        }

        const enhancementData: EnhancementData = {
            Uid: '',
            Grade: '',
            IoLevel: 0,
            RelativeLevel: '',
            Obtained: false
        };

        if (jsonValue.Uid !== undefined) {
            enhancementData.Uid = jsonValue.Uid;
        } else if (jsonValue.Enhancement !== undefined) {
            enhancementData.Uid = DatabaseAPI.GetEnhancementUid(jsonValue.Enhancement);
        }

        if (jsonValue.Grade !== undefined) {
            enhancementData.Grade = jsonValue.Grade;
        }

        if (jsonValue.IoLevel !== undefined) {
            enhancementData.IoLevel = jsonValue.IoLevel;
        }

        if (jsonValue.RelativeLevel !== undefined) {
            enhancementData.RelativeLevel = jsonValue.RelativeLevel;
        }

        if (jsonValue.Obtained !== undefined) {
            enhancementData.Obtained = jsonValue.Obtained;
        }

        return enhancementData;
    }

    static CanConvert(objectType: any): boolean {
        return objectType === Object; // In TypeScript, we can check if it's an object type
    }
}

