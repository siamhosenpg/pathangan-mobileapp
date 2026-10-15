export interface TermsSection {
  title: string;
  body: string;
}

export interface TermsContent {
  lastUpdated: string;
  intro: string;
  sections: TermsSection[];
}
