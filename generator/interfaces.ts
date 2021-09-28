export interface IWizardAnswers {
  type: 'back' | 'front' | 'mobile';
  language: 'node' | 'php';
  purpose: 'api' | 'microservice';
  project: string;
  slug: string;
  repository: string;
  sentryDsn?: string;
}

export interface IBuilderReplacer {
  from: string;
  to: string;
}
