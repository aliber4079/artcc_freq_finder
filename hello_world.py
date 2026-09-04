from pathlib import Path

TEXT = "hello world"

print(TEXT)
Path(__file__).with_name("hello_world.txt").write_text(TEXT, encoding="utf-8")
