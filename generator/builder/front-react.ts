import ora from 'ora';

import { ParamQuestions } from '../askParams';
import { execCommandSilent, execCommand } from '../command';
import { IBuilderReplacer, IWizardAnswers } from '../interfaces';
import { AbstractProjectBuilder } from './abstract';

interface IWizardExtra extends IWizardAnswers {
  endpointDev: string;
  endpointProd: string;
  sentryDsn: string;
}

export class FrontReactBuilder extends AbstractProjectBuilder<IWizardExtra> {
  public initCommand = 'yarn start';
  protected templateUrl = 'https://github.com/eduzz/template-react';
  protected moreParamsQuestions: ParamQuestions<IWizardExtra> = [
    {
      name: 'endpointDev',
      default: (answers: IWizardExtra) => answers.endpointDev || 'http://localhost:3001',
      message: 'Endpoint API(Dev)'
    },
    {
      name: 'endpointProd',
      default: (answers: IWizardExtra) => answers.endpointProd,
      message: 'Endpoint API(Prod)'
    },
    {
      name: 'sentryDsn',
      default: (answers: IWizardExtra) => answers.sentryDsn,
      message: 'Sentry DSN'
    }
  ];

  public async checkDeps() {
    const loader = ora('Verificando dependências').start();
    try {
      await execCommandSilent('yarn', ['-v']);
      loader.succeed();
    } catch (err) {
      loader.fail('Yarn é obrigatório');
      throw err;
    }
  }

  public async build(): Promise<void> {
    await this.copyFiles();
    await this.config();
    await this.gitInit();
    await this.installDeps();
  }

  public async config() {
    const loader = ora('Configurando').start();

    const replacers: IBuilderReplacer[] = [
      { from: '%PROJECT-NAME%', to: this.params.project },
      { from: 'PROJECT-NAME', to: this.params.project },
      { from: 'Projeto Base React Eduzz', to: this.params.project },
      { from: '%PROJECT-SLUG%', to: this.params.slug },
      { from: 'PROJECT-SLUG', to: this.params.slug },
      { from: '%DEV-ENDPOINT%', to: this.params.endpointDev || '%DEV-ENDPOINT%' },
      { from: '%PROD-ENDPOINT%', to: this.params.endpointProd || '%PROD-ENDPOINT%' },
      // { from: '%DOCKER-IMAGE%', to: this.params.dockerImage || '%DOCKER-IMAGE%' },
      // { from: '%DOCKER-CREDENTIALS%', to: this.params.dockerCredentials || '%DOCKER-CREDENTIALS%' },
      { from: '%SENTRY-DSN%', to: this.params.sentryDsn }
    ];

    await Promise.all([
      this.replaceContent('Jenkinsfile', replacers),
      this.replaceContent('package.json', replacers),
      this.replaceContent('public/index.html', replacers),
      this.replaceContent('README.md', replacers),
      this.replaceContent('docker-compose.yml', replacers),
      this.replaceContent('.env.development', replacers),
      this.replaceContent('.env.production', replacers),
      this.replaceContent('.gitignore', [{ from: 'yarn.lock', to: '' }])
    ]);

    loader.succeed();
  }

  private async installDeps() {
    await execCommand('yarn', ['install'], { cwd: this.getTargetPath() });
  }
}
