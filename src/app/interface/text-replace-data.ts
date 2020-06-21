import { ReplaceStrings } from './replace-strings';

export interface TextReplaceData {
  beginString: string;
  midString: string;
  replaceMidFor: string;

  //Call until all is replaced
  removeFromTo?: ReplaceStrings[];
  replaceText?: ReplaceStrings[];
  removeAllTags?: string[];
}
