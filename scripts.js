/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
 export function loadCSS(href) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    link.onload = () => {
    };
    link.onerror = () => {
    };
    document.head.appendChild(link);
  }
}

/**
 * Sanitizes a name for use as class name.
 * @param {*} name The unsanitized name
 * @returns {string} The class name
 */
 export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

/**
 * Wraps each section in an additional {@code div}.
 * @param {[Element]} $sections The sections
 */
 function wrapSections($sections) {
  $sections.forEach(($div) => {
    if (!$div.id) {
      const $wrapper = document.createElement('div');
      $wrapper.className = 'section-wrapper';
      $div.parentNode.appendChild($wrapper);
      $wrapper.appendChild($div);
    }
  });
}

export function addPublishDependencies(url) {
  if (!Array.isArray(url)) {
    // eslint-disable-next-line no-param-reassign
    url = [url];
  }
  window.hlx = window.hlx || {};
  if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
    window.hlx.dependencies.concat(url);
  } else {
    window.hlx.dependencies = url;
  }
}

/**
 * Decorates a block.
 * @param {Element} $block The block element
 */
 export function decorateBlock($block) {
  const classes = Array.from($block.classList.values());
  const blockName = classes[0];
  if (!blockName) return;
  const $section = $block.closest('.section-wrapper');
  if ($section) {
    $section.classList.add(`${blockName}-container`.replace(/--/g, '-'));
  }
  $block.classList.add('block');
  $block.setAttribute('data-block-name', blockName);
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} $main The container element
 */
function decorateBlocks($main) {
  $main
    .querySelectorAll('div.section-wrapper > div > div')
    .forEach(($block) => decorateBlock($block));
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} $block The block element
 */
export async function loadBlock($block) {
  const blockName = $block.getAttribute('data-block-name');
  try {
    const mod = await import(`/blocks/${blockName}/${blockName}.js`);
    if (mod.default) {
      await mod.default($block, blockName, document);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`failed to load module for ${blockName}`, err);
  }

  loadCSS(`/blocks/${blockName}/${blockName}.css`);
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} $main The container element
 */
async function loadBlocks($main) {
  $main
    .querySelectorAll('div.section-wrapper > div > .block')
    .forEach(async ($block) => loadBlock($block));
}

/**
 * Extracts the config from a block.
 * @param {Element} $block The block element
 * @returns {object} The block config
 */
 export function readBlockConfig($block) {
  const config = {};
  $block.querySelectorAll(':scope>div').forEach(($row) => {
    if ($row.children) {
      const $cols = [...$row.children];
      if ($cols[1]) {
        const $value = $cols[1];
        const name = toClassName($cols[0].textContent);
        let value = '';
        if ($value.querySelector('a')) {
          const $as = [...$value.querySelectorAll('a')];
          if ($as.length === 1) {
            value = $as[0].href;
          } else {
            value = $as.map(($a) => $a.href);
          }
        } else if ($value.querySelector('p')) {
          const $ps = [...$value.querySelectorAll('p')];
          if ($ps.length === 1) {
            value = $ps[0].textContent;
          } else {
            value = $ps.map(($p) => $p.textContent);
          }
        } else value = $row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Official Google WEBP detection.
 * @param {Function} callback The callback function
 */
 function checkWebpFeature(callback) {
  const webpSupport = sessionStorage.getItem('webpSupport');
  if (!webpSupport) {
    const kTestImages = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    const img = new Image();
    img.onload = () => {
      const result = (img.width > 0) && (img.height > 0);
      window.webpSupport = result;
      sessionStorage.setItem('webpSupport', result);
      callback();
    };
    img.onerror = () => {
      sessionStorage.setItem('webpSupport', false);
      window.webpSupport = false;
      callback();
    };
    img.src = `data:image/webp;base64,${kTestImages}`;
  } else {
    window.webpSupport = (webpSupport === 'true');
    callback();
  }
}

/**
 * Returns an image URL with optimization parameters
 * @param {string} url The image URL
 */
export function getOptimizedImageURL(src) {
  const url = new URL(src, window.location.href);
  let result = src;
  const { pathname, search } = url;
  if (pathname.includes('media_')) {
    const usp = new URLSearchParams(search);
    usp.delete('auto');
    if (!window.webpSupport) {
      if (pathname.endsWith('.png')) {
        usp.set('format', 'png');
      } else if (pathname.endsWith('.gif')) {
        usp.set('format', 'gif');
      } else {
        usp.set('format', 'pjpg');
      }
    } else {
      usp.set('format', 'webply');
    }
    result = `${src.split('?')[0]}?${usp.toString()}`;
  }
  return (result);
}

/**
 * Resets an elelemnt's attribute to the optimized image URL.
 * @see getOptimizedImageURL
 * @param {Element} $elem The element
 * @param {string} attrib The attribute
 */
function resetOptimizedImageURL($elem, attrib) {
  const src = $elem.getAttribute(attrib);
  if (src) {
    const oSrc = getOptimizedImageURL(src);
    if (oSrc !== src) {
      $elem.setAttribute(attrib, oSrc);
    }
  }
}

/**
 * WEBP Polyfill for older browser versions.
 * @param {Element} $elem The container element
 */
 export function webpPolyfill($elem) {
  if (!window.webpSupport) {
    $elem.querySelectorAll('img').forEach(($img) => {
      resetOptimizedImageURL($img, 'src');
    });
    $elem.querySelectorAll('picture source').forEach(($source) => {
      resetOptimizedImageURL($source, 'srcset');
    });
  }
}

/**
 * Turn leading image into a title section.
 * @param {Element} $main The main element
 */
function decorateHero($main) {
  const $headerImg = $main.querySelector(':scope>div:first-of-type>div>:first-child>picture>img');
  if ($headerImg) {
    const src = $headerImg.getAttribute('src');
    const $wrapper = $headerImg.closest('.section-wrapper');
    $wrapper.style.backgroundImage = `url(${src})`;
    $wrapper.classList.add('hero');
    if ($headerImg.alt) $wrapper.setAttribute('title', $headerImg.alt);
    $headerImg.parentNode.remove();
  }
}

function decorateLinks($main) {
  $main.querySelectorAll('a').forEach(($a) => {
    const href = $a.getAttribute('href');
    if (href === '#') {
      // check if link text is phone number
      const linkText = $a.textContent.trim().replace(/\s/g, '');
      if (/^\d{10}$/.test(linkText)) {
        $a.setAttribute('href', `tel:+41${linkText.substring(1)}`);
      }
    } else if (href.startsWith('http')) {
      try {
        const { hostname, pathname, search, hash } = new URL(href);
        if (hostname
          && (hostname.endsWith('trio-holdrioo.ch')
          || hostname.includes('th--rofe'))) {
          // use relative links
          $a.setAttribute('href', `${pathname}${search}${hash}`);
        }
      } catch (e) {
        // ignore
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} $main The main element
 */
function decorateMain($main) {
  wrapSections($main.querySelectorAll(':scope > div'));
  checkWebpFeature(() => {
    webpPolyfill($main);
  });
  decorateHero($main);
  decorateBlocks($main);
  $main.classList.add('ready');
}

/**
 * Sets the trigger for the LCP (Largest Contentful Paint) event.
 * @see https://web.dev/lcp/
 * @param {Document} doc The document
 * @param {Function} postLCP The callback function
 */
 function setLCPTrigger(doc, postLCP) {
  const $lcpCandidate = doc.querySelector('main > div:first-of-type img');
  if ($lcpCandidate) {
    if ($lcpCandidate.complete) {
      postLCP();
    } else {
      $lcpCandidate.addEventListener('load', () => {
        postLCP();
      });
      $lcpCandidate.addEventListener('error', () => {
        postLCP();
      });
    }
  } else {
    postLCP();
  }
}

function decorateHeader($header) {
  const $nav = document.createElement('div');
  $nav.className = 'nav block';
  $nav.setAttribute('data-block-name', 'nav');
  $header.prepend($nav);
}

function decorateFooter($footer) {
  $footer.innerHTML = `&copy; ${new Date().getFullYear()} Trio Holdriooo`;
}

async function loadNav($header) {
  await loadBlock($header.firstElementChild);
}

function decoratePage(win = window) {
  const doc = win.document;
  doc.documentElement.className = 'theme-2';
  doc.documentElement.setAttribute('lang', 'de');
  const $main = doc.querySelector('main');
  const $header = doc.querySelector('header');
  if ($header) {
    decorateHeader($header);
  }
  if ($main) {
    decorateMain($main);
    setLCPTrigger(doc, async () => {
      // post LCP actions go here
      await loadBlocks($main);
      await loadNav($header);
      decorateLinks($main);
      const $footer = doc.querySelector('footer');
      if ($footer) {
        decorateFooter($footer);
      }
      addPublishDependencies('/nav.json');
    });
  }
}

decoratePage(window);
