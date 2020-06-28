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

  const startText: string = 'starting';
  const midText: string = 'www.google.com';
  const otherMid: string = 'www.youtube.com';
  const endText: string = 'Some ending Text';
  //#endregion

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

  //Test removeAllOptions function
  it('should remove all options text that are in the options', () => {
    const fullReplaceText = `
    <start> starting </start> midText <end> www.google.com </end>
    <a> www.google.com </a Some Random string >
    www.youtube.com
    <img> www.youtube.com </img> 
    <img>  www.google.com </img> ending
      `;
    let text = service.removeAllOptions(fullReplaceText, options);

    expect(text).toContain('starting');
    expect(text).toContain('ending');
    expect(text).toContain('midText');
    expect(text).toContain(otherMid);

    expect(text).toContain(button);
    expect(text).toContain(buttonEnd);
    expect(text).toContain(body);
    expect(text).toContain(bodyEnd);

    expect(text).toContain(div);
    expect(text).toContain(divEnd);
    expect(text).toContain(p);
    expect(text).toContain(pEnd);

    expect(text).not.toContain(start);
    expect(text).not.toContain(startEnd);
    expect(text).not.toContain(end);
    expect(text).not.toContain(endEnd);

    expect(text).not.toContain(linkStart);
    expect(text).not.toContain(linkEnd);
    expect(text).not.toContain(imgStart);
    expect(text).not.toContain(imgEnd);
  });

  //Test removeFromToOptions function
  it('should remove from start to end and replace text that are in the options', () => {
    const replaceFromToText = ` starting   <a><a Some Random string > www.google.com </a Some Random string >
    <img Some Random string > <img> www.youtube.com </img> Some ending Text
    starting   <a><a Some Random string > www.google.com </a Some Random string >
    <img Some Random string > <img> www.youtube.com </img> Some ending Text
    `;
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

    spyOn(console, 'log');
    text = service.removeFromToOptions('starting', [
      { original: 'starting', originalEnd: 'starting', replaceFor: 'starting' },
    ]);
    expect(text).toBe('starting');
    expect(console.log).toHaveBeenCalled();
  });
  //Test replaceTextOptions function
  it('should replace text that are in the options', () => {
    const fullReplaceText = `Some starting Text <start> Some Random string </start> www.google.com <end> Some Random string </end>
    <end> Some Random string </end> Some ending Text
    Some starting Text <start> Some Random string </start> www.google.com <end> Some Random string </end>
    <end> Some Random string </end> Some ending Text
      `;
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

    spyOn(console, 'log');
    text = service.replaceTextOptions('fullReplaceText', [
      { original: 'Repl', replaceFor: 'Repl' },
    ]);
    expect(text).toBe('fullReplaceText');
    expect(console.log).toHaveBeenCalled();
  });
});
