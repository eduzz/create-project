import { IWizardAnswers } from 'generator/interfaces';

export abstract class AbstractProjectBuilder {
  protected abstract templatePath: string;

  constructor(protected params: IWizardAnswers, protected targetPath: string) {}
  public abstract build(): Promise<void>;

  protected copyFiles() {}
}
