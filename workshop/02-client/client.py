import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    params = StdioServerParameters(
        command="python",
        args=["./01-server/server.py"]
    )

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools_result = await session.list_tools()
            print("Інструменти:", [t.name for t in tools_result.tools])

            result = await session.call_tool("add", {"a": 5, "b": 3})
            print("5 + 3 =", result.content[0].text)


asyncio.run(main())
