import { Injectable } from '@angular/core';
import { ReplaceStrings } from 'src/app/service/tool/remove-replace-option/interface/replace-strings';
import { RemoveReplaceOptions } from 'src/app/service/tool/remove-replace-option/interface/remove-replace-options';
import { TextToolService } from '../text-tool/text-tool.service';

@Injectable({
  providedIn: 'root',
})
export class RemoveReplaceOptionService extends TextToolService {
  constructor() {
    super();
  }
  //Remove all the text given by the options
  removeAllOptions(
    originalString: string,
    options: RemoveReplaceOptions
  ): string {
    const { removeFromTo, replaceText } = options;

    originalString = this.removeFromToOptions(originalString, removeFromTo);

    originalString = this.replaceTextOptions(originalString, replaceText);

    return originalString;
  }
  //Replace a list of text that match the original for something else
  replaceTextOptions(
    originalString: string,
    replaceText: ReplaceStrings[]
  ): string {
    let counter = 0;
    for (let i = 0; i < replaceText.length; i++) {
      counter = 0;
      while (originalString.indexOf(replaceText[i].original) != -1) {
        originalString = this.replaceText(
          originalString,
          replaceText[i].original,
          replaceText[i].replaceFor
        );
        counter++;
        if (counter > 50) {
          console.log('Search maxed out');
          return originalString;
        }
      }
    }
    return originalString;
  }
  //Replace the text that is from start to end for some other text
  removeFromToOptions(
    originalString: string,
    removeFromTo: ReplaceStrings[]
  ): string {
    let counter = 0;
    for (let i = 0; i < removeFromTo.length; i++) {
      counter = 0;
      while (originalString.includes(removeFromTo[i].original)) {
        originalString = this.removeTextFromTo(
          originalString,
          removeFromTo[i].replaceFor,
          removeFromTo[i].original,
          removeFromTo[i].originalEnd
        );
        counter++;
        if (counter > 100) {
          console.log('Infinite loop detected for ' + removeFromTo[i].original);
          break;
        }
      }
    }
    return originalString;
  }
}
