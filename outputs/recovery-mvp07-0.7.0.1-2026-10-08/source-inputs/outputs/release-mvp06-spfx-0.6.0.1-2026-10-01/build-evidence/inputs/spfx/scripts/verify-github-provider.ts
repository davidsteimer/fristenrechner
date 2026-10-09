// SPDX-License-Identifier: AGPL-3.0-only

import { PINNED_GITHUB_RELEASE_URL } from '../src/core/config';
import { GitHubReleaseProvider } from '../src/core/providers/GitHubReleaseProvider';
import { ReleaseValidator } from '../src/core/ReleaseValidator';

async function main(): Promise<void> {
  const provider = new GitHubReleaseProvider(PINNED_GITHUB_RELEASE_URL);
  const release = await new ReleaseValidator().validateProvider(provider);

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    providerId: provider.id,
    releaseId: release.releaseId,
    manifestSha256: release.manifestSha256,
    artifactCount: release.artifacts.length,
    artifacts: release.artifacts.map(artifact => ({
      path: artifact.descriptor.path,
      byteLength: artifact.bytes.byteLength,
      sha256: artifact.descriptor.sha256
    }))
  }, undefined, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
