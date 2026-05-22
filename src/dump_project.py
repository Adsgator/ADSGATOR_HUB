"""
dump_project.py — Project Snapshot Generator
=============================================
Gera um snapshot completo de qualquer projeto em um único arquivo .md
Uso: python dump_project.py [pasta_raiz] [--output arquivo.md]

Exemplos:
  python dump_project.py
  python dump_project.py ./meu-projeto
  python dump_project.py ./meu-projeto --output snapshot.md
  python dump_project.py --max-lines 500
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

# ─── Configurações ────────────────────────────────────────────────────────────

# Pastas inteiras que serão ignoradas (em qualquer nível)
IGNORE_DIRS = {
    "node_modules", ".venv", "venv", "env", ".env",
    "__pycache__", ".git", ".svn", ".hg",
    "dist", "build", ".next", ".nuxt", "out",
    ".cache", ".parcel-cache", ".turbo",
    "uploads", "static/uploads", "media",
    ".idea", ".vscode", ".vs",
    "coverage", ".nyc_output", ".pytest_cache",
    "eggs", "*.egg-info", ".tox",
    "target",  # Rust/Java
    "vendor",  # Go/PHP
    "Pods",    # iOS
    ".gradle", # Android
    "docs",    # docs
}

# Extensões de arquivo que serão ignoradas (binários, mídia, etc)
IGNORE_EXTENSIONS = {
    # Imagens
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
    ".bmp", ".tiff", ".tif", ".raw", ".psd", ".ai", ".eps",
    # Vídeos
    ".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv",
    # Áudio
    ".mp3", ".wav", ".ogg", ".flac", ".aac",
    # Fontes
    ".ttf", ".otf", ".woff", ".woff2", ".eot",
    # Binários / Compilados
    ".exe", ".dll", ".so", ".dylib", ".bin", ".obj", ".o",
    ".pyc", ".pyo", ".pyd", ".class",
    # Comprimidos
    ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2",
    # Banco de dados
    ".db", ".sqlite", ".sqlite3",
    # Lock files (grandes e inúteis pra análise)
    # (detectados pelo nome, abaixo)
    # Documentos binários
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    # Outros
    ".map",  # Source maps
    ".min.js", ".min.css",  # Minificados
    ".chunk.js",  # Chunks de build
}

# Arquivos específicos que serão ignorados (por nome exato)
IGNORE_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "poetry.lock", "Pipfile.lock", "composer.lock",
    "Gemfile.lock", "cargo.lock", ".DS_Store", "Thumbs.db",
    ".env", ".env.local", ".env.production", ".env.development",
    "dump_project.py",  # o próprio script
    "project_snapshot.md",
}

# Extensões de texto que serão incluídas
TEXT_EXTENSIONS = {
    # Web
    ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx",
    ".html", ".htm", ".css", ".scss", ".sass", ".less",
    # Python
    ".py", ".pyi",
    # Configs
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
    ".env.example", ".env.template",
    # Markdown / Docs
    ".md", ".mdx", ".rst", ".txt",
    # Scripts
    ".sh", ".bat", ".cmd", ".ps1",
    # Outros
    ".xml", ".graphql", ".prisma", ".sql",
    ".vue", ".svelte", ".astro",
    ".go", ".rs", ".java", ".kt", ".swift", ".c", ".cpp", ".h",
    ".rb", ".php", ".cs",
    ".r", ".R",
    # Config sem extensão (detectar pelo nome)
}

# Arquivos sem extensão que devem ser incluídos
INCLUDE_NO_EXT = {
    "Makefile", "Dockerfile", "Procfile", "Pipfile",
    "Gemfile", "Rakefile", "Brewfile",
    ".gitignore", ".gitattributes", ".editorconfig",
    ".prettierrc", ".eslintrc", ".babelrc",
    "requirements.txt",
}

# Número máximo de linhas por arquivo (evitar arquivos enormes)
DEFAULT_MAX_LINES = 1000
DEFAULT_MAX_FILE_SIZE_KB = 200

# ─── Funções ──────────────────────────────────────────────────────────────────

def should_ignore_dir(dir_name: str) -> bool:
    return dir_name in IGNORE_DIRS or dir_name.startswith(".")

def should_include_file(filepath: Path, max_size_kb: int) -> tuple[bool, str]:
    """Retorna (incluir, motivo_exclusão)"""
    name = filepath.name
    ext = filepath.suffix.lower()

    # Ignorar arquivos específicos
    if name in IGNORE_FILES:
        return False, f"arquivo ignorado por nome"

    # Ignorar extensões binárias
    if ext in IGNORE_EXTENSIONS:
        return False, f"extensão binária/media ({ext})"

    # Verificar tamanho
    try:
        size_kb = filepath.stat().st_size / 1024
        if size_kb > max_size_kb:
            return False, f"arquivo muito grande ({size_kb:.0f}KB > {max_size_kb}KB)"
    except OSError:
        return False, "erro ao acessar arquivo"

    # Arquivo sem extensão
    if not ext:
        if name in INCLUDE_NO_EXT:
            return True, ""
        # Ignorar outros sem extensão (binários, etc)
        return False, "sem extensão conhecida"

    # Extensão de texto conhecida
    if ext in TEXT_EXTENSIONS:
        return True, ""

    # Tentar ler como texto (detecção automática)
    try:
        with open(filepath, "r", encoding="utf-8", errors="strict") as f:
            f.read(512)  # Ler só os primeiros 512 bytes
        return True, ""  # É texto válido
    except (UnicodeDecodeError, OSError):
        return False, "arquivo binário (detecção automática)"


def get_language(filepath: Path) -> str:
    """Retorna a linguagem para syntax highlighting no markdown."""
    ext = filepath.suffix.lower()
    name = filepath.name
    
    mapping = {
        ".py": "python", ".pyi": "python",
        ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
        ".jsx": "jsx", ".ts": "typescript", ".tsx": "tsx",
        ".html": "html", ".htm": "html",
        ".css": "css", ".scss": "scss", ".sass": "sass", ".less": "less",
        ".json": "json", ".yaml": "yaml", ".yml": "yaml",
        ".toml": "toml", ".ini": "ini", ".cfg": "ini", ".conf": "ini",
        ".md": "markdown", ".mdx": "markdown",
        ".sh": "bash", ".bat": "bat", ".cmd": "bat", ".ps1": "powershell",
        ".sql": "sql", ".graphql": "graphql",
        ".xml": "xml",
        ".vue": "vue", ".svelte": "svelte",
        ".go": "go", ".rs": "rust", ".java": "java",
        ".kt": "kotlin", ".swift": "swift",
        ".c": "c", ".cpp": "cpp", ".h": "c",
        ".rb": "ruby", ".php": "php", ".cs": "csharp",
        ".txt": "text",
    }

    names_mapping = {
        "Dockerfile": "dockerfile",
        "Makefile": "makefile",
        ".gitignore": "gitignore",
        "requirements.txt": "text",
    }

    return names_mapping.get(name, mapping.get(ext, "text"))


def build_tree(root: Path, prefix: str = "", ignore_hidden: bool = True) -> list[str]:
    """Gera árvore de arquivos estilo 'tree'."""
    lines = []
    try:
        entries = sorted(root.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
    except PermissionError:
        return lines

    visible = []
    for entry in entries:
        if entry.is_dir():
            if should_ignore_dir(entry.name):
                continue
        else:
            if entry.name in IGNORE_FILES:
                continue
            if entry.suffix.lower() in IGNORE_EXTENSIONS:
                continue
        visible.append(entry)

    for i, entry in enumerate(visible):
        is_last = i == len(visible) - 1
        connector = "└── " if is_last else "├── "
        extension = "    " if is_last else "│   "

        if entry.is_dir():
            lines.append(f"{prefix}{connector}📁 {entry.name}/")
            lines.extend(build_tree(entry, prefix + extension, ignore_hidden))
        else:
            size_kb = entry.stat().st_size / 1024
            size_str = f" ({size_kb:.1f}KB)" if size_kb > 10 else ""
            lines.append(f"{prefix}{connector}📄 {entry.name}{size_str}")

    return lines


def collect_files(root: Path, max_size_kb: int) -> list[tuple[Path, str]]:
    """Coleta todos os arquivos a incluir, com linguagem."""
    files = []

    for dirpath, dirnames, filenames in os.walk(root):
        # Filtrar pastas ignoradas (modifica in-place para o walk não entrar)
        dirnames[:] = sorted([
            d for d in dirnames
            if not should_ignore_dir(d)
        ])

        for filename in sorted(filenames):
            filepath = Path(dirpath) / filename
            include, reason = should_include_file(filepath, max_size_kb)
            if include:
                lang = get_language(filepath)
                files.append((filepath, lang))

    return files


def read_file_safe(filepath: Path, max_lines: int) -> tuple[str, bool]:
    """Lê arquivo com segurança, retorna (conteúdo, truncado)."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    
    for encoding in encodings:
        try:
            with open(filepath, "r", encoding=encoding) as f:
                lines = f.readlines()
            
            truncated = len(lines) > max_lines
            content = "".join(lines[:max_lines])
            return content, truncated
        except (UnicodeDecodeError, OSError):
            continue
    
    return "[❌ Erro: não foi possível ler este arquivo]", False


def generate_snapshot(
    root_dir: str = ".",
    output_file: str = "project_snapshot.md",
    max_lines: int = DEFAULT_MAX_LINES,
    max_size_kb: int = DEFAULT_MAX_FILE_SIZE_KB,
    ignore_extra: list = None,
) -> None:
    root = Path(root_dir).resolve()
    output = Path(output_file)

    if not root.exists():
        print(f"❌ Pasta não encontrada: {root}")
        sys.exit(1)

    print(f"\n🔍 Analisando projeto em: {root}")
    print(f"📄 Output: {output.resolve()}")
    print(f"⚙️  Limite por arquivo: {max_lines} linhas / {max_size_kb}KB")
    print("─" * 60)

    if ignore_extra:
        IGNORE_DIRS.update(ignore_extra)
        print(f"🚫 Ignorando pastas extras: {', '.join(ignore_extra)}")
        
    # Coletar arquivos
    files = collect_files(root, max_size_kb)
    print(f"\n✅ {len(files)} arquivos encontrados\n")

    # Gerar árvore
    tree_lines = build_tree(root)

    # Escrever output
    with open(output, "w", encoding="utf-8") as out:

        # ── Header ──
        out.write(f"# Project Snapshot\n\n")
        out.write(f"**Projeto:** `{root.name}`  \n")
        out.write(f"**Gerado em:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n")
        out.write(f"**Total de arquivos:** {len(files)}  \n")
        out.write(f"**Raiz:** `{root}`  \n\n")
        out.write("---\n\n")

        # ── Árvore de Arquivos ──
        out.write("## 📁 Estrutura de Arquivos\n\n")
        out.write("```\n")
        out.write(f"{root.name}/\n")
        for line in tree_lines:
            out.write(line + "\n")
        out.write("```\n\n")
        out.write("---\n\n")

        # ── Conteúdo dos Arquivos ──
        out.write("## 📄 Conteúdo dos Arquivos\n\n")

        for filepath, lang in files:
            relative = filepath.relative_to(root)
            content, truncated = read_file_safe(filepath, max_lines)

            out.write(f"### `{relative}`\n\n")

            if truncated:
                out.write(f"> ⚠️ **Truncado:** mostrando primeiras {max_lines} linhas\n\n")

            out.write(f"```{lang}\n")
            out.write(content)
            if not content.endswith("\n"):
                out.write("\n")
            out.write("```\n\n")

            print(f"  ✔ {relative}")

    # ── Estatísticas ──
    output_size = output.stat().st_size / 1024
    print(f"\n{'─' * 60}")
    print(f"✅ Snapshot gerado com sucesso!")
    print(f"📄 Arquivo: {output.resolve()}")
    print(f"📦 Tamanho: {output_size:.1f}KB ({output_size/1024:.2f}MB)")
    print(f"📊 Arquivos incluídos: {len(files)}")
    print(f"\n💡 Próximo passo: Fazer upload de '{output.name}' no chat com Claude")
    print("─" * 60 + "\n")


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Gera um snapshot completo de qualquer projeto em um único arquivo .md",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python dump_project.py
  python dump_project.py ./meu-projeto
  python dump_project.py ./meu-projeto --output snapshot.md
  python dump_project.py . --max-lines 500 --max-size 100
        """
    )
    
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Pasta raiz do projeto (padrão: pasta atual)"
    )
    parser.add_argument(
        "--output", "-o",
        default="project_snapshot.md",
        help="Nome do arquivo de saída (padrão: project_snapshot.md)"
    )
    parser.add_argument(
        "--max-lines",
        type=int,
        default=DEFAULT_MAX_LINES,
        help=f"Máximo de linhas por arquivo (padrão: {DEFAULT_MAX_LINES})"
    )
    parser.add_argument(
        "--max-size",
        type=int,
        default=DEFAULT_MAX_FILE_SIZE_KB,
        help=f"Tamanho máximo por arquivo em KB (padrão: {DEFAULT_MAX_FILE_SIZE_KB}KB)"
    )
    parser.add_argument(
        "--ignore",
        nargs="*",
        default=[],
        help="Pastas extras para ignorar (ex: --ignore docs tests)"
    )

    args = parser.parse_args()

    generate_snapshot(
        root_dir=args.root,
        output_file=args.output,
        max_lines=args.max_lines,
        max_size_kb=args.max_size,
        ignore_extra=args.ignore,
    )
