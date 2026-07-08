import { describe, it, expect } from 'vitest';
import { parseBulletList, groupBySection, exportAsText, exportAsMarkdown } from '../src/lib/parser.js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '..', 'dist');
const PUBLIC = resolve(import.meta.dirname, '..', 'public');

// ============================================================
// Parser tests
// ============================================================
describe('parseBulletList', () => {
  it('should parse dash-prefixed items', () => {
    const input = '- Comprare il pane\n- Chiamare il dentista\n- Finire la presentazione';
    const result = parseBulletList(input);
    expect(result).toHaveLength(3);
    expect(result[0].text).toBe('Comprare il pane');
    expect(result[1].text).toBe('Chiamare il dentista');
    expect(result[2].text).toBe('Finire la presentazione');
  });

  it('should parse asterisk-prefixed items', () => {
    const input = '* Item uno\n* Item due\n* Item tre';
    const result = parseBulletList(input);
    expect(result).toHaveLength(3);
    expect(result[0].text).toBe('Item uno');
  });

  it('should parse numbered items', () => {
    const input = '1. Primo punto\n2. Secondo punto\n3) Terzo punto';
    const result = parseBulletList(input);
    expect(result).toHaveLength(3);
    expect(result[0].text).toBe('Primo punto');
    expect(result[1].text).toBe('Secondo punto');
    expect(result[2].text).toBe('Terzo punto');
  });

  it('should parse bullet character items', () => {
    const input = '• Punto uno\n• Punto due';
    const result = parseBulletList(input);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Punto uno');
  });

  it('should parse mixed markers', () => {
    const input = '- Item dash\n* Item star\n1. Item number\n• Item bullet\n   - Indented item';
    const result = parseBulletList(input);
    expect(result).toHaveLength(5);
    expect(result[3].text).toBe('Item bullet');
    expect(result[4].text).toBe('Indented item');
  });

  it('should handle items without markers as plain text', () => {
    const input = 'Solo testo\nAncora testo';
    const result = parseBulletList(input);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Solo testo');
    expect(result[1].text).toBe('Ancora testo');
  });

  it('should assign null sectionId to all items', () => {
    const input = '- A\n- B\n- C';
    const result = parseBulletList(input);
    expect(result.every(i => i.sectionId === null)).toBe(true);
  });

  it('should return empty array for empty input', () => {
    expect(parseBulletList('')).toEqual([]);
    expect(parseBulletList('   \n  \n  ')).toEqual([]);
    expect(parseBulletList(null)).toEqual([]);
  });

  it('should parse 10 items correctly (acceptance criterion 1)', () => {
    const input = [
      '- Comprare latte e pane',
      '- Portare auto dal meccanico',
      '- Chiamare Sara per cena',
      '- Finire report Q2',
      '- Prenotare biglietti cinema',
      '- Comprare regalo compleanno',
      '- Iscriversi in palestra',
      '- Ordinare toner stampante',
      '- Pagare bolletta gas',
      '- Scaricare foto telefono',
    ].join('\n');
    
    const result = parseBulletList(input);
    expect(result).toHaveLength(10);
    // Each should be a valid "card"
    for (const item of result) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('text');
      expect(item).toHaveProperty('sectionId', null);
      expect(item.text.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// groupBySection tests
// ============================================================
describe('groupBySection', () => {
  const sections = [
    { id: 's1', name: 'Urgente', color: '#FF6B6B' },
    { id: 's2', name: 'Dopo', color: '#4DABF7' },
  ];

  it('should group items by section', () => {
    const items = [
      { id: '1', text: 'A', sectionId: 's1' },
      { id: '2', text: 'B', sectionId: 's1' },
      { id: '3', text: 'C', sectionId: 's2' },
      { id: '4', text: 'D', sectionId: null },
    ];
    const grouped = groupBySection(items, sections);
    expect(grouped['Urgente']).toHaveLength(2);
    expect(grouped['Dopo']).toHaveLength(1);
    expect(grouped['_unassigned']).toHaveLength(1);
  });

  it('should skip sections with no items', () => {
    const items = [
      { id: '1', text: 'A', sectionId: 's1' },
    ];
    const grouped = groupBySection(items, sections);
    expect(grouped['Urgente']).toBeDefined();
    expect(grouped['Dopo']).toBeUndefined();
  });
});

// ============================================================
// Export tests
// ============================================================
describe('exportAsText', () => {
  const sections = [{ id: 's1', name: 'Importante', color: '#7C5CFC' }];

  it('should export items grouped by section', () => {
    const items = [
      { id: '1', text: 'Task 1', sectionId: 's1' },
      { id: '2', text: 'Task 2', sectionId: 's1' },
    ];
    const text = exportAsText(items, sections);
    expect(text).toContain('— Importante —');
    expect(text).toContain('• Task 1');
    expect(text).toContain('• Task 2');
  });

  it('should include unassigned items', () => {
    const items = [
      { id: '1', text: 'Floating', sectionId: null },
    ];
    const text = exportAsText(items, sections);
    expect(text).toContain('— Non assegnati —');
    expect(text).toContain('• Floating');
  });
});

describe('exportAsMarkdown', () => {
  const sections = [{ id: 's1', name: 'Importante', color: '#7C5CFC' }];

  it('should export as Markdown headings and lists', () => {
    const items = [
      { id: '1', text: 'Task 1', sectionId: 's1' },
      { id: '2', text: 'Task 2', sectionId: 's1' },
    ];
    const md = exportAsMarkdown(items, sections);
    expect(md).toContain('## Importante');
    expect(md).toContain('- Task 1');
    expect(md).toContain('- Task 2');
  });

  it('should include unassigned items in markdown', () => {
    const items = [
      { id: '1', text: 'Orphan', sectionId: null },
    ];
    const md = exportAsMarkdown(items, sections);
    expect(md).toContain('## Non assegnati');
    expect(md).toContain('- Orphan');
  });
});

// ============================================================
// Build output tests
// ============================================================
describe('Build output', () => {
  it('should produce index.html', () => {
    expect(existsSync(resolve(DIST, 'index.html'))).toBe(true);
  });

  it('should have no absolute paths in index.html', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
    // No src or href starting with "/" (that aren't part of "https://")
    const absoluteAssetPaths = html.match(/(?:src|href)="\/(?!\/)/g);
    expect(absoluteAssetPaths).toBeNull();
  });

  it('should use relative paths for assets', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('src="./assets/');
    expect(html).toContain('href="./assets/');
  });

  it('should have canonical link', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('https://cristianporco.it/app/lista-magica/');
  });

  it('should have Open Graph tags', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
    expect(html).toContain('og:url');
    expect(html).toContain('og:type');
  });

  it('should have JSON-LD structured data', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('WebApplication');
  });

  it('should have exactly one h1', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
    // The built Svelte app has the h1 rendered by JS, so it won't be in the static HTML.
    // Instead, verify the source has exactly one <h1>
    const appSource = readFileSync(resolve(import.meta.dirname, '..', 'src', 'App.svelte'), 'utf-8');
    const h1Matches = appSource.match(/<h1/g);
    expect(h1Matches).not.toBeNull();
    expect(h1Matches.length).toBe(1);
  });
});

// ============================================================
// SEO files tests
// ============================================================
describe('SEO files', () => {
  it('should have robots.txt', () => {
    expect(existsSync(resolve(PUBLIC, 'robots.txt'))).toBe(true);
  });

  it('robots.txt should reference sitemap', () => {
    const robots = readFileSync(resolve(PUBLIC, 'robots.txt'), 'utf-8');
    expect(robots).toContain('Sitemap:');
    expect(robots).toContain('lista-magica');
  });

  it('should have sitemap.xml', () => {
    expect(existsSync(resolve(PUBLIC, 'sitemap.xml'))).toBe(true);
  });

  it('sitemap.xml should have the canonical URL', () => {
    const sitemap = readFileSync(resolve(PUBLIC, 'sitemap.xml'), 'utf-8');
    expect(sitemap).toContain('https://cristianporco.it/app/lista-magica/');
  });

  it('should have favicon.svg', () => {
    expect(existsSync(resolve(PUBLIC, 'favicon.svg'))).toBe(true);
  });
});
