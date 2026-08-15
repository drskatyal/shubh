import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { audioFromBlob, blobToBase64, fileInsteadLabel } from '../webAudio';

describe('web audio', () => {
  it('encodes a blob without naming a model', async () => {
    const blob = new Blob([Uint8Array.from([1, 2, 3, 4])], { type: 'audio/webm' });
    const audio = await audioFromBlob(blob);
    assert.equal(audio.mimeType, 'audio/webm');
    assert.equal(audio.base64, await blobToBase64(blob));
    assert.equal(fileInsteadLabel('hi'), 'फाइल से?');
    assert.doesNotMatch(fileInsteadLabel('en'), /gemini|openai|llm|chatbot/i);
  });
});
