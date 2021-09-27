import { IWizardAnswers } from 'generator/interfaces';

import { FrontReactBuilder } from './front-react';

export function getBuilder(params: IWizardAnswers) {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (params.type) {
    case 'front':
      return new FrontReactBuilder(params);

    default:
      throw new Error('PROJETO AINDA NÃO SUPORTADO 😢');
  }
}
