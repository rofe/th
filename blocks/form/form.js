import {
  readBlockConfig,
  toClassName,
} from '/scripts.js';

function submit(fields, recipient) {
  if (!recipient || !recipient.includes('@')) return;
  let body = `${fields.pop().value}\n\n`;
  body += 'Meine Angaben:\n';
  fields.forEach(($field) => body += `${$field.name}: ${$field.value}\n`);
  const params = new URLSearchParams();
  params.set('subject', 'Kontaktaufnahme Trio Holdriooo');
  params.set('body', body);
  window.location.href = `mailto:${encodeURIComponent(recipient)}?${params.toString()}`;
}

export default async function decorate($block) {
  const formName = $block.textContent.trim();
  $block.innerHTML = '';
  if (!formName) return;
  fetch(`/${formName}.json`)
    .then((resp) => resp.json())
    .then(({ data }) => {
      const fields = [];
      data.forEach(({ label, type, value }) => {
        const fieldId = toClassName(label);
        let $field;
        let $label = document.createElement('label');
        let recipient;
        $label.textContent = label;
        $label.for = fieldId;
        switch (type) {
          case 'textarea':
            $field = document.createElement('textarea');
            $field.name = label;
            $field.id = fieldId;
            fields.push($field);
            break;
          case 'submit':
            $field = document.createElement('button');
            $field.textContent = label;
            $field.title = label;
            $field.onclick = () => submit(fields, recipient);
            $label = null;
            break;
          case 'recipient':
            recipient = value;
            $label = null;
            $field = null;
            break;
          default: // input
            $field = document.createElement('input');
            $field.type = type;
            $field.name = label;
            $field.id = fieldId;
            fields.push($field);
        }
        if ($label) $block.append($label);
        if ($field) $block.append($field);
      });
    })
    .catch((e) => console.error('error loading form', e));
}