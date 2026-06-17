---
theme: seriph
title: Model Context Protocol
titleTemplate: '%s — Воркшоп'
highlighter: shiki
drawings:
  persist: false
transition: slide-left
colorSchema: dark
css: custom.css
---

# Model Context Protocol

**Від теорії до коду**

_Протокол який змінює як AI взаємодіє з інструментами_

<!--
Привіт! Сьогодні розберемо MCP — від нуля до робочого коду.
Хто вже чув? Хто підключав MCP сервери?
Структура: теорія → практика → теорія → практика.
Кожна концепція одразу підкріплюється живим кодом.
-->

---

# Програма

<div grid="~ cols-2 gap-8">
<div>

**Теорія:**
- 🤔 Що таке MCP і навіщо він потрібен
- 🏗️ Архітектура: Host / Client / Server
- 🔧 Примітиви: Tools / Resources / Prompts
- 🔄 Транспорт: stdio та HTTP
- 🤖 Агентік луп і LangChain

</div>
<div>

**Практика:**
- ⚙️ Крок 0 — Налаштування середовища
- 🖥️ Крок 1 — Перший MCP сервер
- 🔍 Крок 2 — MCP Inspector
- 🤝 Крок 3 — Перший клієнт
- 🧠 Крок 4 — LangChain агент + LiteLLM
- 🌐 Крок 5 — VS Code + Cline
- 📊 Крок 6 — HTTP + Langfuse

</div>
</div>

<br>

📦 Репозиторій: **github.com/dimabendera/mcp-workshop**

<!--
Покажіть цей слайд і поясніть структуру.
Підкресліть: теорія і практика чергуються — не ховаємо код на кінець.
-->

---
src: ./pages/01-what-is-mcp.md
---

---
src: ./pages/02-architecture.md
---

---
src: ./pages/03-primitives.md
---

---
src: ./pages/04-transport-protocol.md
---

---
src: ./pages/step-01-setup.md
---

---
src: ./pages/step-02-server.md
---

---
src: ./pages/step-03-inspector.md
---

---
src: ./pages/05-agentic-loop-theory.md
---

---
src: ./pages/step-04-langchain.md
---

---
src: ./pages/06-real-world.md
---

---
src: ./pages/step-05-vscode.md
---

---
src: ./pages/07-http-langfuse.md
---

---
src: ./pages/step-06-http-langfuse.md
---

---
src: ./pages/08-resources.md
---
