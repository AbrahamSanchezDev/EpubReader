import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DownloadToolService {
  a = document.createElement('a');
  constructor(private http: HttpClient) {}

  //This creates a json file with the given data
  DownloadTextToFileAsJson(theText: any, fileName: string): void {
    if (theText == null) {
      console.log('No Data');
      return;
    }
    var blob = new Blob([JSON.stringify(theText, null, 2)], {
      type: 'application/json',
    });
    var url = window.URL.createObjectURL(blob);
    this.a.href = url;
    this.a.download = fileName + '.json';
    this.a.click();
    window.URL.revokeObjectURL(url);
  }
}
