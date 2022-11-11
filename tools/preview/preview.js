/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console */

// eslint-disable-next-line import/no-cycle
import {
  loadCSS,
  getMetadata,
} from '../../scripts.js';

async function adminService(action, currentURL) {
  let url = new URL(currentURL);
  if (url.hostname === 'localhost') {
    url = new URL(getMetadata('hlx:proxyUrl'));
  }
  let orr = url.hostname.split('.')[0].split('--');
  const method = action === 'status' ? 'GET' : 'POST';
  const suffix = action === 'status' ? '?editUrl=auto' : '';
  const adminURL = `http://admin.hlx.page/${action}/${orr[2]}/${orr[1]}/${orr[0]}${url.pathname}${suffix}`;
  const resp = await fetch(adminURL, { method });
  const json = await resp.json();
  return (json);
}

/**
 * Create Badge if a Page is enlisted in a Helix Experiment
 * @return {Object} returns a badge or empty string
 */
function createActions() {
  const div = document.createElement('div');
  div.className = 'hlx-actions hlx-badge';
  div.innerHTML = `Aktionen
    <span class="hlx-open"></span>
    <div class="hlx-popup hlx-hidden">
      <div class="hlx-variants">
        <div class="hlx-variant">
          <div class="hlx-button"><a id="hlx-actions-edit" href="#">Bearbeiten</a></div>
          <div class="hlx-button"><a id="hlx-actions-preview" href="#">Aktualisieren</a></div>
          <div class="hlx-button"><a id="hlx-actions-publish" href="#">Publizieren</a></div>
        </div>
      </div>
    </div>`;
  const popup = div.querySelector('.hlx-popup');
  const edit = div.querySelector('#hlx-actions-edit');
  const preview = div.querySelector('#hlx-actions-preview');
  const publish = div.querySelector('#hlx-actions-publish');

  div.addEventListener('click', () => {
    popup.classList.toggle('hlx-hidden');
  });

  edit.addEventListener('click', async (e) => {
    e.stopPropagation();
    const res = await adminService('status', window.location.href);
    window.open(res.edit.url, 'edit');
  });

  preview.addEventListener('click', async (e) => {
    e.stopPropagation();
    await adminService('preview', window.location.href);
    window.location.reload();
  });

  publish.addEventListener('click', async (e) => {
    e.stopPropagation();
    const res = await adminService('live', window.location.href);
    window.open(`https://embrew.co${res.webPath}`, 'website');
  });

  return div;
}

/**
 * Decorates Preview mode badges and overlays
 * @return {Object} returns a badge or empty string
 */
async function decoratePreviewMode() {
  loadCSS('/tools/preview/preview.css');
  const overlay = document.createElement('div');
  overlay.className = 'hlx-preview-overlay';
  overlay.append(createActions());
  document.body.append(overlay);
}

try {
  decoratePreviewMode();
} catch (e) {
  console.log(e);
}
