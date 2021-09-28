import { cwd } from 'process';

import { askParams, confirmParams } from './askParams';
import { getBuilder } from './builder';
import { IWizardAnswers } from './interfaces';

async function init(initialParams?: IWizardAnswers): Promise<void> {
  console.log('\n*****(Eduzz)********************************');
  console.log('* Bem vindo ao gerador de projetos finitos *');
  console.log('**********************************(42)******\n');

  let params = await askParams(initialParams);
  const builder = getBuilder(params, cwd());

  await builder.checkDeps();

  params = await builder.askMore();
  const confirm = await confirmParams();

  if (!confirm) {
    return init(params);
  }

  await builder.build();

  console.log('\n\n\n*************************************');
  console.log('* Tudo pronto, agora vá codar! 💻');
  console.log('\n-- Para iniciar: -----------------');
  console.log(`$ cd ${params.slug}`);
  console.log(`$ ${builder.initCommand}`);
  console.log('----------------------------------');
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
