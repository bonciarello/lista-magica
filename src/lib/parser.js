/**
 * Parser utility for bulleted lists.
 * Pure functions, no framework dependencies.
 */

/**
 * Parse raw text into an array of cleaned bullet items.
 * Supports: "- item", "* item", "• item", "1. item", "1) item", etc.
 */
export function parseBulletList(text) {
  if (!text || !text.trim()) return [];
  
  const lines = text.split(/\n/).filter(l => l.trim());
  return lines.map((line, idx) => {
    let cleaned = line
      .replace(/^[\s]*[-–—*•▪▸›»]\s*/, '')
      .replace(/^[\s]*\d+[.)]\s*/, '')
      .trim();
    if (!cleaned) cleaned = line.trim();
    return { id: String(idx), text: cleaned, sectionId: null };
  });
}

/**
 * Group items by section.
 */
export function groupBySection(items, sections) {
  const result = {};
  
  // Unassigned
  const unassigned = items.filter(i => i.sectionId === null);
  if (unassigned.length > 0) {
    result['_unassigned'] = unassigned;
  }
  
  for (const section of sections) {
    const sectionItems = items.filter(i => i.sectionId === section.id);
    if (sectionItems.length > 0) {
      result[section.name] = sectionItems;
    }
  }
  
  return result;
}

/**
 * Export grouped items as plain text.
 */
export function exportAsText(items, sections) {
  const grouped = groupBySection(items, sections);
  const lines = [];
  
  for (const [name, sectionItems] of Object.entries(grouped)) {
    const label = name === '_unassigned' ? 'Non assegnati' : name;
    lines.push(`— ${label} —`);
    for (const item of sectionItems) {
      lines.push(`  • ${item.text}`);
    }
    lines.push('');
  }
  
  return lines.join('\n').trim();
}

/**
 * Export grouped items as Markdown.
 */
export function exportAsMarkdown(items, sections) {
  const grouped = groupBySection(items, sections);
  const lines = [];
  
  for (const [name, sectionItems] of Object.entries(grouped)) {
    const label = name === '_unassigned' ? 'Non assegnati' : name;
    lines.push(`## ${label}`);
    lines.push('');
    for (const item of sectionItems) {
      lines.push(`- ${item.text}`);
    }
    lines.push('');
  }
  
  return lines.join('\n').trim();
}
