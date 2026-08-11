(() => {
  if (window.VMUSF_STARTUP_GATE) return;
  const baseRender = window.render;
  if (typeof baseRender !== 'function') return;
  let queuedRoute = null;
  let released = false;

  function gateRender(route) {
    if (released) return baseRender(route);
    queuedRoute = route || queuedRoute || 'home';
  }

  window.render = gateRender;
  window.VMUSF_STARTUP_GATE = {
    release(route) {
      if (released) return;
      const target = route || queuedRoute || location.hash.slice(1) || 'home';
      released = true;
      /* Important: call the current window.render, not baseRender.
         Scripts loaded after this gate wrap render to bind features such as
         Assist, cases, notifications and forum controls. Calling baseRender
         directly would silently discard those wrappers. */
      window.render(target);
      document.documentElement.classList.add('vmusf-ready');
    }
  };
})();