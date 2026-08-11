(() => {
  if (window.VMUSF_STARTUP_GATE) return;
  const realRender = window.render;
  if (typeof realRender !== 'function') return;
  let queuedRoute = null;
  let released = false;
  window.VMUSF_STARTUP_GATE = {
    release(route) {
      if (released) return;
      released = true;
      const target = route || queuedRoute || location.hash.slice(1) || 'home';
      window.render = realRender;
      window.render(target);
      document.documentElement.classList.add('vmusf-ready');
    }
  };
  window.render = function(route) {
    if (released) return realRender(route);
    queuedRoute = route || queuedRoute || 'home';
  };
})();