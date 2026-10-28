// Match mountain-climbing questions against the site's local content.
(() => {
  const DATA_FILES = ['mountaineering', 'guides', 'faqs', 'expeditions', 'destinations'];
  // Keep the scope narrow; generic words such as "rock" or "ice" are not enough on their own.
  const DOMAIN_TERMS = new Set([
    'mountain', 'mountaineer', 'climb', 'climber', 'alpine', 'alpinism', 'summit',
    'peak', 'expedition', 'glacier', 'crevasse', 'crampon', 'rope',
    'belay', 'avalanche', 'altitude', 'acclimat', 'bivouac',
    'ascent', 'descent', 'everest', 'denali', 'k2', 'aconcagua', 'kilimanjaro',
    'blanc', 'annapurna', 'himalaya', 'karakoram', 'hape', 'hace'
  ]);
  const SINGLE_TERM_TOPICS = new Set([
    'acclimat', 'altitude', 'avalanche', 'glacier', 'crevasse', 'crampon',
    'bivouac', 'mountaineer', 'everest', 'denali', 'k2', 'aconcagua', 'kilimanjaro',
    'annapurna', 'blanc', 'hape', 'hace'
  ]);
  const DOMAIN_PHRASES = [
    /\bice[- ]axe\b/i, /\bice[- ]climb/i, /\brock[- ]climb/i,
    /\broute[- ](planning|finding)\b/i, /\bsnow[- ](climb|travel|route)\b/i
  ];
  const LIVE_CONDITION_TERMS = new Set(['weather', 'forecast', 'condition', 'current', 'today', 'tomorrow', 'now', 'live']);
  const URGENT_TERMS = new Set([
    'emergency', 'stranded', 'lost', 'injured', 'injury', 'unconscious',
    'breathless', 'breathe', 'breathing', 'confusion', 'frostbite'
  ]);
  const STOP_WORDS = new Set([
    'about', 'after', 'and', 'are', 'can', 'could', 'did', 'does', 'for', 'from',
    'have', 'how', 'into', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please',
    'should', 'the', 'this', 'to', 'was', 'what', 'when', 'where', 'which', 'who',
    'why', 'with', 'would', 'you', 'your', 'ki', 'ka', 'ke', 'mein', 'se',
    'par', 'hai', 'hain', 'kaise', 'karun', 'karo'
  ]);
  const TOPIC_REFUSAL = 'I can only help with mountain climbing and mountaineering. Try asking about routes, climbing styles, altitude, gear, mountain safety, or climbing history.';
  const NO_MATCH = 'That is a climbing-related question, but I could not find a reliable answer in this site’s guides. Try asking about route planning, climbing skills, altitude, hazards, shelter, or mountain records.';
  const CLIMBING_DEFINITION = 'Mountain climbing, also called mountaineering, is the activity of travelling up and down mountains. Depending on the route, it can involve hiking, scrambling, rock or ice climbing, and glacier travel. Climbers plan for the terrain, build the right skills, check current conditions, and turn around when the risk is too high.';

  const panel = document.createElement('section');
  panel.className = 'mountain-assistant';
  panel.id = 'mountain-assistant';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'assistant-title');
  panel.setAttribute('aria-modal', 'false');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="assistant-header">
      <div><span class="assistant-kicker">YOUR CLIMBING COMPANION</span><h2 id="assistant-title">Mountain climbing assistant</h2></div>
      <button class="assistant-close" type="button" aria-label="Close mountain assistant">×</button>
    </header>
    <p class="assistant-disclaimer">Answers use this site’s climbing guides and data. No live conditions, medical diagnosis or emergency support.</p>
    <div class="assistant-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <div class="assistant-prompts" aria-label="Example mountain-climbing questions">
      <button type="button">How do I acclimatize?</button>
      <button type="button">What is alpine style?</button>
      <button type="button">How do I prepare for a high-altitude climb?</button>
    </div>
    <form class="assistant-form">
      <label class="assistant-visually-hidden" for="assistant-question">Ask a mountain-climbing question</label>
      <input id="assistant-question" name="question" type="text" maxlength="400" autocomplete="off" placeholder="Ask about mountain climbing…" required>
      <button type="submit" aria-label="Send question">Ask</button>
    </form>`;

  const launcher = document.createElement('button');
  launcher.className = 'assistant-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-controls', panel.id);
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-label', 'Open mountain climbing assistant');
  launcher.title = 'Open mountain climbing assistant';
  launcher.innerHTML = `
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle class="assistant-mascot-sky" cx="32" cy="32" r="30"/>
      <path class="assistant-mascot-mountain" d="m5 47 15-22 8 11 8-17 23 28H5Z"/>
      <path class="assistant-mascot-snow" d="m28 36 8-17 7 9-5-2-3 5-3-3-4 8Zm-15 9 7-11 5 7-4-2-2 3-2-2-2 5Z"/>
      <path class="assistant-mascot-body" d="M25 42a10 10 0 0 1 17-7 9 9 0 0 1 3 7v5H25v-5Z"/>
      <path class="assistant-mascot-face" d="M29 36a6.5 6.5 0 0 1 13 0v4a6.5 6.5 0 0 1-13 0v-4Z"/>
      <path class="assistant-mascot-helmet" d="M27 36a8.5 8.5 0 0 1 17 0H27Z"/>
      <path class="assistant-mascot-helmet-shade" d="M26 35h20a2 2 0 0 1-2 2H28a2 2 0 0 1-2-2Z"/>
      <circle class="assistant-mascot-eye" cx="33" cy="40" r="1"/>
      <circle class="assistant-mascot-eye" cx="39" cy="40" r="1"/>
      <path class="assistant-mascot-rope" d="m19 51 9-5m17 4-5-4"/>
      <path class="assistant-mascot-star" d="m15 17 1.5 3.5L20 22l-3.5 1.5L15 27l-1.5-3.5L10 22l3.5-1.5L15 17Zm35 7 1.1 2.4L54 27.5l-2.9 1.1L50 31l-1.1-2.4-2.4-1.1 2.4-1.1L50 24Z"/>
    </svg>`;
  document.body.append(panel, launcher);

  const messages = panel.querySelector('.assistant-messages');
  const input = panel.querySelector('#assistant-question');
  const form = panel.querySelector('.assistant-form');
  const submitButton = form.querySelector('button[type="submit"]');
  let knowledgePromise;
  let isAnswering = false;

  // Create messages as text nodes so both user questions and dataset answers stay inert.
  function addMessage(text, kind) {
    const bubble = document.createElement('article');
    bubble.className = `assistant-message assistant-message-${kind}`;
    const content = document.createElement('p');
    content.textContent = text;
    bubble.append(content);
    messages.append(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function normalizeToken(token) {
    const aliases = {
      climber: 'climb', climbers: 'climb', climbing: 'climb',
      mountaineering: 'mountaineer', mountaineers: 'mountaineer',
      acclimatization: 'acclimat', acclimatisation: 'acclimat',
      acclimatize: 'acclimat', acclimatise: 'acclimat',
      crampons: 'crampon', crevasses: 'crevasse', glaciers: 'glacier',
      expeditions: 'expedition', summits: 'summit', peaks: 'peak',
      routes: 'route', ropes: 'rope', avalanches: 'avalanche',
      mountains: 'mountain', ascents: 'ascent', descents: 'descent',
      pahad: 'mountain', paharon: 'mountain', pahadon: 'mountain',
      chadhai: 'climb', chadhna: 'climb', barf: 'snow', baraf: 'snow',
      unchai: 'altitude', rassi: 'rope', tayari: 'prepare', taiyari: 'prepare',
      preparation: 'prepare', prepared: 'prepare', preparing: 'prepare',
      injured: 'injury', injure: 'injury', stranded: 'stranded'
    };
    if (aliases[token]) return aliases[token];
    if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
    if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
    if (token.length > 4 && token.endsWith('s')) return token.slice(0, -1);
    return token;
  }

  function getTerms(value) {
    return new Set(
      (String(value || '').toLowerCase().match(/[a-z0-9]+/g) || [])
        .map(normalizeToken)
        .filter(token => (token.length > 2 || token === 'k2') && !STOP_WORDS.has(token))
    );
  }

  function isMountainTopic(question) {
    const terms = getTerms(question);
    return [...terms].some(term => DOMAIN_TERMS.has(term)) || DOMAIN_PHRASES.some(pattern => pattern.test(question));
  }

  function expandQuestionTerms(terms) {
    const expanded = new Set(terms);
    if (terms.has('acclimat')) ['altitude', 'ascent', 'gradual'].forEach(term => expanded.add(term));
    if (terms.has('altitude')) ['acclimat', 'ascent'].forEach(term => expanded.add(term));
    if (terms.has('avalanche')) ['snow', 'forecast', 'hazard'].forEach(term => expanded.add(term));
    return expanded;
  }

  function extractText(value, key = '') {
    if (value == null || ['image', 'credit', 'license', 'local', 'alt'].includes(key)) return [];
    if (typeof value === 'string' || typeof value === 'number') return [String(value)];
    if (Array.isArray(value)) return value.flatMap(item => extractText(item));
    if (typeof value === 'object') {
      return Object.entries(value).flatMap(([childKey, childValue]) => extractText(childValue, childKey));
    }
    return [];
  }

  function makeDocument(item, section, fallbackTitle) {
    const title = item.title || item.name || item.q || item.question || item.id || fallbackTitle;
    const text = item.a || item.text || item.overview || item.bio || item.description || '';
    const searchable = [title, item.category, item.role, item.q, item.question, ...extractText(item)].join(' ');
    return {
      title: String(title),
      section,
      text: String(text || extractText(item).filter(line => line !== String(title)).join(' · ')),
      terms: getTerms(searchable),
      titleTerms: getTerms(title)
    };
  }

  // Dataset shapes: mountaineering is grouped by section; the other files are arrays of records.
  async function loadKnowledge() {
    const entries = await Promise.all(DATA_FILES.map(async file => {
      const response = await fetch(`data/${file}.json`);
      if (!response.ok) throw new Error(`Could not load data/${file}.json (${response.status}).`);
      return [file, await response.json()];
    }));
    const documents = [];
    for (const [file, data] of entries) {
      if (file === 'faqs') {
        for (const item of data) {
          if (isMountainTopic(`${item.q} ${item.a}`)) documents.push(makeDocument(item, 'Mountain FAQ', item.q));
        }
      } else if (file === 'expeditions' || file === 'destinations' || Array.isArray(data)) {
        for (const item of data) documents.push(makeDocument(item, file === 'expeditions' ? 'Expedition profiles' : file === 'destinations' ? 'Mountain destinations' : 'Climbing guides', file));
      } else {
        for (const [section, items] of Object.entries(data)) {
          if (!Array.isArray(items)) continue;
          const label = section.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, letter => letter.toUpperCase());
          for (const item of items) documents.push(makeDocument(item, `Field guide · ${label}`, section));
        }
      }
    }
    return documents.filter(document => document.text.trim());
  }

  function answerQuestion(question, documents) {
    if (!isMountainTopic(question)) return { text: TOPIC_REFUSAL };
    const asksForDefinition = /\b(what is|what are|define|meaning of|matlab)\b/i.test(question)
      || /\b(kya|kia)\s+(hai|hoti|hota|hote)\b/i.test(question)
      || /\b(hai|hoti|hota|hote)\s+(kya|kia)\b/i.test(question);
    const questionTerms = getTerms(question);
    const isAboutClimbing = questionTerms.has('mountain')
      && (questionTerms.has('climb') || questionTerms.has('mountaineer'));
    if (asksForDefinition && isAboutClimbing) {
      return { text: CLIMBING_DEFINITION };
    }
    const originalTerms = getTerms(question);
    if ([...originalTerms].some(term => URGENT_TERMS.has(term))) {
      return { text: 'I can’t assess emergencies. If anyone is in immediate danger, contact local emergency services or mountain rescue now and follow their instructions. This website is not monitored for emergencies.' };
    }
    if ([...originalTerms].some(term => LIVE_CONDITION_TERMS.has(term))) {
      return { text: 'I can’t provide live mountain weather or current route conditions. Check the local mountain forecast and avalanche bulletin for your exact route; conditions can change quickly.' };
    }
    const terms = expandQuestionTerms(getTerms(question));
    const ranked = documents.map(document => {
      const matches = [...terms].filter(term => document.terms.has(term));
      const titleMatches = matches.filter(term => document.titleTerms.has(term));
      return { document, matches, score: matches.length + titleMatches.length * 2 };
    }).filter(result => result.matches.length >= 2
      || (terms.size <= 2 && result.matches.length === 1 && result.matches.some(term => SINGLE_TERM_TOPICS.has(term))))
      .sort((first, second) => second.score - first.score);

    const best = ranked[0];
    if (!best) return { text: NO_MATCH };
    const additional = ranked[1];
    const response = `${best.document.title}: ${best.document.text}`;
    const supplemental = additional && additional.score >= best.score * 0.75
      ? `\n\nRelated note — ${additional.document.title}: ${additional.document.text}`
      : '';
    return { text: `${response}${supplemental}` };
  }

  async function submitQuestion(rawQuestion) {
    const question = rawQuestion.trim();
    if (!question || isAnswering) return;
    isAnswering = true;
    addMessage(question, 'user');
    input.value = '';
    input.disabled = true;
    submitButton.disabled = true;
    const pending = addMessage('Checking the site’s mountain-climbing guides…', 'assistant');

    try {
      knowledgePromise ||= loadKnowledge();
      const answer = answerQuestion(question, await knowledgePromise);
      pending.remove();
      addMessage(answer.text, 'assistant');
    } catch (error) {
      knowledgePromise = null;
      console.error('Mountain assistant could not load its local climbing data.', error);
      pending.remove();
      addMessage('I could not load the site’s climbing information. Please check your connection to the website and try again.', 'assistant');
    } finally {
      isAnswering = false;
      input.disabled = false;
      submitButton.disabled = false;
      input.focus();
    }
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else launcher.focus();
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  panel.querySelector('.assistant-close').addEventListener('click', () => setOpen(false));
  panel.querySelectorAll('.assistant-prompts button').forEach(button => {
    button.addEventListener('click', () => submitQuestion(button.textContent));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    submitQuestion(input.value);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  addMessage('Ask me about mountain climbing. I answer only from the site’s local field guide, FAQs and route data.', 'assistant');
})();
