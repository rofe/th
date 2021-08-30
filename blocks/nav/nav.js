export default async function decorate($block) {
  if ($block.querySelector(':scope ul')) return; // avoid duplicate loading
  const $toggle = $block.appendChild(document.createElement('a'));
  const $nav = $block.appendChild(document.createElement('ul'));
  $toggle.classList.add('toggle');
  $toggle.setAttribute('href', '#');
  $toggle.setAttribute('title', 'Menü');
  $toggle.setAttribute('tabindex', 0);
  $toggle.addEventListener('click', (evt) => {
    evt.stopPropagation();
    $block.classList.toggle('open');
    $toggle.classList.toggle('selected');
  });
  fetch('/nav.json')
    .then((resp) => resp.json())
    .then(({ data }) => {
      data.forEach(({ title, url }) => {
        const $navLink = document.createElement('a');
        $navLink.textContent = title;
        $navLink.title = title;
        $navLink.href = url;
        if (url === window.location.pathname) {
          $navLink.classList.add('selected');
        }
        const $navItem = document.createElement('li');
        $navItem.append($navLink);
        $nav.append($navItem);
      });
    })
    .catch((e) => console.error('error loading nav', e));
  document.body.addEventListener('click', () => {
    $block.classList.remove('open');
    $toggle.classList.remove('selected');
  });
}
