#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoot = resolve(process.argv[2] ?? '/Users/nori/JapanChronoPath');
const outputPath = resolve(
  process.argv[3] ?? resolve(import.meta.dirname, '..', 'chronopath-image-credits.html'),
);

const readJson = (relativePath) =>
  JSON.parse(readFileSync(resolve(appRoot, relativePath), 'utf8'));

const eventTitlePayload = execFileSync(
  'npx',
  [
    'tsx',
    '-e',
    [
      "import { timelineEvents } from './data/timeline-events';",
      "import { subEvents } from './data/subEvents';",
      'console.log(JSON.stringify(Object.fromEntries([...timelineEvents, ...subEvents].map((event) => [event.id, event.title]))));',
    ].join(' '),
  ],
  { cwd: appRoot, encoding: 'utf8' },
);
const eventTitles = JSON.parse(eventTitlePayload);

const licenseUrlFor = (license, sourceUrl, providedUrl = '') => {
  const normalized = license.trim().toLowerCase();
  if (normalized === 'cc0') {
    return 'https://creativecommons.org/publicdomain/zero/1.0/';
  }
  const match = normalized.match(/^cc by(-sa)? ([0-9.]+)( jp)?$/);
  if (match) {
    const family = match[1] ? 'by-sa' : 'by';
    const port = match[3] ? '/jp' : '';
    return `https://creativecommons.org/licenses/${family}/${match[2]}${port}/`;
  }
  if (providedUrl) return providedUrl.replace(/^http:/, 'https:');
  return sourceUrl;
};

const basePeople = readJson('data/base-person-image-credits.json');
const expansionPeople = readJson('data/person-image-credits.json');
const eventCredits = readJson('data/event-image-credits.json');

const people = [...basePeople, ...expansionPeople]
  .map((credit) => ({
    type: 'person',
    id: credit.id,
    title: credit.nameJa,
    imageUrl: credit.imageUrl,
    sourceUrl: credit.sourcePage,
    license: credit.license,
    licenseUrl: licenseUrlFor(credit.license, credit.sourcePage, credit.licenseUrl),
    artist: credit.artist,
    credit: credit.credit ?? '',
    specialAttribution:
      credit.id === 'nintoku_tenno'
        ? '国土画像情報（カラー空中写真）（国土交通省）を基に作成 / Made based on National Land Image Information (Color Aerial Photographs), Ministry of Land, Infrastructure, Transport and Tourism.'
        : '',
  }))
  .sort((a, b) => a.title.localeCompare(b.title, 'ja'));

const events = eventCredits
  .map((credit) => ({
    type: 'event',
    id: credit.id,
    title: eventTitles[credit.id] ?? credit.id,
    imageUrl: credit.imageUrl,
    sourceUrl: credit.sourceUrl,
    license: credit.license,
    licenseUrl: licenseUrlFor(credit.license, credit.sourceUrl),
    artist: credit.artist,
    credit: '',
    specialAttribution: '',
  }))
  .sort((a, b) => a.title.localeCompare(b.title, 'ja'));

if (people.length !== 500 || events.length !== 319) {
  throw new Error(`Unexpected credit count: people=${people.length}, events=${events.length}`);
}
if (events.some((event) => event.title === event.id)) {
  throw new Error('One or more event titles could not be resolved.');
}

const payload = JSON.stringify({ people, events }).replaceAll('<', '\\u003c');
const generatedAt = '2026年8月14日';

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="ChronoPath日本史で使用している人物・歴史出来事画像の出典とライセンス一覧です。">
  <title>画像の出典・ライセンス — ChronoPath日本史</title>
  <style>
    :root {
      color-scheme: light;
      --navy: #101d36;
      --navy-soft: #1a2b4c;
      --gold: #c79a40;
      --gold-soft: #f0dfb7;
      --paper: #f7f2e8;
      --card: #fffdf8;
      --ink: #1b2433;
      --muted: #687083;
      --line: #ded7c8;
      --link: #245d9e;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      overflow-x: hidden;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif;
      line-height: 1.65;
    }
    a { color: var(--link); }
    .hero {
      background:
        radial-gradient(circle at 82% 15%, rgba(199, 154, 64, .22), transparent 30%),
        linear-gradient(145deg, var(--navy), var(--navy-soft));
      color: white;
      padding: calc(2.6rem + env(safe-area-inset-top)) 1.25rem 2.7rem;
    }
    .hero-inner, main, footer { width: min(960px, 100%); min-width: 0; margin: 0 auto; }
    .eyebrow {
      display: inline-block;
      margin: 0 0 .7rem;
      color: var(--gold-soft);
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .16em;
    }
    h1 { margin: 0; font-family: Georgia, "Yu Mincho", serif; font-size: clamp(1.75rem, 6vw, 2.7rem); line-height: 1.25; }
    .lead { max-width: 720px; margin: 1rem 0 0; color: #e5e9f2; }
    .totals { display: flex; flex-wrap: wrap; gap: .65rem; margin-top: 1.35rem; }
    .total {
      min-width: 0;
      border: 1px solid rgba(240, 223, 183, .42);
      border-radius: 999px;
      padding: .38rem .75rem;
      color: var(--gold-soft);
      font-size: .86rem;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
    }
    main { padding: 1.2rem 1rem 3rem; }
    .notice {
      margin: 0 0 1rem;
      padding: 1rem;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: rgba(255, 253, 248, .86);
      font-size: .9rem;
    }
    .notice p { margin: .3rem 0; }
    .controls {
      position: sticky;
      z-index: 10;
      top: 0;
      margin: 0 -1rem 1rem;
      padding: .75rem 1rem;
      border-bottom: 1px solid rgba(222, 215, 200, .9);
      background: rgba(247, 242, 232, .94);
      backdrop-filter: blur(12px);
    }
    .control-inner { display: grid; grid-template-columns: 1fr auto; gap: .7rem; width: min(928px, 100%); margin: 0 auto; }
    .search {
      width: 100%;
      min-width: 0;
      border: 1px solid #c9c2b5;
      border-radius: 11px;
      background: white;
      padding: .72rem .85rem;
      color: var(--ink);
      font: inherit;
      font-size: 16px;
    }
    .tabs { display: flex; gap: .35rem; }
    .tab {
      min-width: 0;
      border: 1px solid var(--navy-soft);
      border-radius: 10px;
      background: transparent;
      color: var(--navy);
      padding: .65rem .8rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
    }
    .tab[aria-selected="true"] { background: var(--navy); color: white; }
    .summary { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin: 1rem 0 .75rem; }
    .summary h2 { margin: 0; font-family: Georgia, "Yu Mincho", serif; font-size: 1.25rem; }
    #resultCount { color: var(--muted); font-size: .86rem; }
    .credits { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
    .credit-card {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr);
      gap: .8rem;
      min-height: 126px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--card);
      box-shadow: 0 3px 12px rgba(16, 29, 54, .05);
    }
    .thumb { width: 96px; height: 100%; min-height: 126px; object-fit: cover; background: #e7e1d6; }
    .credit-body { min-width: 0; padding: .72rem .75rem .7rem 0; }
    .credit-title { margin: 0 0 .28rem; font-size: 1rem; line-height: 1.4; }
    .credit-id { color: var(--muted); font-family: ui-monospace, SFMono-Regular, monospace; font-size: .7rem; overflow-wrap: anywhere; }
    .meta { margin: .36rem 0; color: #4e5665; font-size: .78rem; overflow-wrap: anywhere; }
    .license {
      display: inline-block;
      border-radius: 999px;
      background: #efe5cb;
      padding: .14rem .48rem;
      color: #69501d;
      font-size: .71rem;
      font-weight: 700;
      text-decoration: none;
    }
    .source { display: inline-block; margin-left: .38rem; font-size: .76rem; font-weight: 600; }
    .special { margin: .5rem 0 0; padding: .5rem; border-left: 3px solid var(--gold); background: #f8f0de; font-size: .74rem; }
    .more-wrap { text-align: center; margin: 1.25rem 0 0; }
    .more {
      border: 0;
      border-radius: 11px;
      background: var(--navy);
      color: white;
      padding: .78rem 1.2rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .empty { grid-column: 1 / -1; padding: 3rem 1rem; color: var(--muted); text-align: center; }
    footer { padding: 0 1rem calc(2rem + env(safe-area-inset-bottom)); color: var(--muted); font-size: .82rem; }
    footer section { border-top: 1px solid var(--line); padding-top: 1.2rem; }
    footer h2 { color: var(--ink); font-size: 1rem; }
    footer p { margin: .55rem 0; }
    @media (max-width: 720px) {
      .control-inner { grid-template-columns: 1fr; }
      .totals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .total:last-child { grid-column: 1 / -1; }
      .tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .credits { grid-template-columns: 1fr; }
    }
    @media (max-width: 390px) {
      .credit-card { grid-template-columns: 82px minmax(0, 1fr); }
      .thumb { width: 82px; }
      .tab { padding-inline: .55rem; font-size: .85rem; }
    }
  </style>
</head>
<body>
  <header class="hero">
    <div class="hero-inner">
      <p class="eyebrow">CHRONOPATH 日本史</p>
      <h1>画像の出典・ライセンス</h1>
      <p class="lead">アプリで使用している人物肖像と歴史出来事画像について、原典・作者・利用条件を画像ごとに掲載しています。</p>
      <div class="totals" aria-label="掲載件数">
        <span class="total">人物画像 500件</span>
        <span class="total">出来事画像 319件</span>
        <span class="total">合計 819件</span>
      </div>
    </div>
  </header>

  <main>
    <aside class="notice">
      <p><strong>表示について：</strong>アプリ内では表示サイズに合わせて画像を縮小・トリミングして表示しています。</p>
      <p>各画像の正確な利用条件と最新版は「ライセンス」と「原典を開く」から個別にご確認ください。パブリックドメイン／Attribution表記は個別の原典ページにリンクします。</p>
      <p>最終更新：${generatedAt}</p>
    </aside>

    <div class="controls">
      <div class="control-inner">
        <input id="search" class="search" type="search" placeholder="人物名・出来事名・作者・IDで検索" aria-label="画像クレジットを検索">
        <div class="tabs" role="tablist" aria-label="画像の種類">
          <button class="tab" type="button" role="tab" data-type="people" aria-selected="true">人物 500</button>
          <button class="tab" type="button" role="tab" data-type="events" aria-selected="false">出来事 319</button>
        </div>
      </div>
    </div>

    <div class="summary">
      <h2 id="sectionTitle">人物画像</h2>
      <span id="resultCount" aria-live="polite"></span>
    </div>
    <div id="credits" class="credits"></div>
    <div id="moreWrap" class="more-wrap"><button id="more" class="more" type="button">さらに表示</button></div>
  </main>

  <footer>
    <section>
      <h2>その他のデータ・地図</h2>
      <p>人物に関する構造化データの一部：<a href="https://www.wikidata.org/wiki/Wikidata:Licensing" target="_blank" rel="noopener noreferrer">Wikidata（CC0 1.0）</a></p>
      <p>旧国境地図：Lex Berman, <a href="https://doi.org/10.7910/DVN/2CVTR0" target="_blank" rel="noopener noreferrer">Japan Tokugawa GIS, Harvard Dataverse, V1</a>（CC0 1.0）</p>
      <p>ライセンスの詳細は各画像のリンク先が優先されます。権利・表記に関するご連絡：<a href="mailto:noriphone03255@gmail.com">noriphone03255@gmail.com</a></p>
      <p>© 2026 Nori. ChronoPath日本史</p>
    </section>
  </footer>

  <script id="creditData" type="application/json">${payload}</script>
  <script>
    const data = JSON.parse(document.getElementById('creditData').textContent);
    const credits = document.getElementById('credits');
    const search = document.getElementById('search');
    const more = document.getElementById('more');
    const moreWrap = document.getElementById('moreWrap');
    const resultCount = document.getElementById('resultCount');
    const sectionTitle = document.getElementById('sectionTitle');
    const tabs = [...document.querySelectorAll('.tab')];
    const pageSize = 50;
    let type = 'people';
    let limit = pageSize;

    const escapeHtml = (value) => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

    const normalize = (value) => String(value).normalize('NFKC').toLocaleLowerCase('ja');

    const card = (item) => {
      const searchText = normalize([item.title, item.id, item.artist, item.license].join(' '));
      return '<article class="credit-card" data-search="' + escapeHtml(searchText) + '">' +
        '<img class="thumb" src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">' +
        '<div class="credit-body">' +
          '<h3 class="credit-title">' + escapeHtml(item.title) + '</h3>' +
          '<div class="credit-id">' + escapeHtml(item.id) + '</div>' +
          '<p class="meta"><strong>作者：</strong>' + escapeHtml(item.artist || '不明') + '</p>' +
          '<a class="license" href="' + escapeHtml(item.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.license) + '</a>' +
          '<a class="source" href="' + escapeHtml(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">原典を開く</a>' +
          (item.credit ? '<p class="meta"><strong>原典表記：</strong>' + escapeHtml(item.credit) + '</p>' : '') +
          (item.specialAttribution ? '<p class="special">' + escapeHtml(item.specialAttribution) + '</p>' : '') +
        '</div>' +
      '</article>';
    };

    const render = () => {
      const query = normalize(search.value.trim());
      const filtered = data[type].filter((item) =>
        normalize([item.title, item.id, item.artist, item.license].join(' ')).includes(query)
      );
      const visible = filtered.slice(0, limit);
      credits.innerHTML = visible.length
        ? visible.map(card).join('')
        : '<p class="empty">該当する画像クレジットはありません。</p>';
      sectionTitle.textContent = type === 'people' ? '人物画像' : '出来事画像';
      resultCount.textContent = filtered.length + '件中 ' + visible.length + '件を表示';
      moreWrap.hidden = visible.length >= filtered.length;
    };

    search.addEventListener('input', () => { limit = pageSize; render(); });
    more.addEventListener('click', () => { limit += pageSize; render(); });
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      type = tab.dataset.type;
      limit = pageSize;
      tabs.forEach((candidate) => candidate.setAttribute('aria-selected', String(candidate === tab)));
      render();
      search.focus();
    }));
    render();
  </script>
</body>
</html>
`;

writeFileSync(outputPath, html);
console.log(`Generated ${outputPath} (${people.length + events.length} credits)`);
