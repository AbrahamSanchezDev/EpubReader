import { Injectable } from '@angular/core';
import { TextReplaceData } from 'src/app/interface/text-replace-data';

@Injectable({
  providedIn: 'root',
})
export class TextControlService {
  constructor() {}
  //Remove all the text given by the options
  removeAllOptions(originalString: string, options: TextReplaceData): string {
    const { removeFromTo, replaceText, removeAllTags } = options;
    if (removeFromTo) {
      for (let i = 0; i < removeFromTo.length; i++) {
        originalString = this.removeFromTo(
          originalString,
          removeFromTo[i].replaceFor,
          removeFromTo[i].original,
          removeFromTo[i].originalEnd
        );
      }
    }
    if (replaceText) {
      for (let i = 0; i < replaceText.length; i++) {
        originalString = this.replaceText(
          originalString,
          replaceText[i].original,
          replaceText[i].replaceFor
        );
      }
    }
    if (removeAllTags) {
      for (let i = 0; i < removeAllTags.length; i++) {
        originalString = this.removeAllTags(originalString, removeAllTags[i]);
      }
    }
    return originalString;
  }
  removedTotal = 0;
  //Remove all the given tag
  removeAllTags(originalString: string, tag: string): string {
    this.removedTotal = 0;
    while (originalString.indexOf(`<${tag}`) != -1) {
      originalString = this.removeFromTo(originalString, '', `<${tag}`, '>');
      originalString = this.removeFromTo(originalString, '', `</${tag}`, '>');
    }
    if (this.removedTotal == 0) {
      console.log("Didn't remove any " + tag + 'tag');
    }
    return originalString;
  }
  //Replace all the text from with in
  removeFromTo(
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
