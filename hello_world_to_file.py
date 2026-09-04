from pathlib import Path


Path('hello_world.txt').write_text('hello world\n', encoding='utf-8')
print('Wrote hello_world.txt')
