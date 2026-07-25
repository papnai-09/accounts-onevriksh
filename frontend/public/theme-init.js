try {
  var t = localStorage.getItem('theme');
  var s = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (t === 'dark' || (!t && s)) {
    document.documentElement.classList.add('dark');
  }
} catch (_) {}
