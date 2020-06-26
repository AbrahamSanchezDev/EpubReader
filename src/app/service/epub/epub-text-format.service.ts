import { Injectable } from '@angular/core';

import { TextReplaceData } from 'src/app/interface/text-replace-data';
import { RemoveReplaceOptionService } from '../tool/remove-replace-option/remove-replace-option.service';
import { HtmlTextToolService } from '../tool/html-tool/html-text-tool.service';
import { RemoveReplaceOptions } from '../tool/remove-replace-option/interface/remove-replace-options';

const titleTag = '<title>';
const titleTagEnd = '</title>';
const bodyTag = '<body>';
const bodyTagEnd = '</body>';
const displayRemoveOptions = [
  { replaceFor: '', original: 'display: inline', originalEnd: 'block;' },
  { replaceFor: '', original: 'style="', originalEnd: '"' },
];
const optionsTo: RemoveReplaceOptions = {
  removeFromTo: [
    { replaceFor: '', original: 'display: inline', originalEnd: 'block;' },
    { replaceFor: '', original: 'style="', originalEnd: '"' },
  ],
  replaceText: [],
};
@Injectable({
  providedIn: 'root',
})
export class EpubTextFormatService extends HtmlTextToolService {
  constructor() {
    super();
  }
  cleanUpContent(originalString: string, name: string): string {
    originalString = this.removeAllButTheBody(originalString);
    originalString = this.insertIdToBody(originalString, name);
    originalString = this.replaceImgSrcToId(originalString);
    originalString = this.removeNonDynamicDisplays(originalString);

    return originalString;
  }
  //Gets the title of the object
  getTitleName(originalString: string) {
    return this.getTextBetween(originalString, titleTag, titleTagEnd);
  }
  //Remove starting comment and Head
  removeAllButTheBody(originalString: string): string {
    return this.keepAllTextInBetween(originalString, bodyTag, bodyTagEnd);
  }
  //Insert id to the body
  insertIdToBody(originalString: string, id: string): string {
    if (!originalString.includes(bodyTag)) {
      let start = originalString.indexOf('<body');
      let end = originalString.indexOf('>', start);
      let original = originalString.substring(start, end + 1);
      originalString = this.replaceText(originalString, original, bodyTag);
    }

    originalString = this.insertAfter(
      originalString,
      bodyTag,
      `<div id="${id}">`
    );
    originalString = this.insertBefore(originalString, bodyTagEnd, '</div>');

    return originalString;
  }
  //Remove all none dynamic values from the text
  removeNonDynamicDisplays(originalString: string): string {
    return this.removeFromToOptions(originalString, displayRemoveOptions);
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
    //Remove all the tags
    originalString = this.removeAllTags(originalString, options.removeAllTags);

    //Remove the middle text
    if (originalString.indexOf('xhtml#') != -1) {
      //Check if it needs to Format text
      while (originalString.indexOf(beginString) != -1) {
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
        //Replace the original string to the replaceMidFor
        originalString = this.replaceText(
          originalString,
          startToMidText,
          replaceMidFor
        );
      }
    } else {
      console.log('no replace');
    }
    return originalString;
  }

  getFileNameFromIndex(
    originalString: string,
    options: TextReplaceData
  ): string {
    //Remove starting comment and Head
    originalString = this.removeAllButTheBody(originalString);
    let textFrom = this.getTextBetween(originalString, '<a', '</a>');
    if (textFrom) {
      if (!textFrom.includes(options.midString)) {
        let endText = '</a>';
        let firstLink = originalString.indexOf('<a');
        let firstLinkEnd = originalString.indexOf(endText);
        let fullText = originalString.substring(
          firstLink,
          firstLinkEnd + endText.length
        );
        return this.getTextBetween(fullText, '>', '<');
      }
    }
    return '';
  }
  replaceImgSrcToId(originalString: string): string {
    let imgPrefix = 'src=';
    let ending = '"';
    return this.replaceTextTo(originalString, imgPrefix, ending, (text) => {
      return `class = "content-img" id="${text}"`;
    });
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
