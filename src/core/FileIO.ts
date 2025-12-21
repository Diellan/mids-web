// Converted from C# FileIO.cs
export class FileIO {
  static AddSlash(iPath: string): string {
    return iPath.endsWith('\\') ? iPath : iPath + '\\';
  }

  static StripPath(iFileName: string): string {
    const lastIdx = iFileName.lastIndexOf('\\');
    return lastIdx <= -1 ? iFileName : iFileName.substring(lastIdx + 1);
  }

  static IOGrab(iStream: any): string[] {
    // Note: StreamReader would need to be replaced with Node.js streams or fetch API
    if (iStream === null) {
      return [];
    }

    // Note: Implementation would read line from stream
    const str = ''; // iStream.ReadLine()
    if (!str) {
      return [];
    }

    const strArray2 = str.split('\t');
    for (let index = 0; index < strArray2.length; index++) {
      strArray2[index] = this.IOStrip(strArray2[index]);
    }
    return strArray2;
  }

  static IOStrip(iString: string): string {
    let result = iString;
    if (iString.startsWith("'") || iString.startsWith(' ')) {
      result = iString.substring(1);
    }
    if (result.endsWith(' ')) {
      result = result.substring(0, result.length - 1);
    }
    return result.replace(/"/g, '');
  }

  static IOSeekReturn(istream: any, iString: string): string {
    try {
      let strArray: string[];
      do {
        strArray = this.IOGrab(istream);
      } while (strArray[0] !== iString);

      return strArray.length > 1 ? strArray[1] : '';
    } catch (ex) {
      // Note: MessageBox would need to be replaced with web-compatible error handling
      return '';
    }
  }

  static IOSeek(iStream: any, iString: string): boolean {
    try {
      do {
        // Read line
      } while (this.IOGrab(iStream)[0] !== iString);
      return true;
    } catch (ex) {
      // Note: MessageBox would need to be replaced with web-compatible error handling
      return false;
    }
  }

  // Note: FolderCopy method would need Node.js fs module or similar
}

