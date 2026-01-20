#!/usr/bin/env node

/**
 * Renders a Handlebars YAML template using a values YAML file.
 * Usage:
 *   node scripts/render.js templates/config.hbs.yaml values/values.yaml dist/config.yaml
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const yaml = require('js-yaml');

function die(msg) { console.error(msg); process.exit(1); }

const [ , , templatePath, valuesPath, outPath ] = process.argv;
if (!templatePath || !valuesPath || !outPath) {
  die('Usage: node scripts/render.js <template.hbs.yaml> <values.yaml> <out.yaml>');
}

try {
  const tpl = fs.readFileSync(templatePath, 'utf8');
  const raw = fs.readFileSync(valuesPath, 'utf8');
  const context = yaml.load(raw); // turn YAML into a JS object

  // Register a few handy helpers (optional)
  Handlebars.registerHelper('json', (obj) => JSON.stringify(obj));
  Handlebars.registerHelper('upper', (str) => String(str).toUpperCase());
  Handlebars.registerHelper('lower', (str) => String(str).toLowerCase());

  const compiled = Handlebars.compile(tpl, { noEscape: true });
  const output = compiled(context);

  // Basic YAML sanity check: parse and re-emit to ensure valid YAML
  const validated = yaml.dump(yaml.load(output), { lineWidth: -1 });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, validated, 'utf8');
  console.log(`Rendered -> ${outPath}`);
} catch (err) {
  console.error(err);
  process.exit(2);
}
