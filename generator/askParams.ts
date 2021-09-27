import inquirer from 'inquirer';
import kebabCase from 'lodash/kebabCase';

import { IWizardAnswers } from './interfaces';

export async function askParams(previousAnswers?: IWizardAnswers): Promise<IWizardAnswers> {
  const params = await inquirer.prompt<IWizardAnswers>([
    {
      name: 'type',
      default: previousAnswers?.type,
      type: 'list',
      choices: [
        { type: 'choice', name: 'Back', value: 'back' },
        { type: 'choice', name: 'Front', value: 'front' },
        { type: 'choice', name: 'Mobile', value: 'mobile' }
      ],
      message: 'Back/Front ou Mobile?'
    },
    {
      name: 'language',
      default: previousAnswers?.language,
      type: 'list',
      choices: [
        { type: 'choice', name: 'Javascript (Node)', value: 'node' },
        { type: 'choice', name: 'PHP', value: 'php' }
      ],
      when: (answers: IWizardAnswers) => answers.type === 'back',
      message: 'Qual linguagem?'
    },
    {
      name: 'purpose',
      default: previousAnswers?.purpose,
      type: 'list',
      choices: [
        { type: 'choice', name: 'API', value: 'api' },
        { type: 'choice', name: 'Microserviço', value: 'microservice' }
      ],
      when: (answers: IWizardAnswers) => answers.type === 'back',
      message: 'Qual o propósito?'
    },
    {
      name: 'project',
      default: previousAnswers?.project,
      message: 'Nome do projeto *',
      validate: i => (i.length >= 3 ? true : 'Pelo menos 3 letras')
    },
    {
      name: 'slug',
      default: (answers: IWizardAnswers) => kebabCase(answers.project) ?? previousAnswers?.slug,
      message: 'Slug *',
      validate: (value, answers: IWizardAnswers) => {
        if (value.length < 3) {
          return 'Pelo menos 3 letras';
        }

        if (kebabCase(value) === value) {
          `Slug inválido, não utilize maísculas e underline(_). Ex: ${kebabCase(answers.project)}`;
        }

        return true;
      }
    },
    {
      name: 'repository',
      default: previousAnswers?.repository,
      message: 'Repositorio'
    },
    // {
    //   name: 'dockerImage',
    //   default: a => answers.dockerImage || `infraeduzz/${kebabCase(a.project).toLowerCase()}`,
    //   message: 'Docker Repo (infraeduzz/example)'
    // },
    // {
    //   name: 'dockerCredentials',
    //   default: answers.dockerCredentials,
    //   message: 'Docker Credentials (UUID/GUID)'
    // },
    {
      name: 'sentryDsn',
      default: previousAnswers?.sentryDsn,
      message: 'Sentry DSN'
    },
    {
      name: 'confirmed',
      type: 'confirm',
      message: 'Confirma as configurações?'
    }
  ]);

  if (!params.confirmed) {
    console.log('---- Responda novamente:');
    return askParams(params);
  }

  return params;
}
