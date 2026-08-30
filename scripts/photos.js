const fs = require("fs");
const path = require("path");

const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

hexo.extend.helper.register("sitePhotos", function sitePhotos() {
  const photoDir = path.join(hexo.source_dir, "images", "photos");
  const data = hexo.locals.get("data") || {};
  const rawEntries = Array.isArray(data.photos)
    ? data.photos
    : Array.isArray(data.photos && data.photos.photos)
      ? data.photos.photos
      : [];
  const entriesByFile = new Map(rawEntries.map((entry) => [entry.file, entry]));

  if (!fs.existsSync(photoDir)) {
    return [];
  }

  return fs.readdirSync(photoDir)
    .filter((file) => PHOTO_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((file, index) => {
      const entry = entriesByFile.get(file) || {};
      const title = entry.title || path.basename(file, path.extname(file));

      return {
        file,
        src: this.url_for(`/images/photos/${file}`),
        title,
        date: entry.date || "",
        location: entry.location || "",
        camera: entry.camera || "",
        story: entry.story || "这里以后写这张照片的故事。",
        index: index + 1
      };
    });
});
