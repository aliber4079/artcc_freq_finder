from pathlib import Path

TEXT = "hello world"

print(TEXT)
Path("hello_world.txt").write_text(TEXT, encoding="utf-8")
