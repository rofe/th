/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global window */
/* eslint-disable import/named, import/extensions */

// 'open.spotify.com' returns 'spotify'
function getServer(url) {
  const l = url.hostname.lastIndexOf('.');
  return url.hostname.substring(url.hostname.lastIndexOf('.', l - 1) + 1, l);
}

function getDefaultEmbed(url) {
  return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;
}

function embedYoutube(url) {
  const usp = new URLSearchParams(url.search);
  const vid = usp.get('v');
  const embed = url.pathname;
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 74%;">
    <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&amp;v=${vid}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" title="Content from Youtube" loading="lazy"></iframe>
  </div>`;
  return embedHTML;
}

function embedInstagram(url) {
  const location = window.location.href;
  const src = `${url.origin}${url.pathname}${url.pathname.charAt(url.pathname.length - 1) === '/' ? '' : '/'}embed/?cr=1&amp;v=13&amp;wp=1316&amp;rd=${location.endsWith('.html') ? location : `${location}.html`}`;
  const embedHTML = `<div style="width: 100%; position: relative; padding-bottom: 56.25%; display: flex; justify-content: center">
    <iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="${src}"
      allowtransparency="true" allowfullscreen="true" frameborder="0" height="530" style="background: white; border-radius: 3px; border: 1px solid rgb(219, 219, 219);
      box-shadow: none; display: block;">
    </iframe>
  </div>`;
  return embedHTML;
}

const EMBEDS_CONFIG = {
  'www.youtube.com': {
    type: 'youtube',
    embed: embedYoutube,
  },
  'youtu.be': {
    type: 'youtube',
    embed: embedYoutube,
  },
  'www.instagram.com': {
    type: '',
    embed: embedInstagram,
  },
};

const LOAD_DELAY = 3000;

function decorateBlockEmbeds($block) {
  $block.querySelectorAll('.embed.block a[href]').forEach(($a) => {
    const url = new URL($a.href.replace(/\/$/, ''));
    const config = EMBEDS_CONFIG[url.hostname];
    $block.innerHTML = '';
    if (config) {
      $block.className = `block embed embed-${config.type}`;
      setTimeout(() => {
        const html = config.embed(url);
        $block.innerHTML = html;
      }, LOAD_DELAY);
    } else {
      $block.className = `block embed embed-${getServer(url)}`;
      setTimeout(() => {
        $block.innerHTML = getDefaultEmbed(url);
      }, LOAD_DELAY);
    }
  });
}

export default function decorate($block) {
  decorateBlockEmbeds($block);
}
