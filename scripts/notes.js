const fs = require("fs");
const path = require("path");
const pageCountCache = new Map();

function readPageCount(filePath) {
  const stat = fs.statSync(filePath);
  const cacheKey = `${filePath}:${stat.size}:${stat.mtimeMs}`;
  if (pageCountCache.has(cacheKey)) {
    return pageCountCache.get(cacheKey);
  }

  const source = fs.readFileSync(filePath).toString("latin1");
  const counts = [];
  const patterns = [
    /\/Type\s*\/Pages[\s\S]{0,300}?\/Count\s+(\d+)/g,
    /\/Count\s+(\d+)[\s\S]{0,300}?\/Type\s*\/Pages/g
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      counts.push(Number(match[1]));
    }
  });

  const result = counts.length ? Math.max(...counts) : null;
  pageCountCache.set(cacheKey, result);
  return result;
}

function formatFileSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getNotes() {
  const notesDir = path.join(hexo.source_dir, "notes");
  const data = hexo.locals.get("data") || {};
  const rawEntries = Array.isArray(data.notes)
    ? data.notes
    : Array.isArray(data.notes && data.notes.notes)
      ? data.notes.notes
      : [];
  const entriesByFile = new Map(rawEntries.map((entry) => [entry.file, entry]));

  if (!fs.existsSync(notesDir)) {
    return [];
  }

  return fs.readdirSync(notesDir)
    .filter((file) => path.extname(file).toLowerCase() === ".pdf")
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((file) => {
      const filePath = path.join(notesDir, file);
      const stat = fs.statSync(filePath);
      const entry = entriesByFile.get(file) || {};
      const fallbackTitle = path.basename(file, path.extname(file));
      const routeName = entry.slug || fallbackTitle;

      return {
        file,
        title: entry.title || fallbackTitle,
        subject: entry.subject || "课程手写笔记",
        description: entry.description || "完整 PDF 课堂笔记，保留原始公式、图示与批注。",
        updated: entry.updated || "",
        tags: Array.isArray(entry.tags) ? entry.tags : [],
        pages: readPageCount(filePath),
        size: formatFileSize(stat.size),
        fileUrl: `/notes/${encodeURIComponent(file)}`,
        pageUrl: `/notes/library/${encodeURIComponent(routeName)}/`,
        routePath: `notes/library/${routeName}/index.html`
      };
    });
}

hexo.extend.helper.register("sitePdfNotes", function sitePdfNotes() {
  return getNotes();
});

hexo.extend.generator.register("pdf-note-pages", function pdfNotePages() {
  return getNotes().map((note) => ({
    path: note.routePath,
    layout: "pdf-note",
    data: {
      title: note.title,
      note
    }
  }));
});
