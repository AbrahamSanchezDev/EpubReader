import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaveDataInLocalStorageService<T> {
  constructor() {}

  //Load the book data if there was any
  loadDataFor(fileName: string): T {
    const dataObj = localStorage.getItem(fileName);
    if (dataObj == null) {
      return null;
    }
    return JSON.parse(dataObj) as T;
  }
  //Save the file data to the browser cache
  saveDataFor(fileName: string, object: T): void {
    localStorage.setItem(fileName, JSON.stringify(object));
  }
  //Save the file data to the browser cache
  deleteDataFor(fileName: string): void {
    localStorage.removeItem(fileName);
  }
}
