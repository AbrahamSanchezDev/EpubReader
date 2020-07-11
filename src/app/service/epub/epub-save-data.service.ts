import { Injectable, HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EpubSaveDataService {
  constructor() {
    console.log('Loaded');
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    console.log('Closed');
  }
  //Load the book data if there was any
  loadDataFor(fileName: string): void {}
  //Save the file data to the browser cache
  saveDataFor(fileName: string): void {}
}
