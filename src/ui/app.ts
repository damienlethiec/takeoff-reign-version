// The UI controller: title, game, ending and archive screens, plus dialogs (Learn more, menu).
// String templates, every dynamic string escaped. The engine is pure; this file owns time and the DOM.

import { CHARACTERS } from '../data/characters';
import { EARLY_ENDINGS, ENDING_BY_ID, ENDINGS, FINAL_ENDINGS, WORLD_NAMES } from '../data/endings';
import { activeGoals, completedGoals, GOALS } from '../data/goals';
import { SOURCES } from '../data/sources';
import { TUNING } from '../data/tuning';
import { answer, newGame, readLearn, result, view } from '../engine';
import { dateLabel } from '../engine/rules';
import type { CardView, EndingResult, GameState, GaugeId, Mark, Side } from '../engine/types';
import { GAUGES } from '../engine/types';
import { $, esc, extLink } from './html';
import { gaugeIcon, portrait, portraitBg } from './portraits';
import { emptyMeta, loadMeta, saveMeta, type Meta } from './storage';

export const GAUGE_NAME: Record<GaugeId, string> = { labs: 'Labs', citizens: 'Citizens', allies: 'Allies', oversight: 'Oversight' };
const GAUGE_HINT: Record<GaugeId, string> = {
  labs: 'the weight of AI companies in Europe',
  citizens: 'how mobilised the public is on AI',
  allies: 'how close Europe is to Washington and Beijing',
  oversight: 'Europe’s capacity to see what AI systems do',
};
const sizeWord = (m: Mark) => (m.size === 'large' ? 'a lot' : 'a little');
export const marksText = (marks: Mark[]) => (marks.length ? `Will change: ${marks.map((m) => `${GAUGE_NAME[m.gauge]} ${sizeWord(m)}`).join(', ')}.` : 'Changes nothing you can see.');

/** "Labs up a lot, +12. Allies down a little, −5." */
export function changesText(prev: GameState, next: GameState): string {
  const parts = GAUGES.filter((g) => Math.round(next.gauges[g]) !== Math.round(prev.gauges[g])).map((g) => {
    const d = Math.round(next.gauges[g] - prev.gauges[g]);
    return `${GAUGE_NAME[g]} ${d > 0 ? 'up' : 'down'} ${Math.abs(d) >= TUNING.largeMark ? 'a lot' : 'a little'}, ${d > 0 ? '+' : '−'}${Math.abs(d)}.`;
  });
  return parts.length ? parts.join(' ') : 'Nothing you can see moved.';
}

type Screen = 'title' | 'game' | 'ending' | 'archive';
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export class App {
  meta: Meta;
  state?: GameState;
  screen: Screen = 'title';
  selected: Side | null = null;
  busy = false;
  lastResult?: { result: EndingResult; newGoals: string[]; endMonth: number };
  private overlay?: { el: HTMLElement; returnTo: HTMLElement | null };
  private drag?: { id: number; x0: number; dx: number; moved: boolean };
  private fixedSeed?: number;
  private noTutorial = false;
  private seedStep = 0;

  constructor(private root: HTMLElement) {
    this.meta = loadMeta();
    const q = new URLSearchParams(window.location.search);
    if (q.has('seed')) this.fixedSeed = Number(q.get('seed')) || 1;
    this.noTutorial = q.has('notutorial');
    if (q.has('fresh')) this.meta = emptyMeta();
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  boot(): void {
    this.showTitle();
  }

  // ------------------------------------------------------------------ title
  showTitle(focus = true): void {
    this.screen = 'title';
    this.root.dataset.screen = 'title';
    const envoy = this.meta.runs + 1;
    const reached = new Set(this.meta.endings).size;
    this.root.innerHTML = `
      <main class="title-screen" aria-labelledby="title-h">
        <div class="title-card">
          <h1 id="title-h" tabindex="-1"><span class="t-main">Takeoff</span><span class="t-sub">Reign version</span></h1>
          <p class="lede">You are the EU’s AI Envoy. People bring you requests, one at a time: answer left or right. Keep four forces in balance until AI reaches its tipping point, or the end of 2030.</p>
          <button class="btn primary" data-act="start">Start your term as Envoy #${envoy}</button>
          ${this.goalsHtml('title-goals')}
          <div class="title-links">
            <button class="btn" data-act="archive">Archive: ${reached} of ${ENDINGS.length} endings</button>
            <button class="btn" data-act="help">How to play</button>
          </div>
          <p class="fiction">OpenBrain, DeepCent and every event after 2026 are fiction, drawn from the AI 2027 scenario and CFG’s <i>Advanced AI: Possible Futures</i>. Real facts behind the cards cite their sources.</p>
        </div>
      </main>`;
    this.wire();
    if (focus) $<HTMLElement>('#title-h', this.root)?.focus();
  }

  private goalsHtml(id: string): string {
    const goals = activeGoals(this.meta.goals);
    const done = this.meta.goals.length;
    if (!goals.length) return `<section class="goals" aria-labelledby="${id}"><h2 id="${id}">Goals</h2><p>Every goal completed. Every card is in the deck.</p></section>`;
    return `<section class="goals" aria-labelledby="${id}">
      <h2 id="${id}">Goals <span class="goals-count">${done} of ${GOALS.length} done</span></h2>
      <ul>${goals.map((g) => `<li><span class="goal-text">${esc(g.text)}</span><span class="goal-unlock">Unlocks: ${esc(g.unlocks)}</span></li>`).join('')}</ul>
    </section>`;
  }

  // ------------------------------------------------------------------ game
  startRun(): void {
    this.meta.runs += 1;
    saveMeta(this.meta);
    const seed = this.fixedSeed !== undefined ? this.fixedSeed + this.seedStep++ : Math.floor(Math.random() * 2 ** 31);
    const tutorial = !this.meta.tutorialDone && !this.noTutorial;
    this.state = newGame({ seed, run: this.meta.runs, unlocked: this.meta.goals, tutorial });
    this.enterGame();
  }

  /** Builds the game screen around the current state (a new run, or back from the archive). */
  private enterGame(): void {
    if (!this.state) return;
    this.selected = null;
    this.screen = 'game';
    this.root.dataset.screen = 'game';
    this.root.innerHTML = `
      <div class="game">
        <header class="hud">
          <h1 class="visually-hidden">Takeoff, Envoy #${this.state.run}</h1>
          <ul class="gauges" aria-label="Gauges">
            ${GAUGES.map(
              (g) => `<li class="gauge" data-g="${g}" title="${esc(`${GAUGE_NAME[g]}: ${GAUGE_HINT[g]}`)}">
                <span class="g-tube" aria-hidden="true"><span class="g-fill"></span><span class="g-ico g-ico-ink">${gaugeIcon(g)}</span><span class="g-ico g-ico-lit">${gaugeIcon(g)}</span></span>
                <span class="g-label"><span class="g-name">${GAUGE_NAME[g]}</span><span class="g-val">50</span></span>
                <span class="g-mark" aria-hidden="true"></span>
                <span class="g-delta" aria-hidden="true"></span>
              </li>`,
            ).join('')}
          </ul>
          <div class="timeline">
            <p class="date"><span class="visually-hidden">Date: </span><span id="date">January 2027</span></p>
            <p class="envoy">Envoy #${this.state.run}</p>
            <button class="btn small" data-act="menu" aria-haspopup="dialog">Menu</button>
          </div>
          <div class="progress-row">
            <span class="p-label" id="p-label">AI progress</span>
            <div class="progress" role="progressbar" aria-labelledby="p-label" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="p-fill"></span></div>
          </div>
        </header>
        <main class="stage" aria-label="The current request">
          <div class="card-slot" id="card-slot"></div>
          <p class="who" id="card-who"></p>
          <div class="answers" id="answers"></div>
          <p class="keys" id="keys">Keys: <kbd>←</kbd> or <kbd>→</kbd> to pick a side, <kbd>Enter</kbd> to confirm, <kbd>Esc</kbd> to cancel.</p>
          <p class="said" id="said" aria-live="polite"></p>
        </main>
        <aside class="side" aria-label="Goals and help">
          ${this.goalsHtml('side-goals')}
          <button class="btn" data-act="archive-from-game">Archive</button>
        </aside>
      </div>`;
    this.wire();
    this.updateHud();
    this.renderCard();
    $<HTMLElement>('#card', this.root)?.focus();
  }

  private updateHud(prev?: GameState): void {
    const s = this.state!;
    for (const g of GAUGES) {
      const li = $<HTMLElement>(`.gauge[data-g="${g}"]`, this.root)!;
      const v = Math.round(s.gauges[g]);
      li.style.setProperty('--fill', `${v}%`);
      $('.g-val', li)!.textContent = String(v);
      li.setAttribute('aria-label', `${GAUGE_NAME[g]}: ${v} out of 100`);
      li.classList.toggle('danger', v <= 15 || v >= 85);
      const delta = $('.g-delta', li)!;
      delta.className = 'g-delta';
      delta.textContent = '';
      if (prev) {
        const d = Math.round(s.gauges[g] - prev.gauges[g]);
        if (d) {
          delta.textContent = `${d > 0 ? '+' : '−'}${Math.abs(d)}`;
          void delta.offsetWidth;
          delta.className = `g-delta show ${d > 0 ? 'up' : 'down'}`;
        }
      }
    }
    $('#date', this.root)!.textContent = dateLabel(s.month);
    const p = Math.min(100, Math.round(s.progress));
    const bar = $<HTMLElement>('.progress', this.root)!;
    bar.setAttribute('aria-valuenow', String(p));
    bar.setAttribute('aria-valuetext', p >= 100 ? 'AI progress: tipping point reached' : `AI progress: ${p} percent of the way to the tipping point`);
    bar.style.setProperty('--p', `${p}%`);
  }

  private renderCard(): void {
    const s = this.state!;
    const v = view(s);
    const c = CHARACTERS[v.who];
    const slot = $('#card-slot', this.root)!;
    const kindLabel: Partial<Record<CardView['kind'], string>> = { news: 'News', review: 'Year in review', tutorial: 'Tutorial', followup: 'Follow-up', tipping: 'The tipping point', final: 'The decisive moment' };
    slot.innerHTML = `
      <article id="card" class="card kind-${v.kind}" tabindex="-1" aria-labelledby="${kindLabel[v.kind] ? 'card-kind ' : ''}card-who card-text">
        <div class="lean lean-left" aria-hidden="true">${esc(v.left.label)}</div>
        ${v.right ? `<div class="lean lean-right" aria-hidden="true">${esc(v.right.label)}</div>` : ''}
        <div class="portrait-wrap" style="background:${portraitBg(v.who)}">${portrait(v.who)}</div>
        ${kindLabel[v.kind] ? `<p id="card-kind" class="card-kind">${esc(kindLabel[v.kind])}</p>` : ''}
        <p id="card-text" class="card-text">${esc(v.text)}</p>
        ${v.learn ? '<button class="learn-btn" data-act="learn" aria-label="Learn more: the fact behind this card" aria-haspopup="dialog"><span aria-hidden="true">i</span></button>' : ''}
      </article>`;
    $('#card-who', this.root)!.innerHTML = `<strong>${esc(c.name)}</strong><span class="role">${esc(c.role)}</span>`;
    const btn = (side: Side, a: { label: string; marks: Mark[] }) =>
      `<button class="answer answer-${side}" data-side="${side}" aria-pressed="false" aria-label="${esc(`${a.label}. ${v.right ? marksText(a.marks) : ''}`.trim())}">
        ${side === 'left' && v.right ? '<span class="arrow" aria-hidden="true">←</span>' : ''}<span class="a-label">${esc(a.label)}</span>${side === 'right' ? '<span class="arrow" aria-hidden="true">→</span>' : ''}
      </button>`;
    $('#answers', this.root)!.innerHTML = v.right ? btn('left', v.left) + btn('right', v.right) : btn('right', v.left).replace('answer-right', 'answer-right answer-only');
    $('#keys', this.root)!.innerHTML = v.right
      ? 'Keys: <kbd>←</kbd> or <kbd>→</kbd> to pick a side, <kbd>Enter</kbd> to confirm, <kbd>Esc</kbd> to cancel.'
      : 'Keys: <kbd>Enter</kbd> or <kbd>→</kbd> to continue.';
    this.selected = null;
    this.showMarks(null);
    const card = $<HTMLElement>('#card', this.root)!;
    card.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    card.addEventListener('pointermove', (e) => this.onPointerMove(e));
    card.addEventListener('pointerup', (e) => this.onPointerUp(e));
    card.addEventListener('pointercancel', () => this.resetDrag());
    for (const b of this.root.querySelectorAll<HTMLButtonElement>('.answer')) b.addEventListener('click', () => this.onAnswerClick(b.dataset.side as Side));
    $('.learn-btn', card)?.addEventListener('click', (e) => this.openLearn(e.currentTarget as HTMLElement));
    card.classList.add('enter');
    window.setTimeout(() => card.classList.remove('enter'), 20);
  }

  /** The two-step answer: the first click previews, a second click on the same answer confirms. */
  private onAnswerClick(side: Side): void {
    if (this.busy) return;
    const v = view(this.state!);
    if (!v.right) return this.confirm('left');
    if (this.selected === side) return this.confirm(side);
    this.select(side);
  }

  private answerFor(side: Side) {
    const v = view(this.state!);
    return side === 'right' && v.right ? v.right : v.left;
  }

  select(side: Side | null, announce = true): void {
    const v = view(this.state!);
    if (!v.right) side = side ? 'right' : null;
    this.selected = side;
    const card = $<HTMLElement>('#card', this.root);
    for (const b of this.root.querySelectorAll<HTMLButtonElement>('.answer')) b.setAttribute('aria-pressed', String(!!side && b.dataset.side === side));
    card?.classList.remove('lean-l', 'lean-r');
    if (side && v.right) card?.classList.add(side === 'left' ? 'lean-l' : 'lean-r');
    card?.style.removeProperty('--dx');
    card?.style.removeProperty('--rot');
    this.showMarks(side && v.right ? this.answerFor(side).marks : null);
    if (announce && side && v.right) {
      const a = this.answerFor(side);
      this.say(`Selected: ${a.label}. ${marksText(a.marks)} Press again or Enter to confirm, Escape to cancel.`);
    } else if (announce && !side) this.say('Choice cancelled.');
  }

  private showMarks(marks: Mark[] | null): void {
    for (const g of GAUGES) {
      const el = $(`.gauge[data-g="${g}"] .g-mark`, this.root);
      if (!el) continue;
      const m = marks?.find((x) => x.gauge === g);
      el.className = `g-mark${m ? ` on ${m.size}` : ''}`;
    }
  }

  confirm(side: Side): void {
    if (this.busy || !this.state || this.state.phase === 'over') return;
    this.busy = true;
    const prev = this.state;
    const next = answer(prev, side);
    const card = $<HTMLElement>('#card', this.root);
    const twoSided = !!view(prev).right;
    const out = reducedMotion() ? 'out-fade' : twoSided ? (side === 'left' ? 'out-left' : 'out-right') : 'out-up';
    const slot = $<HTMLElement>('#card-slot', this.root);
    if (slot && card) slot.style.minHeight = `${card.offsetHeight}px`;
    card?.classList.add(out);
    window.setTimeout(
      () => {
        this.busy = false;
        this.state = next;
        if (next.phase === 'over') return this.finishRun(prev);
        if (prev.current === 'tu_hidden') {
          this.meta.tutorialDone = true;
          saveMeta(this.meta);
        }
        this.renderCard();
        $<HTMLElement>('#card-slot', this.root)?.style.removeProperty('min-height');
        this.updateHud(prev);
        const moved = changesText(prev, next);
        const when = next.month !== prev.month ? ` ${dateLabel(next.month)}.` : '';
        const milestone = next.milestones.length > prev.milestones.length ? ' News is in.' : '';
        this.say(`${moved}${when}${milestone}`);
        $<HTMLElement>('#card', this.root)?.focus({ preventScroll: true });
      },
      reducedMotion() ? 140 : 230,
    );
  }

  private say(text: string): void {
    const el = $('#said', this.root);
    if (!el) return;
    el.textContent = '';
    window.setTimeout(() => (el.textContent = text), 30);
  }

  // ---- dragging the card
  private onPointerDown(e: PointerEvent): void {
    if (this.busy || (e.target as HTMLElement).closest('button')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.drag = { id: e.pointerId, x0: e.clientX, dx: 0, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  private onPointerMove(e: PointerEvent): void {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    const dx = e.clientX - this.drag.x0;
    this.drag.dx = dx;
    if (Math.abs(dx) > 6) this.drag.moved = true;
    const card = $<HTMLElement>('#card', this.root)!;
    card.classList.add('dragging');
    card.style.setProperty('--dx', `${dx}px`);
    card.style.setProperty('--rot', `${(dx / 22).toFixed(2)}deg`);
    const side: Side | null = Math.abs(dx) < 24 ? null : dx < 0 ? 'left' : 'right';
    const v = view(this.state!);
    card.classList.toggle('lean-l', side === 'left' && !!v.right);
    card.classList.toggle('lean-r', side === 'right' && !!v.right);
    this.showMarks(side && v.right ? this.answerFor(side).marks : null);
  }
  private onPointerUp(e: PointerEvent): void {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    const { dx } = this.drag;
    this.resetDrag();
    const card = $<HTMLElement>('#card', this.root)!;
    const threshold = Math.min(110, card.offsetWidth * 0.3 || 110);
    if (Math.abs(dx) >= threshold) {
      card.style.setProperty('--dx', `${dx}px`);
      card.style.setProperty('--rot', `${(dx / 22).toFixed(2)}deg`);
      this.confirm(view(this.state!).right ? (dx < 0 ? 'left' : 'right') : 'left');
    } else this.select(this.selected, false);
  }
  private resetDrag(): void {
    this.drag = undefined;
    const card = $<HTMLElement>('#card', this.root);
    card?.classList.remove('dragging');
    card?.style.removeProperty('--dx');
    card?.style.removeProperty('--rot');
  }

  // ---- keyboard
  private onKey(e: KeyboardEvent): void {
    if (this.overlay) return this.overlayKey(e);
    if (this.screen !== 'game' || this.busy || e.altKey || e.ctrlKey || e.metaKey) return;
    const a = document.activeElement as HTMLElement | null;
    // shortcuts only when focus is on the page, the card or an answer button (never another control)
    const onAnswer = !!a?.classList.contains('answer');
    const free = !a || a === document.body || a.id === 'card' || onAnswer;
    if (!free) return;
    const two = !!view(this.state!).right;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const side: Side = e.key === 'ArrowLeft' ? 'left' : 'right';
      if (!two) {
        $<HTMLElement>('.answer', this.root)?.focus();
        return;
      }
      this.select(side);
      $<HTMLElement>(`.answer[data-side="${side}"]`, this.root)?.focus();
    } else if (e.key === 'Enter' && !onAnswer) {
      e.preventDefault();
      if (!two) this.confirm('left');
      else if (this.selected) this.confirm(this.selected);
      else this.say('Pick a side first with the left or right arrow.');
    } else if (e.key === 'Escape' && this.selected) {
      e.preventDefault();
      this.select(null);
    }
  }

  // ------------------------------------------------------------------ end of a run
  private finishRun(prev: GameState): void {
    const s = this.state!;
    const r = result(s);
    this.meta.finished += 1;
    if (!this.meta.endings.includes(r.id)) this.meta.endings.push(r.id);
    const newGoals = completedGoals(s, r, { runs: this.meta.finished, endings: this.meta.endings }, this.meta.goals);
    this.meta.goals.push(...newGoals);
    this.meta.tutorialDone = true;
    saveMeta(this.meta);
    this.lastResult = { result: r, newGoals, endMonth: prev.month };
    this.showEnding();
  }

  showEnding(): void {
    const s = this.state!;
    const { result: r, newGoals, endMonth } = this.lastResult!;
    const e = ENDING_BY_ID[r.id];
    this.screen = 'ending';
    this.root.dataset.screen = 'ending';
    const when = dateLabel(endMonth);
    const kicker = r.early
      ? `Your term ended early, in ${when}: ${GAUGE_NAME[e.gauge!]} ${e.high ? 'reached 100' : 'fell to 0'}.`
      : r.tipped
        ? `The tipping point came in ${dateLabel((s.tippedAt ?? 0) * TUNING.time.monthsPerCard)}. The world you leave: ${WORLD_NAMES[r.world!]}.`
        : `You served until December 2030. AI never tipped. The world you leave: ${WORLD_NAMES[r.world!]}.`;
    const band = (v: number, lo: string, mid: string, hi: string) => (v >= 60 ? hi : v >= 35 ? mid : lo);
    const tracks = [
      { name: 'Cooperation between Washington and Beijing', v: r.coop, words: band(r.coop, 'Low: they were heading for confrontation.', 'Middling: rivals who still talked.', 'High: they could make a deal.') },
      { name: 'Safety: how aligned the leading AI truly was', v: r.safety, words: band(r.safety, 'Low: the AI was not what it seemed.', 'Uncertain: nobody could be sure.', 'High: it mostly did what it said.') },
      { name: 'Europe’s AI', v: r.europe, words: r.europeOpen ? 'Open: Europe ran on models it could inspect and own.' : 'Dependent: Europe ran on other people’s models.' },
      { name: 'Steadiness: how balanced your four gauges were', v: r.steadiness, words: band(r.steadiness, 'Shaky.', 'Uneven.', 'Steady.') },
    ];
    const speed = { slow: 'slow', steady: 'steady', fast: 'fast' }[r.takeoff];
    this.root.innerHTML = `
      <main class="ending ${r.early ? 'early' : r.good ? 'good' : 'bad'}" aria-labelledby="end-h">
        <p class="kicker">${esc(kicker)}</p>
        <h1 id="end-h" tabindex="-1">${esc(e.title)}</h1>
        ${r.early ? '' : `<p class="verdict">${r.good ? 'A good ending' : 'A bad ending'}</p>`}
        <p class="end-text">${esc(e.text)}</p>
        ${e.idea ? `<p class="idea"><strong>The idea behind it.</strong> ${esc(e.idea)}</p>` : ''}
        <section aria-labelledby="dec-h">
          <h2 id="dec-h">What decided it</h2>
          ${r.decisive.length ? `<ol class="decisive">${r.decisive.map((d) => `<li><span class="d-date">${esc(dateLabel(d.month))}</span> You ${esc(d.text)}.</li>`).join('')}</ol>` : '<p>No single answer stood out.</p>'}
        </section>
        <section aria-labelledby="hid-h">
          <h2 id="hid-h">What you could not see</h2>
          <ul class="tracks">
            ${tracks
              .map(
                (t) => `<li><span class="t-name">${esc(t.name)}</span>
                <span class="t-bar" role="img" aria-label="${esc(`${t.v} out of 100`)}"><span style="width:${Math.max(2, Math.min(100, t.v))}%"></span></span>
                <span class="t-words">${esc(t.words)} <span class="t-num">(${t.v} of 100)</span></span></li>`,
              )
              .join('')}
          </ul>
          <p class="takeoff">The hidden takeoff speed of this run was ${speed}.</p>
        </section>
        <section aria-labelledby="real-h">
          <h2 id="real-h">In reality</h2>
          <ul class="reality">${e.reality.map((f) => `<li>${esc(f.text)} <span class="src">Source: ${extLink(f.source.label, f.source.url)}</span></li>`).join('')}</ul>
        </section>
        ${
          newGoals.length
            ? `<section aria-labelledby="goal-h" class="new-goals"><h2 id="goal-h">Goals completed</h2><ul>${newGoals
                .map((id) => GOALS.find((g) => g.id === id)!)
                .map((g) => `<li>${esc(g.text)}. New in the deck: ${esc(g.unlocks)}.</li>`)
                .join('')}</ul></section>`
            : ''
        }
        <div class="end-actions">
          <button class="btn primary" data-act="again">Play again as Envoy #${this.meta.runs + 1}</button>
          <button class="btn" data-act="archive">Archive</button>
        </div>
      </main>`;
    this.wire();
    $<HTMLElement>('#end-h', this.root)?.focus();
    window.scrollTo?.(0, 0);
  }

  // ------------------------------------------------------------------ archive
  showArchive(from: Screen): void {
    const back = from;
    this.screen = 'archive';
    this.root.dataset.screen = 'archive';
    const seen = new Set(this.meta.endings);
    const tile = (id: string) => {
      const e = ENDING_BY_ID[id as keyof typeof ENDING_BY_ID];
      const got = seen.has(e.id);
      const how = e.early ? `${GAUGE_NAME[e.gauge!]} at ${e.high ? '100' : '0'}` : `${WORLD_NAMES[e.world!]}, ${e.good ? 'good' : 'bad'} ending`;
      return `<li class="tile ${got ? 'got' : 'locked'}"><h3>${esc(e.title)}</h3><p class="how">${esc(how)}</p><p class="state">${got ? esc(e.text.split('. ')[0] + '.') : 'Not reached yet.'}</p></li>`;
    };
    this.root.innerHTML = `
      <main class="archive" aria-labelledby="arc-h">
        <h1 id="arc-h" tabindex="-1">Archive</h1>
        <p>${seen.size} of ${ENDINGS.length} endings reached over ${this.meta.finished} ${this.meta.finished === 1 ? 'term' : 'terms'}.</p>
        <h2>Early endings: the mandate lost</h2>
        <ul class="tiles">${EARLY_ENDINGS.map((e) => tile(e.id)).join('')}</ul>
        <h2>Final endings: the world you leave</h2>
        <ul class="tiles">${FINAL_ENDINGS.map((e) => tile(e.id)).join('')}</ul>
        <div class="end-actions">
          ${back === 'game' ? '<button class="btn primary" data-act="resume">Back to the game</button>' : back === 'ending' ? '<button class="btn primary" data-act="back-ending">Back to your ending</button>' : ''}
          <button class="btn ${back === 'title' ? 'primary' : ''}" data-act="${back === 'game' ? 'menu-title' : 'title'}">Title screen</button>
        </div>
      </main>`;
    this.wire();
    $<HTMLElement>('#arc-h', this.root)?.focus();
  }

  private resumeGame(): void {
    this.enterGame();
  }

  // ------------------------------------------------------------------ dialogs
  private openDialog(html: string, labelId: string, trigger: HTMLElement | null, cls = ''): void {
    const wrap = document.createElement('div');
    wrap.className = 'overlay';
    wrap.innerHTML = `<div class="dialog ${cls}" role="dialog" aria-modal="true" aria-labelledby="${labelId}" tabindex="-1">${html}</div>`;
    this.root.setAttribute('inert', '');
    this.root.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wrap);
    this.overlay = { el: wrap, returnTo: trigger };
    wrap.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t === wrap || t.closest('[data-close]')) this.closeDialog();
      const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
      if (act) this.act(act, t.closest<HTMLElement>('[data-act]'));
    });
    $<HTMLElement>(`#${labelId}`, wrap)?.focus();
  }

  closeDialog(): void {
    if (!this.overlay) return;
    const { el, returnTo } = this.overlay;
    this.overlay = undefined;
    el.remove();
    this.root.removeAttribute('inert');
    this.root.removeAttribute('aria-hidden');
    if (returnTo && document.contains(returnTo)) returnTo.focus();
  }

  private overlayKey(e: KeyboardEvent): void {
    const dlg = $<HTMLElement>('.dialog', this.overlay!.el)!;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeDialog();
      return;
    }
    if (e.key !== 'Tab') return;
    const f = [...dlg.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')];
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    const a = document.activeElement;
    if (e.shiftKey && (a === first || !dlg.contains(a))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (a === last || !dlg.contains(a))) {
      e.preventDefault();
      first.focus();
    }
  }

  private openLearn(trigger: HTMLElement): void {
    const v = view(this.state!);
    if (!v.learn) return;
    this.state = readLearn(this.state!);
    const basis =
      v.basis.kind === 'ai2027'
        ? `This card follows the AI 2027 scenario (${v.basis.ref}). It is fiction.`
        : v.basis.kind === 'cfg'
          ? `This card follows CFG’s scenarios (${v.basis.ref}). They are fiction.`
          : 'This card rests on a real fact.';
    this.openDialog(
      `<h2 id="learn-h" tabindex="-1">Learn more</h2>
       <p class="learn-text">${esc(v.learn.text)}</p>
       <p class="src">Source: ${extLink(v.learn.source.label, v.learn.source.url)}</p>
       <p class="basis">${esc(basis)}</p>
       <button class="btn primary" data-close>Back to the card</button>`,
      'learn-h',
      trigger,
      'learn',
    );
  }

  private openMenu(trigger: HTMLElement | null): void {
    const inGame = this.screen === 'game';
    this.openDialog(
      `<h2 id="menu-h" tabindex="-1">${inGame ? 'Menu' : 'How to play'}</h2>
       <div class="help">
         <p>Each card is a request. Answer it with one of the two buttons below the card, or drag the card left or right.</p>
         <p>The first click on an answer shows which gauges it will move, with a small or a large dot. Click it again to confirm.</p>
         <p>If any gauge reaches 0 or 100, your term ends. Three things you cannot see also decide how the story ends: whether Washington and Beijing cooperate, whether the AI is truly safe, and whether Europe’s AI is open.</p>
         <h3>Keyboard</h3>
         <ul class="keylist"><li><kbd>←</kbd> <kbd>→</kbd> pick a side and show what it moves</li><li><kbd>Enter</kbd> confirm</li><li><kbd>Esc</kbd> cancel, or close a window</li><li><kbd>Tab</kbd> move between buttons</li></ul>
         <p>Shortcuts work when the card or an answer has focus, not while another button does.</p>
       </div>
       ${inGame ? this.goalsHtml('menu-goals') : ''}
       <div class="dlg-actions">
         <button class="btn primary" data-close>${inGame ? 'Back to the game' : 'Close'}</button>
         ${inGame ? '<button class="btn" data-act="menu-archive">Archive</button><button class="btn" data-act="menu-title">Give up this term</button>' : ''}
       </div>`,
      'menu-h',
      trigger,
      'menu',
    );
  }

  // ------------------------------------------------------------------ wiring
  private wire(): void {
    for (const el of this.root.querySelectorAll<HTMLElement>('[data-act]')) {
      if (el.classList.contains('learn-btn')) continue;
      el.addEventListener('click', () => this.act(el.dataset.act!, el));
    }
  }

  private act(act: string, el: HTMLElement | null): void {
    switch (act) {
      case 'start':
      case 'again':
        return this.startRun();
      case 'archive':
        return this.showArchive(this.screen === 'ending' ? 'ending' : 'title');
      case 'archive-from-game':
        return this.showArchive('game');
      case 'help':
      case 'menu':
        return this.openMenu(el);
      case 'menu-archive':
        this.closeDialog();
        return this.showArchive('game');
      case 'menu-title':
        this.closeDialog();
        this.state = undefined;
        return this.showTitle();
      case 'title':
        return this.showTitle();
      case 'resume':
        return this.resumeGame();
      case 'back-ending':
        return this.showEnding();
    }
  }

  /** For tests and screenshots (dev only): the state and helpers. */
  get debug() {
    return { state: this.state, meta: this.meta, sources: SOURCES };
  }
}
