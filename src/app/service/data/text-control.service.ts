import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextControlService {
  constructor() {}
  replaceAllTextBetween(
    originalString: string,
    beginString: string,
    endString: string,
    replaceStart: string,
    replaceEndFor: string
  ): string {
    beginString = 'href=';
    endString = '"';
    replaceStart = ' ';
    replaceEndFor = ' >';

    let index = originalString.indexOf(beginString);
    if (index != -1) {
      while (index != -1) {
        let startIndex = originalString.indexOf(beginString);
        if (startIndex == -1) {
          return originalString;
        }
        let middleIndex = originalString.indexOf('h.');
        if (middleIndex == -1) {
          return originalString;
        }
        let endIndex = originalString.indexOf(endString, middleIndex);
        if (endIndex == -1) {
          return originalString;
        }

        let midText = originalString.substring(startIndex - 1, middleIndex);
        originalString = this.replaceText(
          originalString,
          midText,
          replaceStart
        );

        originalString = this.replaceText(
          originalString,
          '<nav epub:type="toc" id="toc">',
          '<div class= "menu" >'
        );
        originalString = this.replaceText(originalString, '</nav>', ' </div>');

        originalString = this.replaceText(
          originalString,
          '<li id="front">',
          ' '
        );

        originalString = this.replaceText(originalString, '">', replaceEndFor);

        originalString = this.replaceText(
          originalString,
          '<a ',
          '<button  type="button" id ="'
        );
        originalString = this.replaceText(originalString, '</a>', '</button>');
        originalString = this.replaceText(originalString, '<ol>', ' ');
        originalString = this.replaceText(originalString, '</ol>', ' ');

        originalString = this.replaceText(originalString, '<li>', ' ');
        originalString = this.replaceText(originalString, '<li>', ' ');
        originalString = this.replaceText(originalString, '</li>', ' ');

        index = originalString.indexOf('xhtml#');
      }
    } else {
      console.log('no replace');
    }

    return originalString;
  }
  //Get the text between the given start and the end
  parseBetween(
    beginString: string,
    endString: string,
    originalString: string
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
  //Replace the text for a new one
  replaceText(text: string, original: string, newText: string): string {
    // The general pattern is = text.split(search).join(replacement)
    var newText = text.split(original).join(newText);
    return newText;
  }
}
