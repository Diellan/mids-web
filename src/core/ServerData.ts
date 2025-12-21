import { BinaryReader } from "csharp-binary-stream";
import { AppDataPaths } from "./AppDataPaths";

// Converted from C# ServerData.cs
export class ServerData {
  private static _instance: ServerData | null = null;

  private static GetInstance(): ServerData {
    if (ServerData._instance !== null) {
      return ServerData._instance;
    }
    // Note: TypeScript doesn't have synchronized/lock - using simple check
    if (ServerData._instance === null) {
      ServerData._instance = new ServerData();
    }
    return ServerData._instance;
  }

  static get Instance(): ServerData {
    return ServerData.GetInstance();
  }

  ManifestUri: string = 'https://updates.midsreborn.com/update_manifest.json';
  BaseToHit: number = 0.75;
  BaseFlySpeed: number = 31.5;
  BaseJumpSpeed: number = 21;
  BaseJumpHeight: number = 4;
  BasePerception: number = 500;
  BaseRunSpeed: number = 21;
  MaxFlySpeed: number = 86;
  MaxJumpSpeed: number = 114.4;
  MaxJumpHeight: number = 50 * 4; // 50 * BaseJumpHeight
  MaxRunSpeed: number = 135.67;
  MaxMaxFlySpeed: number = 8.19 * 31.5; // 8.19 * BaseFlySpeed
  MaxMaxJumpSpeed: number = 7.917 * 21; // 7.917 * BaseJumpSpeed
  MaxMaxRunSpeed: number = 8.398 * 21; // 8.398 * BaseRunSpeed
  MaxSlots: number = 67;
  EnableInherentSlotting: boolean = false;
  HealthSlots: number = 2;
  HealthSlot1Level: number = 8;
  HealthSlot2Level: number = 16;
  StaminaSlots: number = 2;
  StaminaSlot1Level: number = 12;
  StaminaSlot2Level: number = 22;
  EnabledIncarnates: Map<string, boolean> = new Map([
    ['Alpha', true],
    ['Destiny', true],
    ['Genesis', false],
    ['Hybrid', true],
    ['Interface', true],
    ['Judgement', true],
    ['Lore', true],
    ['Omega', false],
    ['Stance', false],
    ['Vitae', false]
  ]);

  constructor() {
    // Properties initialized above
  }

  static Save(path: string): void {
    // Note: Would need JSON serialization
    // File.WriteAllText(path, JSON.stringify(ServerData._instance, null, 2));
  }

  static async Load(path: string): Promise<boolean> {
    console.log('Loading server data from:', path);
    try {      
      const fileContent = await fetch(`${path}/SData.json`);
      if (!fileContent.ok) {
        console.log('Failed to load server data from JSON, trying MHD');
        return this.LoadFromMhd(path);
      }
      console.log('Loaded server data from JSON');
      const data = await fileContent.json();
      const instance = ServerData.Instance;
      
      // Assign all properties from JSON
      instance.ManifestUri = data.ManifestUri ?? instance.ManifestUri;
      instance.BaseToHit = data.BaseToHit ?? instance.BaseToHit;
      instance.BaseFlySpeed = data.BaseFlySpeed ?? instance.BaseFlySpeed;
      instance.BaseJumpSpeed = data.BaseJumpSpeed ?? instance.BaseJumpSpeed;
      instance.BaseJumpHeight = data.BaseJumpHeight ?? instance.BaseJumpHeight;
      instance.BasePerception = data.BasePerception ?? instance.BasePerception;
      instance.BaseRunSpeed = data.BaseRunSpeed ?? instance.BaseRunSpeed;
      instance.MaxFlySpeed = data.MaxFlySpeed ?? instance.MaxFlySpeed;
      instance.MaxJumpSpeed = data.MaxJumpSpeed ?? instance.MaxJumpSpeed;
      instance.MaxJumpHeight = data.MaxJumpHeight ?? instance.MaxJumpHeight;
      instance.MaxRunSpeed = data.MaxRunSpeed ?? instance.MaxRunSpeed;
      instance.MaxMaxFlySpeed = data.MaxMaxFlySpeed ?? instance.MaxMaxFlySpeed;
      instance.MaxMaxJumpSpeed = data.MaxMaxJumpSpeed ?? instance.MaxMaxJumpSpeed;
      instance.MaxMaxRunSpeed = data.MaxMaxRunSpeed ?? instance.MaxMaxRunSpeed;
      instance.MaxSlots = data.MaxSlots ?? instance.MaxSlots;
      instance.EnableInherentSlotting = data.EnableInherentSlotting ?? instance.EnableInherentSlotting;
      instance.HealthSlots = data.HealthSlots ?? instance.HealthSlots;
      instance.HealthSlot1Level = data.HealthSlot1Level ?? instance.HealthSlot1Level;
      instance.HealthSlot2Level = data.HealthSlot2Level ?? instance.HealthSlot2Level;
      instance.StaminaSlots = data.StaminaSlots ?? instance.StaminaSlots;
      instance.StaminaSlot1Level = data.StaminaSlot1Level ?? instance.StaminaSlot1Level;
      instance.StaminaSlot2Level = data.StaminaSlot2Level ?? instance.StaminaSlot2Level;
      
      // Convert EnabledIncarnates object to Map if needed
      if (data.EnabledIncarnates) {
        if (data.EnabledIncarnates instanceof Map) {
          instance.EnabledIncarnates = data.EnabledIncarnates;
        } else {
          instance.EnabledIncarnates = new Map(Object.entries(data.EnabledIncarnates));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error loading server data from JSON:', error);
      return this.LoadFromMhd(path);
    }
  }

  private static async LoadFromMhd(path: string): Promise<boolean> {
    console.log('Loading server data from MHD');
    try {
      const fileContent = await fetch(`${path}/SData.mhd`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
      if (!fileContent.ok) {
        console.log('Failed to load server data from MHD');
        return false;
      }
      console.log('Loaded server data from MHD');
      const instance = ServerData.Instance;
      const data = await fileContent.arrayBuffer();
      const buffer = new Uint8Array(data);
      const reader = new BinaryReader(buffer);
      var headerFound = true;
      var header = reader.readString();
      if (header != AppDataPaths.Headers.ServerData.Start)
      {
          headerFound = false;
      }

      if (!headerFound)
      {
          console.error("Expected MRB header, got something else!");
          return false;
      }

      instance.ManifestUri = reader.readString();
      instance.MaxSlots = reader.readInt();
      instance.BaseFlySpeed = reader.readFloat();
      instance.BaseJumpHeight = reader.readFloat();
      instance.BaseJumpSpeed = reader.readFloat();
      instance.BasePerception = reader.readFloat();
      instance.BaseRunSpeed = reader.readFloat();
      instance.BaseToHit = reader.readFloat();
      instance.MaxFlySpeed = reader.readFloat();
      instance.MaxJumpSpeed = reader.readFloat();
      instance.MaxRunSpeed = reader.readFloat();
      instance.EnableInherentSlotting = reader.readBoolean();
      instance.HealthSlots = reader.readInt();
      instance.HealthSlot1Level = reader.readInt();
      instance.HealthSlot2Level = reader.readInt();
      instance.StaminaSlots = reader.readInt();
      instance.StaminaSlot1Level = reader.readInt();
      instance.StaminaSlot2Level = reader.readInt();
    } catch (error) {
      console.error('Error loading server data from MHD:', error);
      return false;
    }
    console.log('Loaded server data from MHD');
    return true;
  }
}


