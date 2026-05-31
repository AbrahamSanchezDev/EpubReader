import { Injectable, EventEmitter, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseDataService<T> {
  public onSelected: EventEmitter<T> = new EventEmitter<T>();
  public onSearch: EventEmitter<string> = new EventEmitter<string>();
  jsonPath = 'assets/';
  protected allData: T[] = [];
  protected customData: T[] = [];
  abstract fileNames: string[];
  protected http = inject(HttpClient);

  //Get the  Data from Json files
  getJsonData(): T[] {
    //Check it the files were already loaded if so return them
    if (this.allData != null && this.allData.length > 0) {
      return this.allData;
    }
    // Get all the files that are in the file names
    for (const fileName of this.fileNames) {
    this.http
      .get<T>(`${this.jsonPath}${fileName}.json`)
      .subscribe((data) => {
        data = this.initData(data);
        //Check if it should add to the start of the array wih unshift
        if (this.firstPlaceObj(data)) {
          this.allData.unshift(data);
        } else {
          this.allData.push(data);
        }
      });
  }
    return this.allData;
  }

  protected abstract firstPlaceObj(data: T): boolean;
  protected abstract initData(data: T): T;
  //Search for topics that match the given topic name
  getData(topicName: string): T[] {
    this.customData.length = 0;
    const searchText = topicName.split(',');
    for (const topic of this.allData) {
      for (const keyword of searchText) {
        if (this.matchTopic(topic, keyword)) {
          this.customData.push(topic);
          break;
        }
      }
    }
    return this.customData;
  }
  //Check if the topic match the keyword
  protected abstract matchTopic(topic: T, keyword: string): boolean;

  //Call the search event
  search(text: string): void {
    this.onSearch.emit(text);
  }
}
