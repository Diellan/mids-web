// Converted from C# StructAndEnums.cs
export interface CompressionResult {
  readonly OutString: string;
  readonly UncompressedSize: number;
  readonly CompressedSize: number;
  readonly EncodedSize: number;
}

export interface TypeGrade {
  Index: number;
  Name: string;
  ShortName: string;
  Description: string;
}

export interface FileData {
  FileName: string;
  Data: Uint8Array; // byte[]
  Path: string;
}

export interface DatabaseItems {
  Name: string;
  Path: string | null;
}

export enum PatchType {
  Application,
  Database,
  Bootstrapper
}

export enum NavItemState {
  Active = 0,
  Disabled = 1,
  Inactive = 2
}

export enum NavLayout {
  Horizontal = 0,
  Vertical = 1
}

export enum ThemeFilter {
  Any,
  Light,
  Dark
}

export enum ExportFormatType {
  None,
  BbCode,
  MarkdownHtml,
  Markdown,
  Html
}

