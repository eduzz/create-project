import fs from 'fs/promises';
import path from 'path';

import ora from 'ora';

import { askMoreParams, ParamQuestions } from '../askParams';
import { execCommand, execCommandSilent } from '../command';
import { IBuilderReplacer, IWizardAnswers } from '../interfaces';

export abstract class AbstractProjectBuilder<P extends IWizardAnswers = IWizardAnswers> {
  public abstract initCommand: string;
  protected abstract templateUrl: string;
  protected abstract moreParamsQuestions: ParamQuestions<P>;

  protected params: P;

  constructor(params: IWizardAnswers, private targetBasePath: string) {
    this.params = params as P;
  }

  public abstract build(): Promise<void>;
  public abstract checkDeps(): Promise<void>;

  public async askMore(): Promise<IWizardAnswers> {
    if (this.moreParamsQuestions) {
      this.params = await askMoreParams<P>(this.params, this.moreParamsQuestions);
    }

    return this.params;
  }

  protected getTargetPath() {
    return path.join(this.targetBasePath, this.params.slug);
  }

  protected async copyFiles(): Promise<void> {
    await execCommand('git', ['clone', this.templateUrl, this.getTargetPath()]);
    ora('Arquivos copiados').succeed();
  }

  protected async replaceContent(file: string, replacers: IBuilderReplacer[]) {
    const finalPath = path.join(this.getTargetPath(), file);
    let content: string = await fs.readFile(finalPath, 'utf8');

    for (const replacer of replacers) {
      content = content.replace(new RegExp(replacer.from), replacer.to ?? '');
    }

    await fs.writeFile(finalPath, content);
  }

  protected async gitInit() {
    const loader = ora('Git').start();

    await execCommandSilent('rm', ['-r', '.git'], { cwd: this.getTargetPath() });
    await execCommandSilent('git', ['init'], { cwd: this.getTargetPath() });
    await execCommandSilent('git', ['add', '.'], { cwd: this.getTargetPath() });
    await execCommandSilent('git', ['commit', '-nm', 'Commit inicial'], { cwd: this.getTargetPath() });

    loader.succeed();
  }
}
