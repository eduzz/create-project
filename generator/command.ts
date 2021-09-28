import childProcess from 'child_process';

export async function execCommand(command: string, args: string[], options: childProcess.SpawnOptions = {}) {
  const spawned = childProcess.spawn(command, args, { stdio: 'inherit', ...options });

  return new Promise<void>((resolve, reject) => {
    spawned.on('error', err => reject(err));
    spawned.once('exit', code => (code >= 0 ? resolve() : reject()));
  });
}

export async function execCommandSilent(command: string, args: string[], options: childProcess.SpawnOptions = {}) {
  return execCommand(command, args, { ...options, stdio: 'ignore' });
}
