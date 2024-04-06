// Lightly modified from https://github.com/NASA-IMPACT/veda-ui/blob/main/app/scripts/components/common/map/controls/hooks/use-themed-control.tsx
import { IControl } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useControl } from 'react-map-gl';

export default function useMakeControl(renderFn, opts) {
  
  const elementRef = useRef(null);
  const rootRef = useRef(null);

  // Define the control methods and its lifecycle
  class MadeControl implements IControl {
    onAdd() {
      const el = document.createElement('div');
      el.className = 'maplibregl-ctrl';
      elementRef.current = el;

      // Create a root and render the component
      rootRef.current = createRoot(el);
      rootRef.current.render(renderFn());
      return el;
    }

    onRemove() {
      // Cleanup if necessary.
      // Defer to next tick.
      setTimeout(() => {
        if (elementRef.current) {
          rootRef.current?.unmount();
          rootRef.current = null;
        }
      }, 1);
    }
  }

  // Listen for changes in dependencies and re-render if necessary
  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.render(renderFn());
    }
  }, [renderFn]);

  useControl(() => new MadeControl(), opts);

  return null;
}
