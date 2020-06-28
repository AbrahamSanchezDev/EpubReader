import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadToolService {
  linkElement = document.createElement('a');
  constructor() {}

  //This creates a json file with the given data
  DownloadTextToFileAsJson(theText: any, fileName: string): void {
    if (theText == null) {
      console.log('No Data');
      return;
    } else if (fileName == null) {
      console.log('No fileName');
      return;
    }
    var blob = new Blob([JSON.stringify(theText, null, 2)], {
      type: 'application/json',
    });
    var url = window.URL.createObjectURL(blob);
    this.linkElement.href = url;
    this.linkElement.download = fileName + '.json';
    this.linkElement.click();
    window.URL.revokeObjectURL(url);
  }
}
