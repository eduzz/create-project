import { askParams } from './askParams';
import { getBuilder } from './builder';
import { TEMPLATE_FOLDER } from './config';

async function init() {
  console.log(TEMPLATE_FOLDER);

  const params = await askParams();
  const builder = getBuilder(params);
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
