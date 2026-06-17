from mcp.server.fastmcp import FastMCP

mcp = FastMCP("workshop")


@mcp.tool()
def add(a: int, b: int) -> int:
    """Додає два числа і повертає результат."""
    return a + b


mcp.run()
