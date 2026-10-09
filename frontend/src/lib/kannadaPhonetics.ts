/**
 * FORGE Sovereign Control Plane - Kannada Phonetic Speech Synthesizer Helper
 * 
 * When browsers/operating systems lack an offline Kannada (kn-IN) voice pack,
 * raw Kannada unicode characters produce silence or error on host speech engines.
 * This utility converts Kannada text to phonetically-accurate syllables
 * so standard multi-language speech synthesizers pronounce genuine Kannada words clearly.
 */

const VOWELS: Record<string, string> = {
  '\u0C85': 'a',
  '\u0C86': 'aa',
  '\u0C87': 'i',
  '\u0C88': 'ee',
  '\u0C89': 'u',
  '\u0C8A': 'oo',
  '\u0C8B': 'ru',
  '\u0C8E': 'e',
  '\u0C8F': 'ae',
  '\u0C90': 'ai',
  '\u0C92': 'o',
  '\u0C93': 'oo',
  '\u0C94': 'au',
};

const CONSONANTS: Record<string, string> = {
  '\u0C95': 'k',
  '\u0C96': 'kh',
  '\u0C97': 'g',
  '\u0C98': 'gh',
  '\u0C99': 'ng',
  '\u0C9A': 'ch',
  '\u0C9B': 'chh',
  '\u0C9C': 'j',
  '\u0C9D': 'jh',
  '\u0C9E': 'ny',
  '\u0C9F': 't',
  '\u0CA0': 'th',
  '\u0CA1': 'd',
  '\u0CA2': 'dh',
  '\u0CA3': 'n',
  '\u0CA4': 'th',
  '\u0CA5': 'thh',
  '\u0CA6': 'd',
  '\u0CA7': 'dh',
  '\u0CA8': 'n',
  '\u0CAA': 'p',
  '\u0CAB': 'ph',
  '\u0CAC': 'b',
  '\u0CAD': 'bh',
  '\u0CAE': 'm',
  '\u0CAF': 'y',
  '\u0CB0': 'r',
  '\u0CB1': 'r',
  '\u0CB2': 'l',
  '\u0CB3': 'l',
  '\u0CB5': 'v',
  '\u0CB6': 'sh',
  '\u0CB7': 'sh',
  '\u0CB8': 's',
  '\u0CB9': 'h',
};

const MATRAS: Record<string, string> = {
  '\u0CBE': 'aa',
  '\u0CBF': 'i',
  '\u0CC0': 'ee',
  '\u0CC1': 'u',
  '\u0CC2': 'oo',
  '\u0CC3': 'ru',
  '\u0CC6': 'e',
  '\u0CC7': 'ae',
  '\u0CC8': 'ai',
  '\u0CCA': 'o',
  '\u0CCB': 'oo',
  '\u0CCC': 'au',
  '\u0CCD': '', // virama
};

export function kannadaToPhonetic(text: string): string {
  if (!text) return '';
  const res: string[] = [];
  const n = text.length;
  let i = 0;

  while (i < n) {
    const ch = text[i];
    if (ch in VOWELS) {
      res.push(VOWELS[ch]);
      i += 1;
    } else if (ch in CONSONANTS) {
      const base = CONSONANTS[ch];
      if (i + 1 < n && text[i + 1] in MATRAS) {
        const m = MATRAS[text[i + 1]];
        res.push(base + m);
        i += 2;
      } else {
        res.push(base + 'a');
        i += 1;
      }
    } else if (ch === '\u0C82') {
      res.push('m');
      i += 1;
    } else if (ch === '\u0C83') {
      res.push('h');
      i += 1;
    } else {
      res.push(ch);
      i += 1;
    }
  }

  return res.join('');
}
