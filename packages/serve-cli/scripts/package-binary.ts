// tsx package-binary.ts [platform] [arch]

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';

const platform = (process.argv[2] || os.platform()).toLowerCase();
const arch = (process.argv[3] || os.arch()).toLowerCase();

const isDarwin = platform.includes('darwin') || platform.includes('macos');
const isWindows = platform.includes('windows');
const isLinux = platform.includes('linux');
if (!isDarwin && !isWindows && !isLinux) {
  throw new Error(`Unsupported platform ${platform}`);
}

const dest = 'mesh-serve' + (isWindows ? '.exe' : '');

console.log(`Packaging binary with Node SEA for ${platform}-${arch} to ${dest}`);

console.log('Generating blob');
execSync(`node --experimental-sea-config sea-config.json`);

console.log(`Using node from ${process.execPath}`);
await fs.copyFile(process.execPath, dest);

console.log('Injecting blob');
if (isWindows) {
  execSync(`npx postject ${dest} NODE_SEA_BLOB sea-prep.blob ^
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`);
} else if (isDarwin) {
  execSync(`npx postject ${dest} NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA`);
} else {
  execSync(`npx postject ${dest} NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`);
}

console.log('Signing binary');
if (isDarwin) {
  execSync(`codesign --remove-signature ${dest}`);
  execSync(`codesign --sign - ${dest}`);
} else if (isWindows) {
  execSync(`signtool remove /s ${dest}`);
  execSync(`signtool sign /fd SHA256 ${dest}`);
} else {
  console.warn('Signing skipped because unsupported platform');
}

if (isDarwin || isLinux) {
  console.log('Setting exec permissions');
  execSync(`chmod +x ${dest}`);
}

console.log('Done');
