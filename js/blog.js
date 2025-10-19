// js/blog.js
(function () {
  const ready = (cb) =>
    document.readyState !== "loading"
      ? cb()
      : document.addEventListener("DOMContentLoaded", cb);

  ready(() => {
    const article = document.querySelector("#article");
    const tocNav  = document.querySelector("#toc");
    if (!article || !tocNav) return;

    // Lấy H2/H3 trong bài để dựng mục lục
    const headings = [...article.querySelectorAll("h2, h3")];

    // Tạo id thân thiện nếu thiếu (loại dấu tiếng Việt)
    const slugify = (s) =>
      s.toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")
        .replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

    headings.forEach(h => {
      if (!h.id) {
        const sec = h.closest("section");
        h.id = sec?.id || slugify(h.textContent);
      }
    });

    // Dựng UL lồng nhau theo cấp H2/H3
    const root = document.createElement("ul");
    let currentLevel = 2;
    let parent = root;

    headings.forEach(h => {
      const level = Number(h.tagName.slice(1)); // 2 hoặc 3
      let list = parent;

      if (level > currentLevel) {
        const nested = document.createElement("ul");
        parent.lastElementChild && parent.lastElementChild.appendChild(nested);
        list = nested;
      } else if (level < currentLevel) {
        list = parent.parentElement?.closest("ul") || root;
      }
      currentLevel = level;

      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent.replace(/^\d+\)\s*/, ""); // bỏ tiền tố "1) "
      li.appendChild(a);
      list.appendChild(li);
      parent = list;
    });

    tocNav.innerHTML = "";
    tocNav.appendChild(root);

    // Highlight mục đang xem
    const links = tocNav.querySelectorAll("a");
    const map = new Map([...links].map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove("active"));
          const link = map.get(e.target.id);
          link && link.classList.add("active");
        }
      });
    }, { rootMargin: "0px 0px -70% 0px", threshold: 0.01 });

    headings.forEach(h => io.observe(h));
  });
})();
