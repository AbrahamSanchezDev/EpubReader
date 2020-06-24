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

  index = 0;
  cleanUpContent(originalString: string, name: string): string {
    originalString = this.removeAllButTheBody(originalString);
    originalString = this.replaceImgSrcToId(originalString);
    originalString = this.removeNonDynamicDisplays(originalString);

    originalString = this.insertAfter(
      originalString,
      '<body>',
      `<div id="${name}"></div>`
    );
    return originalString;
  }
  //Gets the title of the object
  getTitleName(originalString: string) {
    const index = originalString.indexOf('<title>');
    return index >= 0
      ? this.getTextBetween(originalString, '<title>', '</title>')
      : null;
  }
  //Remove starting comment and Head
  removeAllButTheBody(originalString: string): string {
    return this.keepAllTextInBetween(originalString, '<body', '</body>');
  }
  removeNonDynamicDisplays(originalString: string): string {
    let options = [
      { replaceFor: '', original: 'display: inline', originalEnd: 'block;' },
      { replaceFor: '', original: 'height:', originalEnd: ';' },
    ];

    originalString = this.removeReplaceStrings(originalString, options);
    return originalString;
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
    let ending = '"';

    // let start = originalString.indexOf(imgPrefix);
    // while (start != -1) {
    //   //Get next " that should be the end of the src
    //   let endOfSrc = originalString.indexOf(
    //     ending,
    //     start + imgPrefix.length + 1
    //   );
    //   //Get the original full text
    //   let originalSrc = originalString.substring(start, endOfSrc + 1);

    //   let path = originalSrc.substring(5, originalSrc.length - 1);
    //   originalString = this.replaceText(
    //     originalString,
    //     originalSrc,
    //     `class = "content-img" id="${path}"`
    //   );
    //   start = originalString.indexOf(imgPrefix);
    // }

    return this.replaceTextTo(originalString, imgPrefix, ending, (text) => {
      return `class = "content-img" id="${text}"`;
    });

    return originalString;
  }
  replaceTextTo(
    originalString: string,
    firstText: string,
    secondText: string,
    formattedText: Function
  ) {
    let imgPrefix = firstText;
    let start = originalString.indexOf(imgPrefix);
    while (start != -1) {
      //Get next " that should be the end of the src
      let endOfSrc = originalString.indexOf(
        secondText,
        start + imgPrefix.length + 1
      );
      //Get the original full text
      let originalSrc = originalString.substring(start, endOfSrc + 1);

      let path = originalSrc.substring(5, originalSrc.length - 1);
      originalString = this.replaceText(
        originalString,
        originalSrc,
        formattedText(path)
      );
      start = originalString.indexOf(imgPrefix);
    }

    return originalString;
  }
}
