hexo.extend.filter.register("before_post_render", function preserveMath(data) {
  if (!data.math || !data.content) return data;

  data.content = data.content
    .replace(/\\\[([\s\S]*?)\\\]/g, function displayMath(_, formula) {
      return `<div class="math-display">&#92;[${formula}&#92;]</div>`;
    })
    .replace(/\\\((.+?)\\\)/g, function inlineMath(_, formula) {
      return `<span class="math-inline">&#92;(${formula}&#92;)</span>`;
    });

  return data;
});
