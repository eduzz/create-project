import { AbstractProjectBuilder } from './abstract';

export class FrontReactBuilder extends AbstractProjectBuilder {
  protected templatePath = 'front/react';

  public async build(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
