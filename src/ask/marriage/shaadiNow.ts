const SHAADI_NOW =
  /ab shaadi|ab shadi|shaadi kar sakte|shadi kar sakte|अभी शादी|शादी कर सकते|विवाह.*अभी|अभी.*विवाह|marry (now|today)|marriage (now|today)|can we (get )?marry|vivah ab/i;

const MARRIAGE_ASK =
  /milan|matching|guna|manglik|shaadi|shadi|vivah|muhurat|विवाह|शादी|मिलान|गुण|मंगलिक|कुंडली मिलान/i;

export function askedShaadiNow(text: string | null | undefined): boolean {
  return Boolean(text && SHAADI_NOW.test(text));
}

export function looksLikeMarriageAsk(text: string | null | undefined): boolean {
  return Boolean(text && (SHAADI_NOW.test(text) || MARRIAGE_ASK.test(text)));
}
