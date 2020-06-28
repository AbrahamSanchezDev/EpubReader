import { TestBed, async } from '@angular/core/testing';

import { TextToolService } from './text-tool.service';
import { ElementRef } from '@angular/core';
export class MockElementRef extends ElementRef {}
describe('TextToolService', () => {
  let service: TextToolService;
  let input: ElementRef<HTMLInputElement>;
  const firstText = 'This is some previews text'; //26
  const link = 'www.google.com'; //16
  const link2 = 'www.youtube.com';
  const endText = 'Other Text';
  const fullText = `${firstText}${link}${endText}`;
  const setTextInInput = (fullText, lookingForText) => {
    input.nativeElement.innerText = fullText;
    let textPos = fullText.indexOf(lookingForText);
    input.nativeElement.selectionStart = textPos;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        //more providers
        { provide: ElementRef, useClass: MockElementRef },
      ],
    }).compileComponents();
  }));
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextToolService);
    input = new MockElementRef(HTMLInputElement);
  });
  afterAll(() => {
    input = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //Test replaceTextAt function
  it('should replace google link to youtube', () => {
    setTextInInput(fullText, link);
    let theText = service.replaceTextAt(fullText, input, link2, link);

    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).toContain(link2);
    expect(theText).not.toContain(link);
  });
  //Test replaceText function
  it('should replace first match and replace it for the given text', () => {
    setTextInInput(fullText, link);
    let theText = service.replaceText(fullText, link, link2);
    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).toContain(link2);
    expect(theText).not.toContain(link);
  });
  //Test insertText function
  it('should insert LinkedIn(some Text) to the original text', () => {
    setTextInInput(fullText, link);

    const addedText = `LinkedIn 
    `;
    let theText = service.insertText(fullText, addedText, input);
    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).toContain(link);
    expect(theText).toContain(addedText);
    theText = service.insertText(fullText, null, null);
    expect(theText).toBe(fullText);
  });
  //Test insertText function
  it('should insert Some Text after the given text', () => {
    const addedText = `
    LinkedIn 
    Some other text added
    `;
    let theText = service.insertAfter(fullText, link, addedText);
    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).toContain(link);
    expect(theText).toContain(addedText);
    theText = service.insertAfter('fullText', 'link', 'addedText');
    expect(theText).toEqual('fullText');
  });
  //Test insertBefore function
  it('should insert Some Text before the given text', () => {
    const injectedTo = `${firstText}${link2}${link}${endText}`;
    let theText = service.insertBefore(fullText, link, link2);
    expect(theText).toContain(link);
    expect(theText).toContain(link2);
    expect(theText).toBe(injectedTo);

    theText = service.insertBefore('fullText', 'link', 'link2');
    expect(theText).toEqual('fullText');
  });
  //Test keepAllTextInBetween function
  it('should remove all but the text outside start and end range', () => {
    const start = '<start>';
    const end = '</start>';
    const startTextToRemove = 'Index Text Of';
    const textShouldBeGone = `More Text Here that should be removed`;
    const biggerText = `${startTextToRemove}     
    ${start}
    ${fullText}
    ${link2}  
    ${end}
    
    ${textShouldBeGone}`;

    let theText = service.keepAllTextInBetween(biggerText, start, end);
    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).toContain(link);
    expect(theText).toContain(link);
    expect(theText).toContain(link2);
    expect(theText).toContain(end);
    expect(theText).not.toContain(startTextToRemove);
    expect(theText).not.toContain(textShouldBeGone);
    theText = service.keepAllTextInBetween('biggerText', '123', '456');
    expect(theText).toEqual('biggerText');
    expect(service.removedTotal).toEqual(0);
  });

  //Test getTextBetween function
  it('should replace first match and replace it for the given text', () => {
    const continuesText = `${firstText}${link}${link2}${endText}`;
    let theText = service.getTextBetween(continuesText, firstText, endText);
    expect(theText).not.toContain(firstText);
    expect(theText).not.toContain(endText);
    expect(theText).toContain(link2);
    expect(theText).toContain(link);
    theText = service.getTextBetween(continuesText, 'no', 'someOtherNo');
    expect(theText).toEqual('');
  });

  //Test removeAllTextFromTo function
  it('should remove the text between the start and end including start and end them self', () => {
    const start = '<start>';
    const end = '</start>';
    const continuesText = `${firstText} ${start} ${link} ${end}  ${start}${link2}${end} ${endText}
    ${start} ${link} ${end}   ${firstText}   ${start}${link2}${end}  `;
    let theText = service.removeAllTextFromTo(continuesText, start, end);
    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).not.toContain(start);
    expect(theText).not.toContain(end);
    expect(theText).not.toContain(link2);
    expect(theText).not.toContain(link);
  });
  //Test removeTextFromTo function
  it('should replace the text between the start and end for the given text', () => {
    const start = '<start>';
    const end = '</start>';
    const continuesText = `${firstText} ${start} ${link} ${end} ${link2} ${endText}`;
    let theText = service.removeTextFromTo(
      continuesText,
      `${link2} ... `,
      start,
      end
    );
    expect(theText).toContain(firstText);
    expect(theText).toContain(endText);
    expect(theText).toContain(link2);
    expect(theText).toContain('...');
    expect(theText).not.toContain(link);
    theText = service.removeTextFromTo(continuesText, '', '<end>', '</end>');
    expect(theText).toBe(continuesText);
  });
});
