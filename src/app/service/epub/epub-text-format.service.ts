import { Injectable } from '@angular/core';
import { TextControlService } from '../data/text-control.service';
import { TextReplaceData } from 'src/app/interface/text-replace-data';

@Injectable({
  providedIn: 'root',
})
export class EpubTextFormatService extends TextControlService {
  constructor() {
    super();
  }

  cleanUpContent(originalString: string): string {
    originalString = this.removeAllButTheBody(originalString);
    originalString = this.replaceImgSrcToId(originalString);
    return originalString;
  }
  //Remove starting comment and Head
  removeAllButTheBody(originalString: string): string {
    return this.keepAllTextInBetween(originalString, '<body', '</body>');
  }
  //Formats the given text
  replaceAllTextBetween(
    originalString: string,
    options: TextReplaceData
  ): string {
    const { beginString, midString, replaceMidFor } = options;
    //Remove starting comment and Head
    originalString = this.removeAllButTheBody(originalString);
    //Remove all the text in the given options
    originalString = this.removeAllOptions(originalString, options);

    //Replace the <a></a> link html to Button
    originalString = this.replaceText(
      originalString,
      '<a ',
      '<button  type="button" id ="'
    );
    originalString = this.replaceText(originalString, '</a>', '</button>');
    //Check if it needs to Format text
    let index = originalString.indexOf(beginString);

    if (index != -1) {
      while (index != -1) {
        //Get Start Index for the starting string
        let startIndex = originalString.indexOf(options.beginString);
        if (startIndex == -1) {
          return originalString;
        }
        let middleIndex = originalString.indexOf(midString, startIndex);
        if (middleIndex == -1) {
          return originalString;
        }
        //Replace from start text to middle text
        let startToMidText = originalString.substring(
          startIndex,
          middleIndex + midString.length
        );
        originalString = this.replaceText(
          originalString,
          startToMidText,
          replaceMidFor
        );
        //Check if it should replace is finished
        index = originalString.indexOf('xhtml#');
      }
    } else {
      console.log('no replace');
    }
    return originalString;
  }

  replaceImgSrcToId(originalString: string): string {
    let imgPrefix = 'src=';
    let start = originalString.indexOf(imgPrefix);
    while (start != -1) {
      //Get next " that should be the end of the src
      let endOfSrc = originalString.indexOf('"', start + imgPrefix.length + 1);
      //Get the original full text
      let originalSrc = originalString.substring(start, endOfSrc + 1);

      let path = originalSrc.substring(5, originalSrc.length - 1);
      originalString = this.replaceText(
        originalString,
        originalSrc,
        `id="${path}"`
      );
      start = originalString.indexOf(imgPrefix);
    }

    return originalString;
  }
}
