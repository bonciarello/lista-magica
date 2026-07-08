<script>
  let { onexporttext, onexportmarkdown } = $props();
</script>

<section class="export-panel" aria-label="Esporta l'elenco">
  <h2 class="export-title">Esporta</h2>
  <p class="export-desc">Scarica l'elenco organizzato per sezioni.</p>
  <div class="export-buttons">
    <button class="btn-export btn-export-text" onclick={onexporttext}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      Esporta testo
      <span class="export-ext">.txt</span>
    </button>
    <button class="btn-export btn-export-md" onclick={onexportmarkdown}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      Esporta Markdown
      <span class="export-ext">.md</span>
    </button>
  </div>
</section>

<style>
  .export-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .export-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-ink);
    margin-bottom: var(--space-1);
  }

  .export-desc {
    font-size: var(--text-sm);
    color: var(--color-ink-light);
    margin-bottom: var(--space-3);
  }

  .export-buttons {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .btn-export {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 700;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 44px;
    border: 2px solid;
  }

  .btn-export-text {
    color: var(--color-sec-acqua);
    background: rgba(32, 201, 151, 0.08);
    border-color: rgba(32, 201, 151, 0.3);
  }

  .btn-export-text:hover {
    background: rgba(32, 201, 151, 0.15);
    border-color: var(--color-sec-acqua);
    transform: translateY(-1px);
  }

  .btn-export-md {
    color: var(--color-sec-viola);
    background: rgba(124, 92, 252, 0.08);
    border-color: rgba(124, 92, 252, 0.3);
  }

  .btn-export-md:hover {
    background: rgba(124, 92, 252, 0.15);
    border-color: var(--color-sec-viola);
    transform: translateY(-1px);
  }

  .export-ext {
    font-size: var(--text-xs);
    font-weight: 400;
    opacity: 0.7;
    background: rgba(0,0,0,0.06);
    padding: 1px 6px;
    border-radius: 4px;
  }

  @media (max-width: 640px) {
    .export-buttons {
      flex-direction: column;
    }
    .btn-export {
      width: 100%;
      justify-content: center;
    }
  }
</style>
