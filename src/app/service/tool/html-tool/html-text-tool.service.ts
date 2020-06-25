import { Injectable, ElementRef } from '@angular/core';
import { ReplaceStrings } from 'src/app/service/tool/remove-replace-option/interface/replace-strings';
import { RemoveReplaceOptionService } from '../remove-replace-option/remove-replace-option.service';

const videoReplace: ReplaceStrings[] = [
  {
    original: '[video]',
    replaceFor: `    
<iframe width="560" height="315" 
frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; 
picture-in-picture" allowfullscreen
src="`,
  },
  {
    original: '[/video]',
    replaceFor: '"></iframe>',
  },
];
const imgReplace: ReplaceStrings[] = [
  {
    original: '<img src=',
    replaceFor: `<img class="imgObj" src=`,
  },
];
const lessThan = '&lt';
const graterThan = '&gt';
const commentsAndComponentsReplace: ReplaceStrings[] = [
  {
    original: '<app-',
    replaceFor: `${lessThan}app-`,
  },
  {
    original: '></',
    replaceFor: `${graterThan}${lessThan}/`,
  },
  {
    //Remove Comments
    original: '<!',
    replaceFor: `${lessThan}!`,
  },
  {
    original: '->',
    replaceFor: `-${graterThan}`,
  },
  {
    original: '<br />',
    replaceFor: `${lessThan}br /${graterThan}`,
  },
];

const tagContainerReplace: ReplaceStrings[] = [
  {
    original: '<',
    replaceFor: `${lessThan}`,
  },
  {
    original: '>',
    replaceFor: `${graterThan}`,
  },
];
const codeTagStart = '[code]';
const codeTagEnd = '[/code]';
const codeFormateadStart =
  '<div class="code-obj"><pre class="prettyprint linenums codeContainer">';
const codeFormateadEnd = '</pre></div>';

@Injectable({
  providedIn: 'root',
})
export class HtmlTextToolService extends RemoveReplaceOptionService {
  constructor() {
    super();
  }

  //#region Format Text For Display

  //Does full formatting on the text
  formatAllText(originalString: string): string {
    if (originalString == null) {
      console.log('Null originalString');
      return originalString;
    }
    //Img
    originalString = this.formatTextToImg(originalString);
    //Remove any lesser than and greater than
    originalString = this.formatCommentsAndComponents(originalString);
    //Code
    originalString = this.formatTextToCode(originalString);
    originalString = this.formatTextToVideo(originalString);
    return originalString;
  }
  //Format the text if has [code] and [/code] and set them to have a code display layout
  formatTextToCode(originalString: string): string {
    if (originalString == null) {
      console.log('Null originalString');
      return originalString;
    }
    let counter = 0;
    while (originalString.indexOf(codeTagStart) != -1) {
      let startIndex = originalString.indexOf(codeTagStart);
      let endIndex = originalString.indexOf(codeTagEnd);
      let originalInnerText = this.getTextBetween(
        originalString,
        codeTagStart,
        codeTagEnd
      );
      let formateadText = originalInnerText;
      formateadText = this.formatAnyTagContainer(formateadText);

      let before = originalString.substring(0, startIndex);
      let after = originalString.substring(endIndex + codeTagEnd.length);

      originalString = `${before}${codeFormateadStart}${formateadText}${codeFormateadEnd}${after}`;
      counter++;
      if (counter > 50) {
        console.log('Max searches');
        break;
      }
    }
    return originalString;
  }
  //Format the text if has < , > so they can be displayed as text
  formatAnyTagContainer(originalString: string): string {
    return this.replaceTextOptions(originalString, tagContainerReplace);
  }
  //Format the text if has an app or component so they can be displayed as text
  formatCommentsAndComponents(originalString: string): string {
    return this.replaceTextOptions(
      originalString,
      commentsAndComponentsReplace
    );
  }
  //Format the text if has img and set them to have the img class
  formatTextToImg(originalString: string): string {
    return this.replaceTextOptions(originalString, imgReplace);
  }
  //Format the text if has [video][/video] and set them to iframe
  formatTextToVideo(originalString: string): string {
    return this.replaceTextOptions(originalString, videoReplace);
  }

  //#endregion

  //#region Code tag
  //set the given text to have the code tags
  setToCode(
    text: string,
    textToReplace: string,
    element: ElementRef<any>
  ): string {
    let newCodeText = this.getTextAsCode(textToReplace);
    return this.replaceTextAt(text, element, newCodeText, textToReplace);
  }

  //Turns the given text to the correct format for code
  getTextAsCode(textToReplace: string): string {
    return `
[code]

${textToReplace}

[/code]
`;
  }
  //#endregion

  //#region  Replace selected
  //Replace the selected text to be an img
  replaceSelectedToImg(
    text: string,
    linkText: string,
    element: ElementRef<any>
  ): string {
    let noSpaces = linkText.replace(/\s/g, '');
    let theNewText = `<img src="${noSpaces}" alt = "Image not found"/>`;
    return this.replaceTextAt(text, element, theNewText, linkText);
  }
  //Replace select text to be a link
  replaceSelectedToLink(
    originalText: string,
    linkText: string,
    element: ElementRef<any>
  ): string {
    var newText = `<a href="${linkText}" target= "_blank">Link</a>`;
    if (originalText == null) {
      return newText;
    }
    return this.replaceTextAt(originalText, element, newText, linkText);
  }
  //#endregion

  //#region Insert
  //Insert link to the given element at the last selected position
  insertLink(
    originalText: string,
    link: string,
    display: string,
    element: ElementRef<any>
  ): string {
    var theNewText = `<a href = "${link}" target= "_blank">${display}</a>`;
    return this.insertText(originalText, theNewText, element);
  }
  //Insert img to the given element at the last selected position
  InsertImg(
    originalText: string,
    link: string,
    altText: string,
    element: ElementRef<any>
  ) {
    let replaceFor = `<img src="${link}" alt = "${altText}"/>`;
    return this.insertText(originalText, replaceFor, element);
  }
  //#endregion

  //#region Remove
  //Remove all the given tags
  removeAllTags(originalString: string, tags: string[]): string {
    this.removedTotal = 0;
    for (let i = 0; i < tags.length; i++) {
      originalString = this.removeAllTextFromTo(
        originalString,
        `<${tags[i]}`,
        '>'
      );
      originalString = this.removeAllTextFromTo(
        originalString,
        `</${tags[i]}`,
        '>'
      );
    }
    if (this.removedTotal == 0) {
      console.log("Didn't remove any tag from " + tags);
    }
    return originalString;
  }

  //#endregion
  //Set the given text to be in between the start and ending tag
  setToTag(
    text: string,
    tag: string,
    textToReplace: string,
    element: ElementRef
  ): string {
    var replaceFor = `<${tag}>${textToReplace}</${tag}>`;
    return this.replaceTextAt(text, element, replaceFor, textToReplace);
  }
}
