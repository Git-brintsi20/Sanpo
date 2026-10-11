export interface JapaneseCard {
  english: string;
  japanese: string;
  reading_hiragana: string;
  romaji: string;
  example_sentence_ja: string;
  example_sentence_en: string;
  japan_note: string;
}

export interface PhotoResult {
  id: string;
  photoUrl: string; // object URL or base64 thumbnail
  cards: JapaneseCard[];
  elapsed: string;
  model: string;
}

export interface Walk {
  id: string;
  title: string;
  date: string; // ISO
  photos: PhotoResult[];
  postcard?: Postcard;
}

export interface Postcard {
  id: string;
  walkId: string;
  letter: string;
  createdAt: string; // ISO
  openOn: string; // ISO date string
  sealed: boolean;
}

export interface BucketItem {
  id: string;
  name: string;
  done: boolean;
  note?: string;
  photoUrl?: string;
}
