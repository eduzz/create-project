import fs from 'fs/promises';
import path from 'path';

import ora from 'ora';
import ProgressBar from 'progress';

import { askMoreParams, ParamQuestions } from '../askParams';
import { execCommandSilent } from '../command';
import { TEMPLATE_FOLDER } from '../config';
import getFolderSize from '../folderSize';
import { IBuilderReplacer, IWizardAnswers } from '../interfaces';

export abstract class AbstractProjectBuilder<P extends IWizardAnswers = IWizardAnswers> {
  public abstract initCommand: string;
  protected abstract templatePath: string;
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

  protected getTemplateFullPath(): string {
    return path.join(TEMPLATE_FOLDER, this.templatePath);
  }

  protected async copyFiles(): Promise<void> {
    const loader = ora('Preparando').start();
    const templateSize = await getFolderSize(this.getTemplateFullPath());
    loader.succeed();

    const progress = new ProgressBar('Copiando [:bar] :percent :finalSize/:templateSize :etas', {
      total: templateSize,
      width: 20
    });

    let lastSize = 0;
    const checkInterval = setInterval(async () => {
      const finalSize = await getFolderSize(this.getTargetPath());
      progress.tick(finalSize - lastSize, { finalSize: this.bToMB(finalSize), templateSize: this.bToMB(templateSize) });
      lastSize = finalSize;
    }, 500);

    await fs.mkdir(this.getTargetPath());
    await fs.cp(this.getTemplateFullPath(), this.getTargetPath(), {
      recursive: true,
      filter: path => !path.includes('node_modules') && !path.includes('vendor')
    });

    clearInterval(checkInterval);
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

    await execCommandSilent('git', ['init'], { stdio: 'ignore', cwd: this.getTargetPath() });
    await execCommandSilent('git', ['add', '.'], { stdio: 'ignore', cwd: this.getTargetPath() });
    await execCommandSilent('git', ['commit', '-nm', 'Commit inicial'], { stdio: 'ignore', cwd: this.getTargetPath() });

    loader.succeed();
  }

  private bToMB(val: number) {
    return (val / 1024 / 1024).toFixed(2) + 'Mb';
  }
}
