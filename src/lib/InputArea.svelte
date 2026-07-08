<script>
  let { onparse } = $props();

  let inputText = $state('');
  let showExamples = $state(true);

  function handleSubmit(e) {
    e.preventDefault();
    if (inputText.trim()) {
      onparse(inputText);
      inputText = '';
      showExamples = false;
    }
  }

  function handleKeydown(e) {
    // Ctrl+Enter / Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  }
</script>

<section class="input-area" aria-label="Incolla il tuo elenco">
  <form onsubmit={handleSubmit}>
    <label for="paste-input" class="input-label">
      Incolla qui il tuo elenco puntato
    </label>
    <p class="input-hint" id="paste-hint">
      Ogni riga diventa una scheda. Supporta trattini (-), asterischi (*) e numeri (1.)
    </p>
    <textarea
      id="paste-input"
      class="input-textarea"
      bind:value={inputText}
      onkeydown={handleKeydown}
      rows="6"
      placeholder="Incolla qui il tuo elenco…
Ad esempio:
- Comprare il pane
- Chiamare il dentista
- Finire la presentazione"
      aria-describedby="paste-hint"
    ></textarea>
    <div class="input-actions">
      <button type="submit" class="btn-parse" disabled={!inputText.trim()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        Analizza elenco
      </button>
      <span class="kb-hint" aria-hidden="true">Ctrl+Invio</span>
    </div>
  </form>

  {#if showExamples}
    <div class="examples" aria-label="Elenchi di esempio">
      <p class="examples-title">Prova con uno di questi:</p>
      <div class="examples-grid">
        <button
          class="example-chip"
          onclick={() => { onparse("Comprare latte e pane\nPortare auto dal meccanico\nChiamare Sara per cena\nFinire report Q2\nPrenotare biglietti cinema\nComprare regalo compleanno\nIscriversi in palestra\nOrdinare toner stampante\nPagare bolletta gas\nScaricare foto telefono"); showExamples = false; }}
        >
          📋 Lista commissioni
        </button>
        <button
          class="example-chip"
          onclick={() => { onparse("- Strutturare l'introduzione\n- Aggiungere grafici vendite\n- Citare le fonti principali\n- Controllare l'ortografia\n- Preparare slide riassuntiva\n- Stampare 5 copie\n- Provare il discorso ad alta voce\n- Inviare bozza al revisore\n- Confermare data presentazione\n- Preparare risposte a domande"); showExamples = false; }}
        >
          📝 Preparare presentazione
        </button>
      </div>
    </div>
  {/if}
</section>

<style>
  .input-area {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-6);
    box-shadow: var(--shadow-sm);
  }

  .input-label {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-ink);
    margin-bottom: var(--space-1);
  }

  .input-hint {
    font-size: var(--text-sm);
    color: var(--color-ink-light);
    margin-bottom: var(--space-3);
  }

  .input-textarea {
    width: 100%;
    min-height: 140px;
    padding: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.7;
    color: var(--color-ink);
    background: var(--color-paper);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    resize: vertical;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .input-textarea:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.15);
  }

  .input-textarea::placeholder {
    color: var(--color-ink-muted);
    opacity: 0.7;
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-3);
    flex-wrap: wrap;
  }

  .btn-parse {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: 700;
    color: #fff;
    background: var(--color-primary);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition-fast), transform var(--transition-fast);
    min-height: 44px;
    min-width: 44px;
  }

  .btn-parse:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .btn-parse:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-parse:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .kb-hint {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
    background: var(--color-surface-alt);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }

  /* --- Examples --- */
  .examples {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
  }

  .examples-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-ink-light);
    margin-bottom: var(--space-3);
  }

  .examples-grid {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .example-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-ink);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 44px;
  }

  .example-chip:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  @media (max-width: 640px) {
    .input-area {
      padding: var(--space-3);
    }
    .btn-parse {
      width: 100%;
      justify-content: center;
    }
    .kb-hint {
      display: none;
    }
  }
</style>
