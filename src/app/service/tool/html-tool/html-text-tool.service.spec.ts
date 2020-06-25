import { TestBed, async } from '@angular/core/testing';

import { HtmlTextToolService } from './html-text-tool.service';
import { ElementRef } from '@angular/core';
import { MockElementRef } from '../text-tool/text-tool.service.spec';
import { ReplaceStrings } from 'src/app/service/tool/remove-replace-option/interface/replace-strings';

describe('HtmlToolService', () => {
  let service: HtmlTextToolService;
  let input: ElementRef<HTMLInputElement>;
  const firstText = 'This is some previews text';
  const link = 'www.google.com';
  const endText = 'Other Text';

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
    service = TestBed.inject(HtmlTextToolService);
    input = new MockElementRef(HTMLInputElement);
  });
  afterAll(() => {
    input = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  //#region Text Formatting

  //#region img
  const imgText = `<div class="back-button">
<img src="assets/svg/backButton.svg" alt="back" (click)="onClose()" />
</div>
<div class="back-button">
<img src="assets/svg/backButton.svg" alt="back" (click)="onClose()" />
</div>
<div class="back-button">
<img src="assets/svg/backButton.svg" alt="back" (click)="onClose()" />
</div>`;
  const imgOriginal = '<img src=';
  const imgReplaceFor = `<img class="imgObj" src=`;
  //#endregion

  //#region comments and Components
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
  const commentAndComponentText = `
<!-- Display the codes examples in the topic -->
<div *ngSwitchCase="'Code'">
  <app-code-display
    codeText="{{ getContentText(content) }}"
  ></app-code-display>
</div>
<br />
<!-- Display the codes examples in the topic -->
<div *ngSwitchCase="'Code'">
  <app-code-display
    codeText="{{ getContentText(content) }}"
  ></app-code-display>
</div>
<br />`;

  //#endregion

  //#region code formatting
  const codeTagStart = '[code]';
  const codeTagEnd = '[/code]';
  const codeFormateadStart =
    '<div class="code-obj"><pre class="prettyprint linenums codeContainer">';
  const codeFormateadEnd = '</pre></div>';
  const codeText = `
 ${firstText}
  ${codeTagStart}
  ${commentAndComponentText}
  ${codeTagEnd}
  ${link}
  ${codeTagStart}
  ${commentAndComponentText}
  ${codeTagEnd}
  ${endText}
  ${codeTagStart}
  ${commentAndComponentText}
  ${codeTagEnd}
  End
  `;
  //#endregion

  //#region video formatting
  const textWithVideo = ` 
  [video]https://youtu.be/09j1wYdNfVQ[/video]
  If you need a step by step you can always go to YouTube here is one that i really like
  [video]https://www.youtube.com/embed/k5E2AVpwsko[/video]`;
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
  const iframePart = '<iframe width="560" height="315"';
  //#endregion

  //Testing formatTextToCode function
  it('should change the text to code format ', () => {
    let text = service.formatTextToCode(codeText);
    expect(text).toContain(codeFormateadStart);
    expect(text).toContain(codeFormateadEnd);
    expect(text).toContain(lessThan);
    expect(text).toContain(graterThan);
    expect(text).not.toContain(codeTagStart);
    expect(text).not.toContain(codeTagEnd);
  });
  //Testing formatAnyTagContainer function
  it('should change any < , > tags to &lt and &gt so they can be displayed as text', () => {
    let text = service.formatAnyTagContainer(commentAndComponentText);
    expect(text).not.toContain('<');
    expect(text).not.toContain('>');
    expect(text).toContain(lessThan);
    expect(text).toContain(graterThan);
  });
  //Testing formatCommentsAndComponents function
  it('should change the comments and components tags', () => {
    let text = service.formatCommentsAndComponents(commentAndComponentText);
    for (let i = 0; i < commentsAndComponentsReplace.length; i++) {
      const element = commentsAndComponentsReplace[i];
      expect(text).not.toContain(element.original);
      expect(text).toContain(element.replaceFor);
    }
  });
  //Testing formatTextToImg function
  it('should change the img tags to have the imgObj class', () => {
    let text = service.formatTextToImg(imgText);
    expect(text).toContain(imgReplaceFor);
    expect(text).not.toContain(imgOriginal);
  });
  //Testing formatTextToVideo function
  it('should change the video tag to a iframe so the video can be displayed', () => {
    let text = service.formatTextToVideo(textWithVideo);
    expect(text).toContain(iframePart);
    expect(text).toContain(videoReplace[1].replaceFor);
    expect(text).not.toContain(videoReplace[0].original);
    expect(text).not.toContain(videoReplace[1].original);
  });

  //#endregion
  //Testing setToCode function
  it('should replace Code Text', () => {
    //this would be the code text
    const codeText = `@Component({
      //Some Comment
  })`;
    //This would be the original text
    const testingText = `
This is some component,
${codeText}
end of the description`;
    //This should be the result
    const replacedText = `
This is some component,

[code]

${codeText}

[/code]

end of the description`;

    setTextInInput(testingText, codeText);
    let theText = service.setToCode(testingText, codeText, input);
    expect(theText.toString()).toBe(replacedText.toString());
  });
  //testing getTextAsCode function
  it('should return text as code', () => {
    let original = 'This text should be inside of the code';
    let changedText = service.getTextAsCode(original);
    expect(changedText).toContain('[code]');
    expect(changedText).toContain('[/code]');
    expect(changedText).toContain(original);
  });
  //Testing replaceSelectedToImg function
  it('should return text as image', () => {
    let originalText = `
    ${firstText}
    ${link}
    ${endText}
    `;
    setTextInInput(originalText, link);
    let theNewText = service.replaceSelectedToImg(originalText, link, input);
    expect(theNewText).toContain(firstText);
    expect(theNewText).toContain(link);
    expect(theNewText).toContain(endText);
    expect(theNewText).toContain('<img src=');
  });
  //Testing replaceSelectedToLink function
  it('should return text as link', () => {
    let originalText = `
    ${firstText}
    ${link}
    ${endText}
    `;
    setTextInInput(originalText, link);
    let theNewText = service.replaceSelectedToLink(originalText, link, input);
    expect(theNewText).toContain(firstText);
    expect(theNewText).toContain(link);
    expect(theNewText).toContain(endText);
    expect(theNewText).toContain('<a href');
  });

  //Testing insertLink function
  it('should insert a link to the text', () => {
    let originalText = `
      ${firstText}
      ${link}
      ${endText}
      `;
    let otherLink = 'www.youtube.com';
    let linkDisplay = 'Some Link Is Here!';
    setTextInInput(originalText, link);
    let theNewText = service.insertLink(
      originalText,
      otherLink,
      linkDisplay,
      input
    );
    expect(theNewText).toContain(firstText);
    expect(theNewText).toContain(link);
    expect(theNewText).toContain(endText);
    expect(theNewText).toContain('<a href');
    expect(theNewText).toContain(otherLink);
  });

  //Testing InsertImg function
  it('should insert an img to the text', () => {
    let originalText = `
      ${firstText}
      ${link}
      ${endText}
      `;
    let otherLink = 'www.youtube.com';
    let linkDisplay = 'Some Link Is Here!';
    setTextInInput(originalText, link);
    let theNewText = service.InsertImg(
      originalText,
      otherLink,
      linkDisplay,
      input
    );
    expect(theNewText).toContain(firstText);
    expect(theNewText).toContain(link);
    expect(theNewText).toContain(endText);
    expect(theNewText).toContain('<img src=');
    expect(theNewText).toContain(otherLink);
  });
  //Testing setToTag function
  it('should put the text in between two tags', () => {
    let originalText = `
      ${firstText}
      ${link}
      ${endText}
      `;
    //This can be any tag
    let tag = 'p';
    setTextInInput(originalText, link);
    let theNewText = service.setToTag(originalText, tag, link, input);
    expect(theNewText).toContain(firstText);
    expect(theNewText).toContain(link);
    expect(theNewText).toContain(endText);
    expect(theNewText).toContain(`<${tag}>${link}</${tag}>`);
  });
});
