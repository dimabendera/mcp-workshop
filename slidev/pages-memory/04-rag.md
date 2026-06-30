---
layout: center
---

# 🔍 Блок 4: RAG — контекстний пошук для LLM

_Коли знань занадто багато для контекстного вікна_

<!--
НОТАТКИ ДОПОВІДАЧА:
RAG = Retrieval Augmented Generation.
Основна ідея: замість тримати всі знання в контексті — шукаємо тільки потрібне.

"Контекстний пошук" — хороший термін для нетехнічної аудиторії.
Це буквально: знаходимо КОНТЕКСТ (підказки) через пошук і даємо їх LLM.

Більшість реальних AI-продуктів використовують RAG.
Без RAG → LLM галюцинує на доменних питаннях або не знає актуальних даних.

У нас: власна embedding модель (qwen_vl_embedding_2b) + reranker (qwen_vl_reranker_2b).
Це важливо для приватності (дані не йдуть в OpenAI).
-->

---

# RAG = Знаходимо підказку → Даємо LLM

**Проблема:** у тебе 10 000 сторінок документації. Контекст: 200 сторінок.

```
╔═══════════════════════════════════════════════════════════╗
║  БЕЗ RAG (наївно):                                       ║
║  LLM промпт = [10 000 сторінок] + [запит]               ║
║  → НЕМОЖЛИВО: не вміститься, дорого, якість падає        ║
╠═══════════════════════════════════════════════════════════╣
║  З RAG (розумно):                                        ║
║  1. Знаходимо 3-5 найбільш СХОЖИХ сторінок              ║
║  2. Вставляємо їх у промпт                               ║
║  3. LLM відповідає з правильним контекстом               ║
║  LLM промпт = [3-5 сторінок] + [запит]  ← набагато краще║
╚═══════════════════════════════════════════════════════════╝
```

**RAG** = **R**etrieval (пошук) + **A**ugmented (збагачений) + **G**eneration (генерація)

<v-click>

**Де використовується:** документи компанії, база знань, SQL-приклади, wiki, кодова база — будь-які дані які не влізають в контекст.

</v-click>

<!--
НОТАТКИ ДОПОВІДАЧА:
RAG вирішує "проблему знань" — але не пам'яті між сесіями!

Типові помилки:
- "RAG = вся пам'ять" → ні. RAG тільки для "знань" (документи, факти).
- "Треба завжди використовувати RAG" → ні. Якщо дані влізають в контекст → може не потрібно.

Реальний приклад з проекту: 432 події ClickHouse + SQL-приклади з JIRA.
Не можна всі 432 тримати в промпті → RAG по ключовим словам + embeddings.
-->

---

# Що таке Embedding? (з прикладом)

**Термін: Embedding** — перетворення тексту в вектор (список чисел),
де **схожі за змістом тексти мають схожі числа**.

```
"кіт сидить на килимку"  →  [0.21, -0.83, 0.56, ...]  (384 числа)
"cat is sitting on mat"  →  [0.22, -0.81, 0.54, ...]  ← СХОЖИЙ (той самий зміст)
"рецепт борщу"           →  [0.94,  0.12, -0.23, ...] ← РІЗНИЙ (інший зміст)
```

**Аналогія:** уяви карту. Схожі місця — близько на карті.
Embedding = адреса тексту на "карті смислів".

```
  ПРОСТІР EMBEDDINGS (насправді 384+ вимірів, тут спрощено до 2D):

  ▲
  │  "JOIN"  "SELECT"  "INDEX"
  │      ●──●──●   ← SQL-терміни близько
  │      ●                     одне до одного
  │   "запит до БД"
  │
  │                ●  ●  ●
  │             "борщ" "вареники" "суп" ← кулінарія
  └─────────────────────────────────────▶
```

<!--
НОТАТКИ ДОПОВІДАЧА:
Embedding модель ≠ LLM для генерації тексту. Це різні моделі!

Наша embedding модель: qwen_vl_embedding_2b (власна, self-hosted).
Переваги:
1. Приватність — дані не відправляються в OpenAI/Anthropic
2. Мультимодальна — може обробляти зображення (vl = vision-language)
3. Підтримка української мови

Розмір вектора: 384-3072 числа залежно від моделі.
Більше вимірів = точніше, але займає більше пам'яті і повільніше.

КРИТИЧНО: Embedding модель не можна просто замінити — про це наступний слайд!
-->

---

# ⚠️ Зміна embedding моделі = повний rebuild

**Проблема:** якщо ви вирішили перейти на кращу embedding модель — старий індекс непридатний.

```
╔══════════════════════════════════════════════════════════════╗
║  СТАРА МОДЕЛЬ (miniLM):                                     ║
║  "JOIN таблиці"  →  [0.21, -0.83, 0.56, ... 384 числа]   ║
╠══════════════════════════════════════════════════════════════╣
║  НОВА МОДЕЛЬ (qwen-embedding):                              ║
║  "JOIN таблиці"  →  [0.67,  0.12, -0.89, ... 384 числа]   ║
║                      ↑                                      ║
║  ЗОВСІМ ІНШІ ЧИСЛА для того ж тексту!                      ║
╚══════════════════════════════════════════════════════════════╝

Якщо модель змінилась:
  Старі вектори в БД     ← закодовані старою моделлю
  Новий запит-вектор     ← закодований новою моделлю
                           ↓
  Cosine similarity → БЕЗГЛУЗДІ результати (порівнюємо несумісне)
```

<v-click>

**Рішення:** повністю ре-індексувати всі документи з новою моделлю.
Для 100K документів це може займати години.

**Тому:** вибір embedding моделі — **стратегічне рішення**.
Наша модель `qwen_vl_embedding_2b` вже обрана з розумінням цього.

</v-click>

<!--
НОТАТКИ ДОПОВІДАЧА:
Це критично важливе технічне обмеження яке часто ігнорують початківці.

Аналогія: уяви що ти переклав всю бібліотеку на іншу мову класифікації.
Тепер всі старі "адреси" на полицях не відповідають новим книгам.
Треба перекласифікувати всю бібліотеку знову.

Практично: якщо обрали miniLM → зібрали 1M документів →
вирішили перейти на qwen-embedding → треба перегенерувати 1M векторів.

Стратегічно: думай наперед, обирай модель яка:
- Підтримує твою мову (особливо Ukrainian)
- Достатньо велика для твого домену
- Самостійно хоститься (приватність)
- Стабільно розвивається (не deprecated)

У нас qwen_vl_embedding_2b — і ще є reranker qwen_vl_reranker_2b для уточнення результатів.
-->

---

# Типи RAG: від простого до складного

<div grid="~ cols-2 gap-4">
<div>

**1️⃣ Naive RAG** `Embed → Пошук → Топ-K → LLM`
Просто, добре для початку.

**2️⃣ Advanced RAG** `+ Rerank → Топ-K → LLM`
+ Reranker (`qwen_vl_reranker_2b`) для точнішого ранжування.

**3️⃣ Hybrid RAG** `BM25 + Embed → RRF → Топ-K → LLM`
Поєднує точний пошук + семантичний.

</div>
<div>

**4️⃣ Graph RAG** (детальніше далі)
```
Документи → Knowledge Graph
Запит → Граф-обхід → Факти → LLM
```
Знання як зв'язки між сутностями.

**5️⃣ Agentic RAG**
```
Агент сам вирішує що шукати:
→ Query decomposition (розбиває запит)
→ Multi-step retrieval (кілька запитів)
→ Self-critique (перевіряє достатність)
```

**6️⃣ Multimodal RAG**
```
Документи з зображеннями/таблицями
→ Image embeddings (наш vl!)
→ Пошук по зображеннях + тексту
```

</div>
</div>

<!--
НОТАТКИ ДОПОВІДАЧА:
Не треба вивчати всі відразу! Починати з Naive або Hybrid.

Reranker (2): береться модель яка порівнює ПАРУ "запит + документ" і дає score.
Більш точний ніж cosine similarity на embeddings.
Наш qwen_vl_reranker_2b — робить саме це.

Graph RAG (4): Microsoft відкрив open source GraphRAG бібліотеку в 2024.
Дуже ефективний для складних доменних питань де є багато зв'язків.
Детальніше — наступний слайд.

Agentic RAG (5): агент сам формулює пошукові запити, оцінює результати.
Складно реалізувати, але дає найкращу якість.

Multimodal RAG (6): qwen_vl = vision-language. Може кодувати зображення.
Дуже перспективно для документів з графіками, схемами.
-->

---
layout: two-cols
---

# Graph RAG: знання як граф зв'язків

**Класичний:** текст → пошук → промпт

```
Документ 1: "Іван Петренко — CTO Acme..."
Документ 2: "Acme спеціалізується на..."
Документ 3: "CTO Acme підписав партнерство..."
Запит: "Хто підписав партнерство?"
→ Може не знайти зв'язок!
```

**Graph RAG:** сутності + зв'язки → граф

```
Іван ──[є CTO]──▶ Acme
                   └──[підписала]──▶ Beta LLC
Запит: "Хто підписав?"
→ Acme → підписала → Beta LLC
→ CTO Acme = Іван ✅
```

::right::

# Коли Graph RAG?

**Краще ніж звичайний RAG коли:**
- Складні питання про зв'язки
  ("Хто з ким працює?", "Що впливає на що?")
- Факти розкидані по документах
- Мережі відносин (люди, компанії, процеси)

**Open source:**
`microsoft/graphrag` (GitHub, MIT)

**Коли НЕ потрібен:**
- Прості fact retrieval питання
- Документи без складних зв'язків
- Малий обсяг даних

**Починай з Hybrid RAG** → Graph RAG тільки якщо є конкретна потреба у зв'язках.

<!--
НОТАТКИ ДОПОВІДАЧА:
Graph RAG — Microsoft Research, липень 2024. Дуже активно розвивається.

Чому Graph RAG краще для складних питань:
Класичний RAG знаходить СХОЖИЙ ТЕКСТ, але не розуміє ЗВ'ЯЗКИ.
Граф дозволяє "пройти по зв'язках" і знайти відповідь навіть якщо
вона ніколи не зустрічалась в одному документі.

Приклад з нерухомості:
Граф: об'єкт ──[має]──▶ ціна 8000 грн
      об'єкт ──[в районі]──▶ Приморський ──[є в]──▶ Одеса
      об'єкт ──[тип]──▶ 2-кімнатна

Запит: "Квартири до 8500 в Одесі?"
→ Граф-обхід знаходить всі об'єкти з відповідними зв'язками.

Мінус Graph RAG: складніше побудувати і підтримувати граф.
Потрібен pipeline для автоматичного витягування сутностей і зв'язків.

Neo4j, AWS Neptune, або просто NetworkX (Python) / graph-related packages (JS).
-->

---
layout: two-cols
---

# BM25 vs Semantic vs Hybrid

**🔤 BM25 (Лексичний пошук)**
_Шукаємо конкретні слова_

```js
import BM25 from 'wink-bm25-text-search';
const engine = BM25();
engine.addDoc({ id: 1, text: "JOIN оптимізація MySQL" });
engine.addDoc({ id: 2, text: "індекси PostgreSQL" });
engine.consolidate();
const results = engine.search("JOIN MySQL");
// → [{ ref: 1, score: 2.1 }]
```

✅ Точний для термінів, ID, назв
❌ Не розуміє синоніми

::right::

**🧠 Semantic (Embedding пошук)**
_Шукаємо за змістом_

```js
import { ChromaClient } from 'chromadb';
const client = new ChromaClient();
const col = await client.getCollection({ name: "knowledge_base" });
const results = await col.query({
  queryTexts: ["покращення з'єднання таблиць"],
  nResults: 3
});
// Знаходить "оптимізація JOIN" ← синонім! ✅
```

✅ Розуміє синоніми і контекст
❌ Може знайти "схоже але не те"

**🏆 Hybrid = BM25 + Semantic через RRF:**
`score = Σ 1/(60 + rank_bm25) + Σ 1/(60 + rank_embed)`

<!--
НОТАТКИ ДОПОВІДАЧА:
Hybrid завжди краще кожного окремого (емпіричний факт з багатьох досліджень).

BM25 важливий для:
- Пошук по event_id, user_id, конкретних назвах
- Коди помилок ("OOM error 137")
- SQL функції ("toDate()", "groupArray()")

Semantic важливий для:
- Синоніми ("вивантажити" = "export" = "скачати")
- Концептуальний пошук ("задачі про аналітику")

RRF (Reciprocal Rank Fusion) — злиття рангів.
k=60 — стандартне значення яке добре працює на практиці.

Наш pipeline: BM25Okapi (rank_bm25 Python) + FastEmbed (MiniLM) + RRF.
-->

---
layout: two-cols
---

# RAG pipeline в JS — Крок 1: Індексація

```js
import OpenAI from 'openai';
import { ChromaClient } from 'chromadb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const openai = new OpenAI({ baseURL: process.env.LITELLM_BASE_URL });
const chroma = new ChromaClient({ path: "http://localhost:8000" });

async function indexDocuments(docs) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, chunkOverlap: 50
  });
  const chunks = await splitter.createDocuments(docs);

  const embeddings = await openai.embeddings.create({
    model: "qwen_vl_embedding_2b",
    input: chunks.map(c => c.pageContent)
  });

  const col = await chroma.getOrCreateCollection({ name: "kb" });
  await col.add({
    ids: chunks.map((_, i) => `chunk_${i}`),
    embeddings: embeddings.data.map(e => e.embedding),
    documents: chunks.map(c => c.pageContent)
  });
}
```

::right::

# Крок 2: Запит + відповідь

```js
async function ragQuery(question) {
  const col = await chroma.getCollection({ name: "kb" });

  const queryEmbed = await openai.embeddings.create({
    model: "qwen_vl_embedding_2b",
    input: [question]
  });

  const results = await col.query({
    queryEmbeddings: [queryEmbed.data[0].embedding],
    nResults: 3
  });

  const context = results.documents[0].join('\n---\n');

  const answer = await openai.chat.completions.create({
    model: process.env.LLM_MODEL,
    messages: [
      { role: "system", content: `Контекст:\n${context}` },
      { role: "user",   content: question }
    ]
  });

  return answer.choices[0].message.content;
}
```

<!--
НОТАТКИ ДОПОВІДАЧА:
Приклад використовує наші власні моделі через LiteLLM proxy.
baseURL: process.env.LITELLM_BASE_URL → наш proxy

model: "qwen_vl_embedding_2b" → власна embedding модель
model: process.env.LLM_MODEL → наша LLM (MiniMax M3 або інша)

chunkSize: 500 токенів ≈ 375 слів ≈ 1.5 сторінки A4
chunkOverlap: 50 → 50 токенів перекриття між чанками (щоб не губити контекст на межах)

ChromaDB запускається локально: docker run -p 8000:8000 chromadb/chroma
Або без Docker: npm install chromadb → вбудований storage.
-->

---
layout: two-cols
---

# Порівняння векторних БД

| БД | Open Source | Hybrid пошук |
|----|------------|--------------|
| **ChromaDB** | ✅ | Частково |
| **Qdrant** | ✅ | ✅ вбудований |
| **Weaviate** | ✅ | ✅ вбудований |
| **pgvector** | ✅ | З плагінами |
| **Elasticsearch** | ✅ BSL | ✅ kNN+BM25 |
| **OpenSearch** | ✅ Apache 2.0 | ✅ kNN+BM25 |
| **Milvus** | ✅ | ✅ |

::right::

# Що обрати?

**Elasticsearch vs Qdrant:**
- Qdrant: ~2-5x швидше на vector пошуку (Rust)
- ES/OS: краще якщо вже є в інфраструктурі

**Швидкий старт:**
```bash
# Chroma (PoC):
docker run -p 8000:8000 chromadb/chroma

# Qdrant (продакшн):
docker run -p 6333:6333 qdrant/qdrant

# pgvector (є PostgreSQL):
CREATE EXTENSION vector;
```

**Рекомендація:**
- Є PostgreSQL → pgvector
- Є ES → додай kNN
- Нічого нема → Qdrant

<!--
НОТАТКИ ДОПОВІДАЧА:
Рекомендація для команди:
1. Вже є Elasticsearch в інфраструктурі? → Додай kNN до нього, не треба ще один сервіс
2. Немає нічого? → Qdrant self-hosted (Rust, швидко, open source, хороша документація)
3. PostgreSQL є? → pgvector (просте розширення, не треба окремого сервісу)
4. Дуже великий обсяг (сотні мільйонів)? → Milvus або Qdrant кластер

Elasticsearch: Elastic License 2.0 (не зовсім open source для всіх use cases).
OpenSearch: форк ES від Amazon, Apache 2.0 — повністю відкритий.
Якщо важлива ліцензія → OpenSearch.

Qdrant benchmark (2024): 100K векторів, recall@10 = 0.99, latency p99 < 5ms.
ES kNN benchmark: схожий recall, але latency 2-3x вище при тому самому hardware.
Але ES дає BM25 "безкоштовно" без додаткових зусиль.
-->
