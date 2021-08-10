export default async function decorate($block) {
  if ($block.querySelector(':scope ul')) return; // avoid duplicate loading
  const $nav = $block.appendChild(document.createElement('ul'));
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
}
