# MCP Workshop

Практичний воркшоп з Model Context Protocol — від першого сервера до агента з трасуванням.

## Структура

```
slidev/      # Слайди презентації (Slidev)
workshop/    # Практичний код по кроках
  01-server/       # MCP сервер (stdio)
  02-client/       # MCP клієнт
  03-agent-loop/   # LangChain агент + LiteLLM
  04-http-server/  # MCP сервер (HTTP/SSE)
  05-langfuse/     # Агент з Langfuse трасуванням
```

## Програма

| Крок | Тема |
|------|------|
| 0 | Налаштування середовища |
| 1 | Перший MCP сервер |
| 2 | MCP Inspector |
| 3 | Перший клієнт |
| 4 | LangChain агент + LiteLLM |
| 5 | VS Code + Cline |
| 6 | HTTP сервер + Langfuse |

## Запуск слайдів

```bash
cd slidev
npm install
npm run dev
# http://localhost:3030
```

## Налаштування воркшопу

```bash
cd workshop
cp .env.example .env   # заповни ключі
npm install            # або: pip install -r requirements.txt
```

Змінні середовища:

```
LITELLM_BASE_URL=   # URL LiteLLM proxy
LITELLM_API_KEY=    # API ключ
LLM_MODEL=          # назва моделі
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASEURL=
```

## Запуск кроків (JS)

```bash
cd workshop
npm run server    # 01 — MCP сервер
npm run client    # 02 — клієнт
npm run agent     # 03 — LangChain агент
npm run http      # 04 — HTTP сервер
npm run traced    # 05 — агент з Langfuse
npm run inspect   # MCP Inspector
```

## Стек

- [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) — MCP
- [LangChain](https://js.langchain.com/) + [LangGraph](https://langchain-ai.github.io/langgraphjs/) — агентік луп
- [LiteLLM](https://litellm.ai/) — OpenAI-сумісний proxy для будь-якого LLM
- [Langfuse](https://langfuse.com/) — трасування та дебагінг
- [Slidev](https://sli.dev/) — слайди як код

JS і Python версії доступні для кожного кроку.
