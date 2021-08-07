export default async function decorate($block) {
  const $nav = $block.appendChild(document.createElement('ul'));
  fetch('/nav.json')
    .then((resp) => resp.json())
    .then(({ data }) => {
      data.forEach(({ title, url }) => {
        const $navLink = document.createElement('a');
        $navLink.textContent = title;
        $navLink.href = url;
        const $navItem = document.createElement('li');
        $navItem.append($navLink);
        $nav.append($navItem);
      });
    })
    .catch((e) => console.error('error loading nav', e));
  $block.querySelectorAll('a').forEach(($a) => {
    if ($a.getAttribute('href') === window.location.pathname) {
      $a.classList.add('selected');
    }
  }); 
}
