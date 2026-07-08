<script>
  let { item, ondragstart, ondragend, onremove, sectionColor = null } = $props();
</script>

<div
  class="card"
  class:has-color={sectionColor !== null}
  draggable="true"
  ondragstart={ondragstart}
  ondragend={ondragend}
  role="button"
  tabindex="0"
  aria-label="{item.text}. Trascinabile."
  style={sectionColor ? `--card-color: ${sectionColor}` : ''}
>
  <span class="card-grip" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
      <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
      <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
    </svg>
  </span>
  <span class="card-text">{item.text}</span>
  <button
    class="card-remove"
    onclick={onremove}
    aria-label="Rimuovi «{item.text}»"
    title="Rimuovi"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>

<style>
  .card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--color-ink);
    cursor: grab;
    user-select: none;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
    min-width: 140px;
    max-width: 280px;
    box-shadow: var(--shadow-card);
    position: relative;
  }

  .card.has-color {
    border-left-color: var(--card-color, var(--color-primary));
  }

  .card:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 1px;
  }

  .card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .card:active {
    cursor: grabbing;
    transform: translateY(0);
  }

  /* Dragging state */
  :global(.dragging) {
    opacity: 0.5;
    transform: rotate(2deg) scale(0.97);
  }

  .card-grip {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--color-ink-muted);
    opacity: 0.5;
    transition: opacity var(--transition-fast);
  }
  .card:hover .card-grip {
    opacity: 1;
  }

  .card-text {
    flex: 1;
    min-width: 0;
    word-break: break-word;
  }

  .card-remove {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-ink-muted);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
    margin-top: 1px;
  }
  .card:hover .card-remove,
  .card:focus-within .card-remove {
    opacity: 1;
  }
  .card-remove:hover {
    color: var(--color-danger);
    background: var(--color-danger-light);
  }

  @media (max-width: 640px) {
    .card {
      max-width: 100%;
      font-size: var(--text-base);
      padding: var(--space-3);
    }
    .card-remove {
      opacity: 1;
      width: 44px;
      height: 44px;
    }
  }
</style>
