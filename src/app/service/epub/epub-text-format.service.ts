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

  //Formats the given text
  replaceAllTextBetween(
    originalString: string,
    options: TextReplaceData
  ): string {
    const { beginString, midString, replaceMidFor } = options;
    //Remove starting comment and Head
    originalString = this.removeFromTo(originalString, '', '<?', '?>');
    originalString = this.removeFromTo(originalString, '', '<head>', '</head>');
    //Check if it needs to Format text
    let index = originalString.indexOf(beginString);
    if (index != -1) {
      while (index != -1) {
        originalString = this.removeAllOptions(originalString, options);

        //Get Start Index for the starting string
        let startIndex = originalString.indexOf(options.beginString);
        if (startIndex == -1) {
          return originalString;
        }
        let middleIndex = originalString.indexOf(midString);
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
        //Replace the index Container To Button
        originalString = this.replaceText(
          originalString,
          '<a ',
          '<button  type="button" id ='
        );
        originalString = this.replaceText(originalString, '</a>', '</button>');
        //Check if it should replace is finished
        index = originalString.indexOf('xhtml#');
      }
    } else {
      console.log('no replace');
    }
    return originalString;
  }
}
