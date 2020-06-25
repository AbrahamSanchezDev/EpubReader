import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ArraysToolService {
  constructor() {}
  //Move element
  moveElementInArray(array: any[], element: any, newPos: number): void {
    var index = array.indexOf(element);
    // Item non-existent?
    if (index == -1) {
      return;
    }
    if (index >= array.length) {
      return;
    }
    // If there is a previous element in sections
    if (array[newPos]) {
      // Swap elements
      if (newPos < index) {
        array.splice(newPos, 2, array[index], array[newPos]);
      } else {
        array.splice(index, 2, array[newPos], array[index]);
      }
    } else {
      console.log('Do Nothing');
    }
  }
  //Move element at the given index to the left
  moveElementAtIndexLeft(array: any[], index: number) {
    this.moveElementInArray(array, array[index], index - 1);
  }
  //Move element at the given index to the right
  moveElementAtIndexRight(array: any[], index: number) {
    this.moveElementInArray(array, array[index], index + 1);
  }
  //Move to the left (example: if it was at 1 the it will move to the 0)
  moveElementLeft(array: any[], element: any): void {
    let curIndex = array.indexOf(element);
    let newPos = curIndex - 1;
    this.moveElementInArray(array, element, newPos);
  }
  //Move to the right (example: if it was at 1 the it will move to the 2)
  moveElementRight(array: any[], element: any): void {
    let curIndex = array.indexOf(element);
    let newPos = curIndex + 1;
    this.moveElementInArray(array, element, newPos);
  }

  //Remove the element from the array
  removeFromArray(array: any[], element: any): any[] {
    return array.filter((currentElement) => currentElement !== element);
  }
}
