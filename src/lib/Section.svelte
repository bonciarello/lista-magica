<script>
  import DraggableCard from './DraggableCard.svelte';

  let {
    section = null,
    items = [],
    isEditing = false,
    isDragOver = false,
    ondragover,
    ondragleave,
    ondrop,
    ondragstart,
    ondragend,
    onremoveitem,
    onrename,
    ondelete,
    onedit,
    onsetcolor,
  } = $props();

  const SECTION_COLORS = [
    '#7C5CFC', '#4DABF7', '#20C997', '#51CF66',
    '#FFD43B', '#FF922B', '#FF6B6B', '#F783AC'
  ];

  let _editName = $state('');
  let showColorPicker = $state(false);
  let showDeleteConfirm = $state(false);

  $effect(() => {
    if (isEditing && section) {
      _editName = section.name;
    }
  });

  function handleRename(e) {
    e.preventDefault();
    const trimmed = _editName.trim();
    if (trimmed && trimmed !== section.name) {
      onrename(trimmed);
    } else if (trimmed) {
      onrename(trimmed); // Will trigger editingSectionId = null
    }
  }

  function handleEditKeydown(e) {
    if (e.key === 'Escape') {
      onrename(section.name); // Cancel edit
    }
  }

  function handleDelete() {
    showDeleteConfirm = false;
    ondelete();
  }

  function toggleColorPicker() {
    showColorPicker = !showColorPicker;
  }

  function selectColor(color) {
    onsetcolor(color);
    showColorPicker = false;
  }

  // Close color picker on outside click
  function handleColorPickerBlur(e) {
    // Delay to allow click on color swatch
    setTimeout(() => {
      if (showColorPicker) {
        showColorPicker = false;
      }
    }, 200);
  }
</script>

<section
  class="section"
  class:section-dragover={isDragOver}
  class:section-empty={items.length === 0}
  ondragover={ondragover}
  ondragleave={ondragleave}
  ondrop={ondrop}
  role="list"
  aria-label="Sezione: {section.name}"
  style="--sec-color: {section.color}"
>
  <!-- Section Header -->
  <div class="section-header">
    <div class="section-header-left">
      <span class="section-color-dot" style="background: {section.color}" aria-hidden="true"></span>
      
      {#if isEditing}
        <form onsubmit={handleRename} class="section-edit-form">
          <label for="rename-{section.id}" class="sr-only">Nome sezione</label>
          <input
            id="rename-{section.id}"
            class="section-edit-input"
            type="text"
            bind:value={_editName}
            onkeydown={handleEditKeydown}
            onblur={() => handleRename({ preventDefault: () => {} })}
            maxlength="40"
          />
        </form>
      {:else}
        <h3 class="section-name" ondblclick={onedit}>{section.name}</h3>
        <span class="section-count">{items.length}</span>
      {/if}
    </div>

    <div class="section-header-right">
      <!-- Color picker button -->
      <div class="color-picker-wrapper">
        <button
          class="section-btn"
          onclick={toggleColorPicker}
          onblur={handleColorPickerBlur}
          aria-label="Cambia colore sezione"
          title="Colore sezione"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        </button>
        {#if showColorPicker}
          <div class="color-picker-dropdown" role="listbox" aria-label="Scegli un colore">
            {#each SECTION_COLORS as color}
              <button
                class="color-swatch"
                class:color-swatch-active={color === section.color}
                style="background: {color}"
                onclick={() => selectColor(color)}
                role="option"
                aria-selected={color === section.color}
                aria-label="Colore {color}"
                title={color}
              ></button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Rename button -->
      <button
        class="section-btn"
        onclick={onedit}
        aria-label="Rinomina sezione «{section.name}»"
        title="Rinomina"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
      </button>

      <!-- Delete button -->
      {#if showDeleteConfirm}
        <span class="delete-confirm">
          <span class="delete-confirm-text">Sicuro?</span>
          <button class="section-btn section-btn-danger" onclick={handleDelete} aria-label="Conferma eliminazione">Sì</button>
          <button class="section-btn" onclick={() => showDeleteConfirm = false} aria-label="Annulla">No</button>
        </span>
      {:else}
        <button
          class="section-btn"
          onclick={() => showDeleteConfirm = true}
          aria-label="Elimina sezione «{section.name}»"
          title="Elimina"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Section items -->
  <div class="section-cards">
    {#each items as item (item.id)}
      <DraggableCard
        {item}
        sectionColor={section.color}
        ondragstart={(e) => ondragstart(e, item.id)}
        ondragend={ondragend}
        onremove={() => onremoveitem(item.id)}
      />
    {/each}
    {#if items.length === 0}
      <p class="section-drop-hint">Trascina qui le schede</p>
    {/if}
  </div>
</section>

<style>
  .section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    border-top: 4px solid var(--sec-color, var(--color-primary));
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    overflow: hidden;
  }

  .section-dragover {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.2);
    background: var(--color-primary-light);
  }

  .section-empty .section-cards {
    min-height: 56px;
  }

  /* --- Section Header --- */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-alt);
    border-bottom: 1px solid var(--color-border);
    min-height: 48px;
    flex-wrap: wrap;
  }

  .section-header-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1;
    min-width: 0;
  }

  .section-color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  }

  .section-name {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-ink);
    cursor: default;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 10px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-size: var(--text-xs);
    font-weight: 700;
    font-family: var(--font-body);
    flex-shrink: 0;
  }

  .section-edit-form {
    flex: 1;
    min-width: 0;
  }

  .section-edit-input {
    width: 100%;
    padding: 3px 8px;
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-ink);
    background: var(--color-surface);
    border: 1px solid var(--color-border-focus);
    border-radius: var(--radius-sm);
    outline: none;
  }

  .section-header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  /* --- Section buttons --- */
  .section-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--color-ink-light);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .section-btn:hover {
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-ink);
  }

  .section-btn-danger:hover {
    color: var(--color-danger);
    background: var(--color-danger-light);
    border-color: var(--color-danger);
  }

  /* --- Color picker --- */
  .color-picker-wrapper {
    position: relative;
  }

  .color-picker-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    display: flex;
    gap: 4px;
    padding: var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    margin-top: 4px;
  }

  .color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast);
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .color-swatch::after {
    content: '';
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: inherit;
    display: block;
  }

  .color-swatch:hover {
    transform: scale(1.15);
  }

  .color-swatch-active {
    border-color: var(--color-ink);
  }

  /* --- Delete confirm --- */
  .delete-confirm {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .delete-confirm-text {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-danger);
    white-space: nowrap;
    padding: 0 4px;
  }

  /* --- Section cards --- */
  .section-cards {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .section-drop-hint {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
    font-style: italic;
    width: 100%;
    text-align: center;
    padding: var(--space-2);
  }

  @media (max-width: 640px) {
    .section-header {
      padding: var(--space-2);
      gap: var(--space-1);
    }
    .section-cards {
      padding: var(--space-2);
      gap: var(--space-2);
    }
    .section-btn {
      width: 44px;
      height: 44px;
    }
    .color-swatch {
      min-width: 44px;
      min-height: 44px;
    }
  }
</style>
