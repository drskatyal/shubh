export type ExtractIntent = 'match' | 'muhurat_marriage' | 'other';

export type ExtractedPerson = {
  name: string | null;
  day: number | null;
  month: number | null;
  year: number | null;
  hour: number | null;
  min: number | null;
  place: string | null;
};

export type MarriageExtract = {
  person_a: ExtractedPerson;
  person_b: ExtractedPerson;
  intent: ExtractIntent;
  question: string;
};

export type PersonSide = 'a' | 'b';

export type PersonField = 'name' | 'date' | 'time' | 'place';

export type MissingField = {
  side: PersonSide;
  field: PersonField;
  hint: string;
};

export type GeoPlace = {
  place: string;
  lat: number;
  lon: number;
  tzone: number;
};
