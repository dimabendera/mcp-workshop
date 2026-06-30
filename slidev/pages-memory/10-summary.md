---
layout: cover
---

# Дякую!

<div class="flex items-center justify-center gap-16 mt-4">
<div class="text-left">

**Що вивчили:**

✅ Контекстне вікно, токени, KV Cache  
✅ 4 стратегії Conversation Memory  
✅ 4 типи пам'яті: Semantic / Procedural / Episodic / Cache  
✅ RAG: Embeddings → Hybrid Search → Graph RAG  
✅ Власні моделі: MiniMax M3, qwen_vl_embedding_2b, reranker  
✅ CLAUDE.md, Skills, LangGraph persistence  
✅ Персональні агенти: Mem0, Zep  
✅ Self-Learning з Human-in-the-Loop  
✅ Огляд open source фреймворків  

<br>

**Open source стек для старту:**  
`LangGraph + Chroma/Qdrant + Mem0 + CLAUDE.md`

</div>
</div>

<!--
НОТАТКИ ДОПОВІДАЧА:
Завершальний слайд. Q&A сесія.

Типові питання і відповіді:

Q: "Чи варто зберігати ВЕСЬ чат в БД?"
A: Для аналітики так (SQLite). Для швидкого доступу агента — тільки summary.
   Повний чат займає місце, а при retrieval потрібен семантичний пошук.

Q: "Як обрати chunk_size для RAG?"
A: 200-500 слів з 10-20% overlap. Більший chunk = більше контексту але
   менш точний retrieval. Менший = точніший retrieval але може губити контекст.
   Практично: 500 токенів + 50 overlap — хороший старт.

Q: "Чи можна одну векторну БД для всього?"
A: Можна, але окремі колекції = кращий retrieval і легше обслуговувати.
   Мінімум: окрема колекція для conversations, documents, rules.

Q: "Коли Graph RAG а коли звичайний?"
A: Звичайний RAG — для пошуку в документах (fact retrieval).
   Graph RAG — для питань про зв'язки між сутностями (relationship queries).
   Починай з звичайного, Graph RAG — коли є конкретна потреба.

Q: "Наші моделі vs OpenAI — що краще?"
A: Наші: приватність (дані не йдуть в US), контроль, часто дешевше.
   OpenAI: краще для англомовних задач, більше документації.
   Для українського контенту — тестуй! MiniMax M3 показує добрі результати.

Q: "Як почати прямо сьогодні?"
A: 1. Додай CLAUDE.md в проект (5 хвилин)
   2. Спробуй ConversationSummaryBufferMemory (30 хвилин)
   3. Підними ChromaDB Docker і зроби мінімальний RAG (2 години)
   4. Explore далі за потребою
-->
