import { IWizardAnswers } from '../interfaces';
import { AbstractProjectBuilder } from './abstract';
import { FrontReactBuilder } from './front-react';

export function getBuilder(params: IWizardAnswers, targetPath: string): AbstractProjectBuilder {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (params.type) {
    case 'front':
      return new FrontReactBuilder(params, targetPath);

    default:
      throw new Error('PROJETO AINDA NÃO SUPORTADO 😢');
  }
}
