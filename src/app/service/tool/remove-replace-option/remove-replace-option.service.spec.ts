import { TestBed } from '@angular/core/testing';

import { RemoveReplaceOptionService } from './remove-replace-option.service';
import { RemoveReplaceOptions } from 'src/app/service/tool/remove-replace-option/interface/remove-replace-options';

describe('RemoveReplaceOptionService', () => {
  let service: RemoveReplaceOptionService;
  //#region Variables
  const closingEnd: string = '>';
  //Originals
  const start: string = '<start>';
  const startEnd: string = '</start>';
  const end: string = '<end>';
  const endEnd: string = '</end>';

  const linkStart: string = '<a';
  const linkEnd: string = '</a';
  const imgStart: string = '<img';
  const imgEnd: string = '</img';
  //#region Replace To
  //Replace to
  const button = '<button>';
  const buttonEnd = '</button>';
  const body = '<body>';
  const bodyEnd = '</body>';

  const div: string = '<div>';
  const divEnd: string = '</div>';
  const p: string = '<p>';
  const pEnd: string = '</p>';
  //#endregion

  const startText: string = 'Some starting Text';
  const randomText: string = 'Some Random string';
  const midText: string = 'www.google.com';
  const otherMid: string = 'www.youtube.com';
  const endText: string = 'Some ending Text';

  //#endregion

  /*
  Some starting Text   <a><a Some Random string > www.google.com </a Some Random string >
  <img Some Random string > <img> www.youtube.com </img> Some ending Text
  Some starting Text   <a><a Some Random string > www.google.com </a Some Random string >
  <img Some Random string > <img> www.youtube.com </img> Some ending Text
  */
  const replaceFromToText = `${startText}  ${linkStart}${closingEnd} ${linkStart} ${randomText} ${closingEnd} ${midText}  ${linkEnd}${randomText}${closingEnd}  
  ${imgStart} ${randomText} ${closingEnd}  ${imgStart}${closingEnd} ${otherMid} ${imgEnd}${closingEnd} ${endText}
  ${startText}  ${linkStart}${closingEnd} ${linkStart} ${randomText} ${closingEnd} ${midText}  ${linkEnd}${randomText}${closingEnd}  
  ${imgStart} ${randomText} ${closingEnd}  ${imgStart}${closingEnd} ${otherMid} ${imgEnd}${closingEnd} ${endText}
  `;

  /*                 
  Some starting Text <start> Some Random string </start> www.google.com <end> Some Random string </end>
  <end> Some Random string </end> Some ending Text
  Some starting Text <start> Some Random string </start> www.google.com <end> Some Random string </end>
  <end> Some Random string </end> Some ending Text
   */
  const fullReplaceText = `${startText} ${start} ${randomText} ${startEnd} ${midText}  ${end} ${randomText} ${endEnd}  
    ${end} ${randomText} ${endEnd} ${endText}
    ${startText} ${start} ${randomText} ${startEnd} ${midText}  ${end} ${randomText} ${endEnd}  
    ${end} ${randomText} ${endEnd} ${endText}
    `;
  //Options to be tested
  let options: RemoveReplaceOptions = {
    removeFromTo: [
      { original: linkStart, originalEnd: closingEnd, replaceFor: button },
      { original: linkEnd, originalEnd: closingEnd, replaceFor: buttonEnd },
      { original: imgStart, originalEnd: closingEnd, replaceFor: body },
      { original: imgEnd, originalEnd: closingEnd, replaceFor: bodyEnd },
    ],
    replaceText: [
      { original: start, replaceFor: div },
      { original: startEnd, replaceFor: divEnd },
      { original: end, replaceFor: p },
      { original: endEnd, replaceFor: pEnd },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoveReplaceOptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  //Test removeFromToOptions function
  it('should remove from start to end and replace text that are in the options', () => {
    let text = service.removeFromToOptions(
      replaceFromToText,
      options.removeFromTo
    );

    expect(text).toContain(startText);
    expect(text).toContain(endText);
    expect(text).toContain(midText);

    expect(text).not.toContain(linkStart);
    expect(text).not.toContain(linkEnd);
    expect(text).not.toContain(imgStart);
    expect(text).not.toContain(imgEnd);

    expect(text).toContain(button);
    expect(text).toContain(buttonEnd);
    expect(text).toContain(body);
    expect(text).toContain(bodyEnd);
  });

  //Test replaceTextOptions function
  it('should replace text that are in the options', () => {
    let text = service.replaceTextOptions(fullReplaceText, options.replaceText);
    expect(text).toContain(startText);
    expect(text).toContain(endText);
    expect(text).toContain(midText);

    expect(text).not.toContain(start);
    expect(text).not.toContain(startEnd);
    expect(text).not.toContain(end);
    expect(text).not.toContain(endEnd);

    expect(text).toContain(div);
    expect(text).toContain(divEnd);
    expect(text).toContain(p);
    expect(text).toContain(pEnd);
  });
});
