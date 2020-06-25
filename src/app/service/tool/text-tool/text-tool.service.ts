import { Injectable, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToolService {
  removedTotal = 0;

  constructor() {}

  //#region  Replace selected

  //Replace the text at the given index for the other text
  replaceTextAt(
    originalText: string,
    element: ElementRef<any>,
    textToReplace: string,
    originalReplace: string = ''
  ): string {
    //Get the starting position
    let index = element.nativeElement.selectionStart;
    //Extra inf in case you changed something
    if (originalReplace == '') {
      originalReplace = textToReplace;
    }
    //The Text to return
    var finalText = `${originalText.substr(
      0,
      index
    )}${textToReplace}${originalText.substr(index + originalReplace.length)}`;
    return finalText;
  }
  //Replace the first matching text for a new one
  replaceText(
    originalString: string,
    textToRemove: string,
    newText: string
  ): string {
    // The general pattern is = text.split(search).join(replacement)
    return originalString.split(textToRemove).join(newText);
  }
  //#endregion

  //#region Insert

  //Insert text at the given element in it last selected position
  insertText(originalText: String, textToAdd: string, element: ElementRef) {
    if (originalText == null) {
      return textToAdd;
    }
    //Get the last selected position
    let startPos = element.nativeElement.selectionStart;

    return `${originalText.substring(
      0,
      startPos
    )}${textToAdd}${originalText.substring(startPos, originalText.length)}`;
  }

  //Insert text after finding the given text
  insertAfter(
    originalText: string,
    insertAfter: string,
    textToAdd: string
  ): string {
    let index = originalText.indexOf(insertAfter);
    let finalPart = originalText.substr(
      index + insertAfter.length,
      originalText.length
    );
    if (index >= 0) {
      originalText =
        originalText.substr(0, index + insertAfter.length) +
        textToAdd +
        finalPart;
    }
    return originalText;
  }
  //Insert text after finding the given text
  insertBefore(
    originalText: string,
    insertBefore: string,
    textToAdd: string
  ): string {
    let index = originalText.indexOf(insertBefore);

    if (index >= 0) {
      let firstPart = originalText.substr(0, index);
      let finalPart = originalText.substr(index, originalText.length - index);
      originalText = firstPart + textToAdd + finalPart;
    }
    return originalText;
  }
  //#endregion

  //#region Getters

  //Get the text between the given start and the end
  getTextBetween(
    originalString: string,
    beginString: string,
    endString: string
  ): string {
    var beginIndex = originalString.indexOf(beginString);
    if (beginIndex === -1) {
      return null;
    }
    var beginStringLength = beginString.length;
    var substringBeginIndex = beginIndex + beginStringLength;
    var substringEndIndex = originalString.indexOf(
      endString,
      substringBeginIndex
    );
    if (substringEndIndex === -1) {
      return null;
    }
    return originalString.substring(substringBeginIndex, substringEndIndex);
  }

  //#endregion

  //#region Removes

  //Remove everything but the text between the given start and end text together with the start and end text
  keepAllTextInBetween(
    originalString: string,
    startText: string,
    endText: string
  ): string {
    let start = originalString.indexOf(startText);
    let end = originalString.indexOf(endText);

    if (start != -1 && end != -1) {
      return originalString.substring(start, end + endText.length);
    }
    return originalString;
  }
  //Remove all the text that has the same start and the end and the start and end as well
  //example <div  class = "something"> start= '<div' end= '">' it will remove everything 'class = "something' included
  removeAllTextFromTo(
    originalString: string,
    start: string,
    end: string
  ): string {
    this.removedTotal = 0;
    while (originalString.indexOf(start) != -1) {
      originalString = this.removeTextFromTo(originalString, '', start, end);
    }
    if (this.removedTotal == 0) {
      console.log("Didn't remove any " + start + ' and ' + end);
    }
    return originalString;
  }
  //Replace all the text from with in start and end for the given text
  removeTextFromTo(
    originalString: string,
    replaceFor: string,
    start: string,
    end: string,
    startLookingAt?: number
  ): string {
    if (startLookingAt == null) {
      startLookingAt = 0;
    }
    let startIndex = originalString.indexOf(start, startLookingAt);
    if (startIndex == -1) {
      return originalString;
    }
    let endIndex = originalString.indexOf(end, startIndex);
    if (endIndex == -1) {
      return originalString;
    }
    let original = originalString.substring(startIndex, endIndex + end.length);
    originalString = this.replaceText(originalString, original, replaceFor);
    this.removedTotal++;
    return originalString;
  }
  //#endregion
}
