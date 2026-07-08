<script>
  import InputArea from './lib/InputArea.svelte';
  import Section from './lib/Section.svelte';
  import DraggableCard from './lib/DraggableCard.svelte';
  import ExportPanel from './lib/ExportPanel.svelte';
  import { parseBulletList, exportAsText as buildText, exportAsMarkdown as buildMarkdown } from './lib/parser.js';

  // --- Color palette for sections ---
  const SECTION_COLORS = [
    '#7C5CFC', '#4DABF7', '#20C997', '#51CF66',
    '#FFD43B', '#FF922B', '#FF6B6B', '#F783AC'
  ];

  // --- Unique ID ---
  let _nextId = 1;
  function uid() {
    return (_nextId++).toString();
  }

  // --- State ---
  let sections = $state([
    { id: uid(), name: 'Idee principali', color: '#7C5CFC' },
    { id: uid(), name: 'Da approfondire', color: '#FFD43B' },
    { id: uid(), name: 'Azioni', color: '#51CF66' },
  ]);
  let items = $state([]);
  let editingSectionId = $state(null);
  let dragOverSectionId = $state(null);

  // --- Derived ---
  let unassignedItems = $derived(items.filter(i => i.sectionId === null));
  let hasItems = $derived(items.length > 0);

  function getItemsForSection(sectionId) {
    return items.filter(i => i.sectionId === sectionId);
  }

  // --- Parsing ---
  function handleParse(text) {
    if (!text || !text.trim()) return;
    
    const newItems = parseBulletList(text).map(item => ({
      ...item,
      id: uid(),
    }));
    items = [...items, ...newItems];
  }

  function handleClearAll() {
    items = [];
    sections = [
      { id: uid(), name: 'Idee principali', color: '#7C5CFC' },
      { id: uid(), name: 'Da approfondire', color: '#FFD43B' },
      { id: uid(), name: 'Azioni', color: '#51CF66' },
    ];
  }

  // --- Item operations ---
  function moveItemToSection(itemId, sectionId) {
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.sectionId = sectionId;
    }
  }

  function removeItem(itemId) {
    items = items.filter(i => i.id !== itemId);
  }

  // --- Section operations ---
  function addSection() {
    const colorIdx = sections.length % SECTION_COLORS.length;
    const newSection = {
      id: uid(),
      name: 'Nuova sezione',
      color: SECTION_COLORS[colorIdx]
    };
    sections = [...sections, newSection];
    // Start editing the new section name
    editingSectionId = newSection.id;
  }

  function deleteSection(sectionId) {
    for (const item of items) {
      if (item.sectionId === sectionId) {
        item.sectionId = null;
      }
    }
    sections = sections.filter(s => s.id !== sectionId);
  }

  function renameSection(sectionId, name) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.name = name;
    editingSectionId = null;
  }

  function setSectionColor(sectionId, color) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.color = color;
  }

  function startEditing(sectionId) {
    editingSectionId = sectionId;
  }

  // --- Drag and drop ---
  function handleDragStart(e, itemId) {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    // Add dragging class after a tick for CSS
    requestAnimationFrame(() => {
      e.target.classList.add('dragging');
    });
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    dragOverSectionId = null;
  }

  function handleSectionDragOver(e, sectionId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSectionId !== sectionId) {
      dragOverSectionId = sectionId;
    }
  }

  function handleSectionDragLeave(e, sectionId) {
    // Only clear if we're truly leaving (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverSectionId === sectionId) {
        dragOverSectionId = null;
      }
    }
  }

  function handleSectionDrop(e, sectionId) {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      moveItemToSection(itemId, sectionId === 'unassigned' ? null : sectionId);
    }
    dragOverSectionId = null;
  }

  // --- Export ---
  function exportAsText() {
    const lines = [];
    
    for (const section of sections) {
      const sectionItems = items.filter(i => i.sectionId === section.id);
      if (sectionItems.length > 0) {
        lines.push(`— ${section.name} —`);
        for (const item of sectionItems) {
          lines.push(`  • ${item.text}`);
        }
        lines.push('');
      }
    }
    
    if (unassignedItems.length > 0) {
      lines.push('— Non assegnati —');
      for (const item of unassignedItems) {
        lines.push(`  • ${item.text}`);
      }
    }
    
    downloadFile(lines.join('\n'), 'lista-organizzata.txt', 'text/plain');
  }

  function exportAsMarkdown() {
    const lines = [];
    
    for (const section of sections) {
      const sectionItems = items.filter(i => i.sectionId === section.id);
      if (sectionItems.length > 0) {
        lines.push(`## ${section.name}`);
        lines.push('');
        for (const item of sectionItems) {
          lines.push(`- ${item.text}`);
        }
        lines.push('');
      }
    }
    
    if (unassignedItems.length > 0) {
      lines.push('## Non assegnati');
      lines.push('');
      for (const item of unassignedItems) {
        lines.push(`- ${item.text}`);
      }
    }
    
    downloadFile(lines.join('\n'), 'lista-organizzata.md', 'text/markdown');
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="app">
  <!-- Header -->
  <header class="header">
    <div class="header-inner">
      <div class="logo" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#7C5CFC"/>
          <path d="M10 10h7l2.5 3.5h7.5a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10a1.5 1.5 0 0 1-1.5-1.5v-11.5a1.5 1.5 0 0 1 1.5-1.5z" fill="#fff" opacity="0.9"/>
          <circle cx="13" cy="18" r="2" fill="#FFD43B"/>
          <circle cx="18" cy="18" r="2" fill="#51CF66"/>
          <circle cx="23" cy="18" r="2" fill="#FF6B6B"/>
        </svg>
      </div>
      <div>
        <h1 class="title">Lista Magica</h1>
        <p class="subtitle">Organizza i tuoi elenchi in sezioni trascinabili</p>
      </div>
      {#if hasItems}
        <button class="btn-clear" onclick={handleClearAll} aria-label="Cancella tutto e ricomincia">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          Ricomincia
        </button>
      {/if}
    </div>
  </header>

  <!-- Main -->
  <main class="main">
    <!-- Input Area -->
    <InputArea onparse={handleParse} />

    {#if hasItems}
      <!-- Unassigned pool -->
      <section
        class="pool"
        class:pool-dragover={dragOverSectionId === 'unassigned'}
        ondragover={(e) => handleSectionDragOver(e, 'unassigned')}
        ondragleave={(e) => handleSectionDragLeave(e, 'unassigned')}
        ondrop={(e) => handleSectionDrop(e, 'unassigned')}
        aria-label="Elementi non assegnati"
      >
        <h2 class="pool-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Da assegnare
          <span class="badge">{unassignedItems.length}</span>
        </h2>
        <div class="card-grid">
          {#each unassignedItems as item (item.id)}
            <DraggableCard
              {item}
              ondragstart={(e) => handleDragStart(e, item.id)}
              ondragend={handleDragEnd}
              onremove={() => removeItem(item.id)}
            />
          {/each}
        </div>
        {#if unassignedItems.length === 0}
          <p class="pool-empty">Trascina qui le schede per toglierle da una sezione</p>
        {/if}
      </section>

      <!-- Sections -->
      <div class="sections" role="list">
        {#each sections as section (section.id)}
          <Section
            {section}
            items={getItemsForSection(section.id)}
            isEditing={editingSectionId === section.id}
            isDragOver={dragOverSectionId === section.id}
            ondragover={(e) => handleSectionDragOver(e, section.id)}
            ondragleave={(e) => handleSectionDragLeave(e, section.id)}
            ondrop={(e) => handleSectionDrop(e, section.id)}
            ondragstart={(e, itemId) => handleDragStart(e, itemId)}
            ondragend={handleDragEnd}
            onremoveitem={(itemId) => removeItem(itemId)}
            onrename={(name) => renameSection(section.id, name)}
            ondelete={() => deleteSection(section.id)}
            onedit={() => startEditing(section.id)}
            onsetcolor={(color) => setSectionColor(section.id, color)}
          />
        {/each}
      </div>

      <!-- Add section button -->
      <button class="btn-add-section" onclick={addSection}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Nuova sezione
      </button>

      <!-- Export -->
      <ExportPanel
        onexporttext={exportAsText}
        onexportmarkdown={exportAsMarkdown}
      />
    {/if}
  </main>

  <!-- Footer -->
  <footer class="footer">
    <p>Lista Magica — tutto nel browser, niente server, niente account.</p>
  </footer>
</div>

<style>
  /* --- App Layout --- */
  .app {
    max-width: 780px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-4) var(--space-8);
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  /* --- Header --- */
  .header {
    margin-bottom: var(--space-6);
  }
  .header-inner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .logo {
    flex-shrink: 0;
  }
  .title {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-ink);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .subtitle {
    font-size: var(--text-sm);
    color: var(--color-ink-light);
    margin-top: 2px;
  }
  .btn-clear {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-ink-light);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 44px;
    min-width: 44px;
  }
  .btn-clear:hover {
    color: var(--color-danger);
    border-color: var(--color-danger);
    background: var(--color-danger-light);
  }

  /* --- Main --- */
  .main {
    flex: 1;
  }

  /* --- Unassigned Pool --- */
  .pool {
    background: var(--color-surface-alt);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }
  .pool-dragover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }
  .pool-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-ink);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    border-radius: 12px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-size: var(--text-xs);
    font-weight: 700;
    font-family: var(--font-body);
  }
  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .pool-empty {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-4);
  }

  /* --- Sections --- */
  .sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  /* --- Add section button --- */
  .btn-add-section {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-primary-light);
    border: 2px dashed var(--color-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 44px;
    margin-bottom: var(--space-6);
  }
  .btn-add-section:hover {
    background: #E4DEFC;
    border-style: solid;
  }

  /* --- Footer --- */
  .footer {
    margin-top: auto;
    padding-top: var(--space-6);
    text-align: center;
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
  }

  /* --- Responsive --- */
  @media (max-width: 640px) {
    .app {
      padding: var(--space-3) var(--space-3) var(--space-6);
    }
    .header-inner {
      gap: var(--space-2);
    }
    .title {
      font-size: var(--text-2xl);
    }
    .btn-clear {
      margin-left: 0;
      width: 100%;
      justify-content: center;
      margin-top: var(--space-2);
    }
  }
</style>
