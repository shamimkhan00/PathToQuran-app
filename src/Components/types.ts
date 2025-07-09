export type RootStackParamList = {
  index: undefined;
  SurahDetail: {
    surahNumber: number;
    surahName: string;
  };
};

export type VerseMap = {
  [ayahNumber: string]: string;
};

export type SurahMap = {
  [surahNumber: string]: VerseMap;
};