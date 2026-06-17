# agent-traced.py — Python версія з Langfuse трасуванням
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

# НОВИЙ ІМПОРТ: Langfuse callback handler для LangChain
from langfuse.callback import CallbackHandler


async def main():
    # НОВА ІНІЦІАЛІЗАЦІЯ: handler читає ключі з .env
    langfuse_handler = CallbackHandler(
        public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
        secret_key=os.environ["LANGFUSE_SECRET_KEY"],
        host=os.environ["LANGFUSE_BASEURL"],
    )

    # Все те саме що в agent.py ↓
    async with MultiServerMCPClient({
        "workshop": {
            "transport": "stdio",
            "command": "python",
            "args": ["../01-server/server.py"],
        }
    }) as client:
        tools = await client.get_tools()

        llm = ChatOpenAI(
            api_key=os.environ["LITELLM_API_KEY"],
            base_url=os.environ["LITELLM_BASE_URL"],
            model=os.environ["LLM_MODEL"],
        )

        agent = create_react_agent(llm, tools)

        # ЄДИНА ЗМІНА: додаємо config з callbacks
        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": "Скільки буде 15 + 27?"}]},
            config={"callbacks": [langfuse_handler]}  # ← ось і все
        )

        print(result["messages"][-1].content)

    # ВАЖЛИВО: flush надсилає дані в Langfuse
    langfuse_handler.flush()


asyncio.run(main())
