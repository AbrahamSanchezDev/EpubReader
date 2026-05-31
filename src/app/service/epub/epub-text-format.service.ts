import { Injectable } from '@angular/core';
import { TextReplaceData } from '../../../app/interface/text-replace-data';
import { ReplaceStrings } from '@worldsdev/tools';
import { HtmlTextTool } from '@worldsdev/tools';

const titleTag = '<title>';
const titleTagEnd = '</title>';
const bodyTag = '<body>';
const bodyTagEnd = '</body>';
const displayRemoveOptions = [
  { replaceFor: '', original: 'display: inline', originalEnd: 'block;' },
  { replaceFor: '', original: 'style="', originalEnd: '"' },
  { replaceFor: '<p>', original: '<p ', originalEnd: '>' },
];
const wrapTo: ReplaceStrings[] = [
  //Wrap H1s
  { replaceFor: '<h1 class="text-obj">', original: '<h1>' },
  { replaceFor: '<h2 class="text-obj">', original: '<h2>' },
  { replaceFor: '<p class="text-obj">', original: '<p>' },
  // { replaceFor: '<strong class="text-obj">', original: '<strong>' },
  { replaceFor: '<a class="text-obj" href=', original: '<a href=' },
];
// const optionsTo: RemoveReplaceOptions = {
//   removeFromTo: [
//     { replaceFor: '', original: 'display: inline', originalEnd: 'block;' },
//     { replaceFor: '', original: 'style="', originalEnd: '"' },
//   ],
//   replaceText: [],
// };
@Injectable({
  providedIn: 'root',
})
export class EpubTextFormatService extends HtmlTextTool {
  constructor() {
    super();
  }
  cleanUpContent(originalString: string, name: string): string {
    originalString = this.removeAllButTheBody(originalString);
    originalString = this.insertIdToBody(originalString, name);
    originalString = this.replaceImgSrcToId(originalString);
    originalString = this.removeNonDynamicDisplays(originalString);
    originalString = this.wrapOtherTextIn(originalString);
    return originalString;
  }
  //Gets the title of the object
  getTitleName(originalString: string): string {
    return this.getTextBetween(originalString, titleTag, titleTagEnd);
  }
  //Remove starting comment and Head
  removeAllButTheBody(originalString: string): string {
    return this.keepAllTextInBetween(originalString, bodyTag, bodyTagEnd);
  }
  //Insert id to the body
  insertIdToBody(originalString: string, id: string): string {
    if (!originalString.includes(bodyTag)) {
      const start = originalString.indexOf('<body');
      const end = originalString.indexOf('>', start);
      const original = originalString.substring(start, end + 1);
      originalString = this.replaceText(originalString, original, bodyTag);
    }

    originalString = this.insertAfter(originalString, bodyTag, `<div id="${id}">`);
    originalString = this.insertBefore(originalString, bodyTagEnd, '</div>');

    return originalString;
  }
  //Remove all none dynamic values from the text
  removeNonDynamicDisplays(originalString: string): string {
    return this.removeFromToOptions(originalString, displayRemoveOptions);
  }
  // set text elements to have the class to be detected as readable
  wrapOtherTextIn(originalString: string) {
    originalString = this.replaceTextOptions(originalString, wrapTo);
    return originalString;
  }
  //Formats the given text to be a readable content
  replaceAllTextBetween(originalString: string, options: TextReplaceData): string {
    //Remove starting comment and Head
    originalString = this.removeAllButTheBody(originalString);
    //Remove all the text in the given options
    originalString = this.removeAllOptions(originalString, options);
    //Remove all the tags
    originalString = this.removeAllTags(originalString, options.removeAllTags || []);

    //Remove any xhtml pointer
    originalString = this.removeXhtml(originalString, options);
    return originalString;
  }
  //Remove any xhtml pointer
  removeXhtml(originalString: string, options: TextReplaceData): string {
    const { beginString, midString, replaceMidFor } = options;
    //Remove the middle text
    if (originalString.indexOf(midString) != -1) {
      //Check if it needs to Format text
      while (originalString.indexOf(beginString) != -1) {
        //Get Start Index for the starting string
        const startIndex = originalString.indexOf(options.beginString);
        const middleIndex = originalString.indexOf(midString, startIndex);
        //Replace from start text to middle text
        const startToMidText = originalString.substring(startIndex, middleIndex + midString.length);
        //Replace the original string to the replaceMidFor
        originalString = this.replaceText(originalString, startToMidText, replaceMidFor);
      }
    }
    return originalString;
  }
  //Returns the file name from index
  getFileNameFromIndex(originalString: string): string {
    //Remove starting comment and Head
    originalString = this.removeAllButTheBody(originalString);
    const textFrom = this.getTextBetween(originalString, '<a', '</a>');
    if (textFrom) {
      const endText = '</a>';
      const firstLink = originalString.indexOf('<a');
      const firstLinkEnd = originalString.indexOf(endText);
      const fullText = originalString.substring(firstLink, firstLinkEnd + endText.length);
      return this.getTextBetween(fullText, '>', '<');
    }
    return '';
  }
  //Replace the img src to be a class and have an id
  replaceImgSrcToId(originalString: string): string {
    const imgPrefix = 'src=';
    const ending = '"';
    return this.replaceTextTo(originalString, imgPrefix, ending, (text: string) => {
      return `class = "content-img" id="${text}"`;
    });
  }
  //Replace the text to the given text
  replaceTextTo(
    originalString: string,
    firstText: string,
    secondText: string,
    formattedText: (text: string) => string,
  ) {
    let start = originalString.indexOf(firstText);
    while (start != -1) {
      //Get next " that should be the end of the src
      const endOfSrc = originalString.indexOf(secondText, start + firstText.length + 1);
      //Get the original full text
      const originalSrc = originalString.substring(start, endOfSrc + 1);

      const path = originalSrc.substring(5, originalSrc.length - 1);
      originalString = this.replaceText(originalString, originalSrc, formattedText(path));
      start = originalString.indexOf(firstText);
    }
    return originalString;
  }
}
