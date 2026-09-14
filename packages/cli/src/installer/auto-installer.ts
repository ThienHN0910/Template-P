import * as p from '@clack/prompts';
import pc from 'picocolors';
import { execa } from 'execa';
import { ToolCheckResult } from './inspector.js';

export async function handleMissingTools(missingTools: ToolCheckResult[]): Promise<void> {
  if (missingTools.length === 0) return;

  const osPlatform = process.platform; // 'win32' | 'darwin' | 'linux'

  for (const item of missingTools) {
    p.log.warn(
      pc.yellow(`⚠️  Runtime required but not found: `) +
        pc.bold(pc.cyan(item.tool)) +
        pc.dim(` (${item.requiredFor})`)
    );

    const command =
      osPlatform === 'win32'
        ? item.installerCommand.win32
        : osPlatform === 'darwin'
        ? item.installerCommand.darwin
        : item.installerCommand.linux;

    const shouldAutoInstall = await p.confirm({
      message: `Would you like to auto-install ${pc.bold(item.tool)} via system package manager?`,
      initialValue: true,
    });

    if (p.isCancel(shouldAutoInstall)) {
      p.cancel(pc.yellow('Operation cancelled.'));
      process.exit(0);
    }

    if (shouldAutoInstall) {
      const s = p.spinner();
      s.start(`Executing: ${pc.dim(command)}...`);

      try {
        await execa(command, { shell: true, stdio: 'inherit', timeout: 120000 });
        s.stop(pc.green(`✓ Successfully installed ${item.tool}!`));
      } catch {
        s.stop(pc.red(`✗ Automatic installation failed or was denied administrator privileges.`));
        p.log.info(
          pc.cyan(`Please manually download and install from: `) + pc.underline(pc.bold(item.downloadUrl))
        );
        await p.text({
          message: `Press ${pc.bold('<Enter>')} once you have completed installation to proceed...`,
          placeholder: 'Press Enter',
        });
      }
    } else {
      p.log.info(
        pc.cyan(`You can manually download and install ${item.tool} from: `) +
          pc.underline(pc.bold(item.downloadUrl))
      );
    }
  }
}
