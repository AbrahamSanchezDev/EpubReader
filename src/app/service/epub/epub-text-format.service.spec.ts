import { TestBed } from '@angular/core/testing';

import { EpubTextFormatService } from './epub-text-format.service';
import { TextReplaceData } from 'src/app/interface/text-replace-data';

describe('EpubTextFormatService', () => {
  let service: EpubTextFormatService;

  let testingText: string;
  let testingText2: string;
  let testingText3: string;
  let testingText4: string;

  let getTitleText = `
  <body>
  <a href="SomeID.xhtml">My Title</a>
  </body>
  `;

  let textName: string = 'Book';
  let titleText: string;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubTextFormatService);
    setText();
    setTitleText();
  });

  const setText = () => {
    testingText = `
some text
<body>

<h1>Title</h1>
<h2>Title other</h2>
<img src="www.google.com">some img</img>
<p>Some Text</p>
<a>some link</a>

<h1>Title 2</h1>
<h2>Title other 2</h2>
<img src="www.youtube.com">some img</img>
<p>Some Text 2</p>
<a>some link 2</a>

</body>

end text
`;
    testingText2 = `
some text
<body class ="some">

<h1>Title</h1>
<h2>Title other</h2>
<img src="www.google.com">some img</img>
<p>Some Text</p>
<a>some link</a>

<h1>Title 2</h1>
<h2>Title other 2</h2>
<img src="www.youtube.com">some img</img>
<p>Some Text 2</p>
<a>some link 2</a>

</body>

end text
`;
    testingText3 = `
some text
<body class ="some">

<h1>Title</h1>
<h2>Title other</h2>
<img src="www.google.com">some img</img>
<p>Some Text</p>
<a href="SomeTitle.xhtml#h.id1">Some Link</a>

<h1>Title 2</h1>
<h2>Title other 2</h2>
<img src="www.youtube.com">some img</img>
<p>Some Text 2</p>
<a href="SomeTitle.xhtml#h.id2">Some Link 2</a>

</body>

end text
`;
    testingText4 = `
some text
<body class ="some">

<h1>Title</h1>
<h2>Title other</h2>
<img src="www.google.com">some img</img>
<p>Some Text</p>
<a href="SomeTitle.id1">Some Link</a>

<h1>Title 2</h1>
<h2>Title other 2</h2>
<img src="www.youtube.com">some img</img>
<p>Some Text 2</p>
<a href="SomeTitle.id2">Some Link 2</a>

</body>

end text
`;
  };

  const options: TextReplaceData = {
    beginString: 'href="',
    midString: 'xhtml#',
    replaceMidFor: '',
    removeFromTo: [
      //Remove the Nav
      { replaceFor: '<div class= "menu">', original: '<nav', originalEnd: '>' },
    ],
    replaceText: [
      {
        original: '</display:>',
        replaceFor: '</div>',
      },
      {
        //Replace the <a></a> link html to Button
        original: '<a ',
        replaceFor: '<button class ="index-obj" type="button" id ="',
      },
      {
        //Replace the <a></a> link html to Button
        original: '</a>',
        replaceFor: '</button>',
      },
    ],
    removeAllTags: ['ol', 'li'],
  };

  const setTitleText = () => {
    titleText = '<title>Title Name</title>';
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should remove other text outside body', () => {
    const text = service.cleanUpContent(testingText, textName);
    expect(text).not.toContain('some text');
    expect(text).not.toContain('end text');
  });
  it('should remove any other data in the body class', () => {
    const text = service.cleanUpContent(testingText2, textName);
    expect(text).toContain('<body>');
  });
  it('should get the title from the text', () => {
    let title = service.getTitleName(titleText);
    expect(title).toBe('Title Name');
  });

  it('should format the text to be content text', () => {
    let text = service.replaceAllTextBetween(testingText, options);
    expect(text).not.toContain('some text');
    expect(text).not.toContain('end text');
    expect(text).not.toContain('SomeTitle');
    expect(text).not.toContain(options.beginString);
  });

  it('should remove xhtml', () => {
    let text = service.removeXhtml(testingText3, options);
    expect(text).not.toContain('SomeTitle');
    expect(text).toContain('<a h.id1">Some Link</a>');

    text = service.removeXhtml(testingText4, options);
    expect(text).toBe(testingText4);

    text = service.removeXhtml(testingText2, options);
    expect(text).toEqual(testingText2);
  });

  it('should get the title from the first link', () => {
    let text = service.getFileNameFromIndex(getTitleText);
    expect(text).toBe('My Title');
    //When there is no element of a link "a"
    getTitleText = `
  <body>
  <p href="SomeID.xhtml">My Title</p>
  </body>
  `;
    text = service.getFileNameFromIndex(getTitleText);
    expect(text).toBe('');
  });
});
