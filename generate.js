/* eslint-disable */
const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, 'src', 'components', 'ui');

if (!fs.existsSync(UI_DIR)) {
  fs.mkdirSync(UI_DIR, { recursive: true });
}

function writeComponent(name, files) {
  const dir = path.join(UI_DIR, name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, filename), content.trim() + '\n');
  }
}

// Write the rest of components to save API calls
// Let me write a script that generates the rest of the 14 components.
