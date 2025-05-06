(function() {
  // Set flag in sessionStorage that we've visited a page in the site
  // This helps us know we should reset zoom on subsequent page loads
  sessionStorage.setItem('needsZoomReset', 'true');
  
  // Force zoom reset before page renders
  function resetZoom() {
    try {
      // Most aggressive method - reset viewport completely
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        // First clear any existing viewport settings
        viewportMeta.setAttribute('content', '');
        // Force a reflow
        document.body && document.body.getBoundingClientRect();
        // Now set the viewport with zoom reset settings
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
        
        // After a short delay, restore user-scalable capability
        setTimeout(function() {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }, 300);
      } else {
        // If no viewport meta exists, create one
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
        document.getElementsByTagName('head')[0].appendChild(meta);
        
        // After a short delay, restore user-scalable capability
        setTimeout(function() {
          meta.content = 'width=device-width, initial-scale=1.0';
        }, 300);
      }
      
      // Firefox-specific zoom reset
      if (typeof document.body.style.MozTransform !== 'undefined') {
        document.body.style.MozTransform = 'scale(1.0)';
      }
      
      // Webkit-specific zoom reset
      if (typeof document.body.style.zoom !== 'undefined') {
        document.body.style.zoom = '1.0';
      }
    } catch(e) {
      console.error("Error in zoom reset:", e);
    }
  }
  
  // Execute zoom reset immediately
  if (document.readyState === 'loading') {
    // If still loading, add DOMContentLoaded listener
    document.addEventListener('DOMContentLoaded', resetZoom, {once: true});
  } else {
    // DOM already loaded, reset immediately
    resetZoom();
  }
  
  // Also reset when page becomes visible (handles tab switching)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      resetZoom();
    }
  });
  
  // Additional measure: when clicking on links, set flag for next page
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      sessionStorage.setItem('needsZoomReset', 'true');
    }
  });
  
  // Final attempt at zoom reset at window.onload
  window.addEventListener('load', resetZoom, {once: true});
})();
