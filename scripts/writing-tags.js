function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseArgs(args) {
  const options = {};
  const text = [];

  args.forEach((arg) => {
    const match = String(arg).match(/^([a-zA-Z_-]+):(.+)$/);
    if (match) {
      options[match[1]] = match[2];
    } else {
      text.push(String(arg).replace(/&nbsp;/g, " "));
    }
  });

  return {
    options,
    text: text.join(" ").trim()
  };
}

function renderMarkdown(content) {
  return hexo.render.renderSync({
    text: content || "",
    engine: "markdown"
  });
}

function className(base, color) {
  return color ? `${base} is-${escapeHtml(color)}` : base;
}

hexo.extend.tag.register("quot", function quotTag(args) {
  const parsed = parseArgs(args);
  const tagName = parsed.options.el || "div";
  const from = parsed.options.from || parsed.options.author || "";
  const safeTag = /^h[1-6]$|^div$|^p$/.test(tagName) ? tagName : "div";
  const body = escapeHtml(parsed.text);
  const cite = from ? `<cite>${escapeHtml(from)}</cite>` : "";

  return `<${safeTag} class="tag-quot"><span>${body}</span>${cite}</${safeTag}>`;
});

hexo.extend.tag.register("note", function noteTag(args, content) {
  const parsed = parseArgs(args);
  const title = parsed.text || "Note";
  const color = parsed.options.color || "default";

  return [
    `<aside class="${className("tag-note", color)}">`,
    `<p class="tag-note-title">${escapeHtml(title)}</p>`,
    `<div class="tag-note-body">${renderMarkdown(content)}</div>`,
    "</aside>"
  ].join("");
}, { ends: true });

hexo.extend.tag.register("spoiler", function spoilerTag(args, content) {
  const parsed = parseArgs(args);
  const label = parsed.text || parsed.options.label || "Sensitive";

  return [
    `<div class="spoiler-block tag-spoiler" tabindex="0" aria-label="悬停或聚焦显示隐藏内容">`,
    `<span class="tag-spoiler-label">${escapeHtml(label)}</span>`,
    renderMarkdown(content),
    "</div>"
  ].join("");
}, { ends: true });

hexo.extend.tag.register("blockquote", function blockquoteTag(args, content) {
  const parsed = parseArgs(args);
  const source = parsed.options.from || parsed.options.author || parsed.text || "";
  const trimmed = String(content || "").trim();
  const pair = trimmed.match(/^\{([\s\S]*?)\|([\s\S]*?)\}$/);
  const quote = pair
    ? `<p><span>${escapeHtml(pair[1].trim())}</span><small>${escapeHtml(pair[2].trim())}</small></p>`
    : renderMarkdown(trimmed);
  const cite = source ? `<footer>${escapeHtml(source)}</footer>` : "";

  return `<figure class="tag-blockquote"><blockquote>${quote}</blockquote>${cite}</figure>`;
}, { ends: true });

hexo.extend.tag.register("paper", function paperTag(args, content) {
  const parsed = parseArgs(args);
  const title = parsed.text || parsed.options.title || "";
  const author = parsed.options.author || "";
  const date = parsed.options.date || "";
  const footer = parsed.options.footer || "";
  const lines = String(content || "").split(/\r?\n/);
  const html = [];
  let mode = "paragraph";

  lines.forEach((line) => {
    const trimmed = line.trim();
    const directive = trimmed.match(/^<!--\s*(paragraph|line left|line right|section)\s*-->$/);
    if (directive) {
      mode = directive[1];
      return;
    }

    if (!trimmed) return;

    if (mode === "section") {
      html.push(`<h4>${escapeHtml(trimmed)}</h4>`);
    } else if (mode === "line left") {
      html.push(`<p class="line-left">${escapeHtml(trimmed)}</p>`);
    } else if (mode === "line right") {
      html.push(`<p class="line-right">${escapeHtml(trimmed)}</p>`);
    } else {
      html.push(`<p>${escapeHtml(trimmed)}</p>`);
    }
  });

  return [
    `<section class="tag-paper">`,
    title ? `<header><span>${escapeHtml(title)}</span>${author || date ? `<small>${escapeHtml([author, date].filter(Boolean).join(" · "))}</small>` : ""}</header>` : "",
    `<div class="tag-paper-body">${html.join("")}</div>`,
    footer ? `<footer>${escapeHtml(footer)}</footer>` : "",
    `</section>`
  ].join("");
}, { ends: true });

hexo.extend.tag.register("mark", function markTag(args) {
  const parsed = parseArgs(args);
  const color = parsed.options.color || "default";
  return `<mark class="${className("tag-mark", color)}">${escapeHtml(parsed.text)}</mark>`;
});

hexo.extend.tag.register("blur", function blurTag(args) {
  const parsed = parseArgs(args);
  return `<span class="tag-blur" tabindex="0">${escapeHtml(parsed.text)}</span>`;
});

hexo.extend.tag.register("psw", function passwordTag(args) {
  const parsed = parseArgs(args);
  return `<span class="tag-blur tag-password" tabindex="0">${escapeHtml(parsed.text)}</span>`;
});

hexo.extend.tag.register("u", function underlineTag(args) {
  const parsed = parseArgs(args);
  return `<span class="tag-underline">${escapeHtml(parsed.text)}</span>`;
});

hexo.extend.tag.register("wavy", function wavyTag(args) {
  const parsed = parseArgs(args);
  return `<span class="tag-wavy">${escapeHtml(parsed.text)}</span>`;
});

hexo.extend.tag.register("emp", function emphasisTag(args) {
  const parsed = parseArgs(args);
  return `<span class="tag-emphasis">${escapeHtml(parsed.text)}</span>`;
});

hexo.extend.tag.register("del", function deleteTag(args) {
  const parsed = parseArgs(args);
  return `<del class="tag-delete">${escapeHtml(parsed.text)}</del>`;
});
