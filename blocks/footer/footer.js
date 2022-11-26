/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  block.innerHTML = `&copy; ${new Date().getFullYear()} Trio Holdriooo`;
}
