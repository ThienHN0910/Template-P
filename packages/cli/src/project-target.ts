import fs from 'node:fs';
import path from 'node:path';

const MAX_PACKAGE_NAME_LENGTH = 214;
const PROJECT_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function validateProjectName(value: string): string | undefined {
  if (value.length === 0) {
    return 'Project name is required.';
  }

  if (value.length > MAX_PACKAGE_NAME_LENGTH || !PROJECT_NAME_PATTERN.test(value)) {
    return 'Project name must be a lowercase npm-compatible name using letters, numbers, and hyphens.';
  }

  return undefined;
}

export function resolveProjectTarget(parentDirectory: string, projectName: string): string {
  const validationError = validateProjectName(projectName);
  if (validationError) {
    throw new Error(validationError);
  }

  const parent = path.resolve(parentDirectory);
  const target = path.resolve(parent, projectName);
  const relativeTarget = path.relative(parent, target);

  if (relativeTarget.length === 0 || relativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(relativeTarget)) {
    throw new Error('Project target must be a new directory directly inside the current working directory.');
  }

  return target;
}

export function assertTargetDirectoryIsAvailable(targetDirectory: string): void {
  if (!fs.existsSync(targetDirectory)) {
    return;
  }

  if (!fs.statSync(targetDirectory).isDirectory() || fs.readdirSync(targetDirectory).length > 0) {
    throw new Error(`Target directory already exists and is not empty: ${targetDirectory}`);
  }
}
