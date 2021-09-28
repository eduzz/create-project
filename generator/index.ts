import { cwd } from 'process';

import { askParams, confirmParams } from './askParams';
import { getBuilder } from './builder';
import { TEMPLATE_FOLDER } from './config';
import { IWizardAnswers } from './interfaces';

async function init(initialParams?: IWizardAnswers): Promise<void> {
  console.log(TEMPLATE_FOLDER);

  let params = await askParams(initialParams);
  const builder = getBuilder(params, cwd());

  params = await builder.askMore();
  const confirm = await confirmParams();

  if (!confirm) {
    return init(params);
  }

  await builder.build();
}

init()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason);
  console.log(promise);
});

process.on('uncaughtException', err => {
  console.error(err);
});

process.on('SIGTERM', async () => {
  process.exit(0);
});
