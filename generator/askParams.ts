import inquirer from 'inquirer';
import kebabCase from 'lodash/kebabCase';

import { IWizardAnswers } from './interfaces';

export type ParamQuestions<Q extends IWizardAnswers = IWizardAnswers> = inquirer.QuestionCollection<Q>;

export async function askParams(previousAnswers?: IWizardAnswers): Promise<IWizardAnswers> {
  console.log(
    !previousAnswers
      ? 'Antes de mais nada responsa algumas perguntas 🤓:'
      : '\n---- Errou neh rapaz 🤦‍♂️? Responda novamente:'
  );
  return inquirer.prompt<IWizardAnswers>([
    {
      name: 'type',
      default: previousAnswers?.type,
      type: 'list',
      choices: [
        { type: 'choice', name: 'Back', value: 'back' },
        { type: 'choice', name: 'Front', value: 'front' },
        { type: 'choice', name: 'Mobile', value: 'mobile' }
      ],
      message: 'Que tipo de projeto deseja iniciar?'
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
      validate: (i: string) => (i.length >= 3 ? true : 'Pelo menos 3 letras')
    },
    {
      name: 'slug',
      default: (answers: IWizardAnswers) => kebabCase(answers.project) ?? previousAnswers?.slug,
      message: 'Slug *',
      validate: (value: string, answers: IWizardAnswers) => {
        if (value.length < 3) {
          return 'Pelo menos 3 letras';
        }

        if (kebabCase(value) === value) {
          `Slug inválido, não utilize maísculas e underline(_). Ex: ${kebabCase(answers.project)}`;
        }

        return true;
      }
    }
  ]);
}

export async function confirmParams() {
  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      name: 'confirmed',
      type: 'confirm',
      message: 'Confirma as configurações?'
    }
  ]);

  return confirmed;
}

export async function askMoreParams<P extends IWizardAnswers>(
  answers: IWizardAnswers,
  questions: ParamQuestions
): Promise<P> {
  const moreAnswers = await inquirer.prompt<any>(questions, answers);
  return { ...answers, ...moreAnswers };
}
