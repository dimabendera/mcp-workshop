# LangChain агент з Langfuse трасуванням — Python версія
# Різниця від agent.py — тільки 3 рядки
# Запуск: python 05-langfuse/agent-traced.py

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langfuse.callback import CallbackHandler  # ← 1. Новий імпорт


async def main():
    # 2. Langfuse handler — читає ключі з .env
    langfuse_handler = CallbackHandler(
        public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
        secret_key=os.environ["LANGFUSE_SECRET_KEY"],
        host=os.environ["LANGFUSE_BASEURL"],
    )

    # Все те саме що в agent.py ↓
    async with MultiServerMCPClient({
        "math": {
            "transport": "stdio",
            "command": "python",
            "args": ["./01-server/server.py"],
        },
        "autoria": {
            "transport": "stdio",
            "command": "python",
            "args": ["./02-server/server.py"],
        },
    }) as client:
        tools = await client.get_tools()

        llm = ChatOpenAI(
            api_key=os.environ["LITELLM_API_KEY"],
            base_url=os.environ["LITELLM_BASE_URL"],
            model=os.environ["LLM_MODEL"],
        )

        agent = create_react_agent(llm, tools)

        # 3. Єдина зміна: config з callbacks
        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": "Знайди BMW X5 дизель до 20000 доларів"}]},
            config={"callbacks": [langfuse_handler]}  # ← ось і все
        )

        print(result["messages"][-1].content)

    # Важливо: flush перед завершенням
    langfuse_handler.flush()


asyncio.run(main())
