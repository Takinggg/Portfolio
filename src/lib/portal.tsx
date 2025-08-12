import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: Element;
}

/**
 * Portal component to render children outside the normal component tree
 * This is useful for modals, tooltips, and other overlays
 */
export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    // Use provided container or create a default one
    let node = container;
    
    if (!node) {
      // Create a portal root if it doesn't exist
      node = document.getElementById('portal-root');
      if (!node) {
        node = document.createElement('div');
        node.id = 'portal-root';
        document.body.appendChild(node);
      }
    }
    
    setMountNode(node);
    
    return () => {
      // Clean up only if we created the node
      if (!container && node && node.id === 'portal-root' && !node.hasChildNodes()) {
        document.body.removeChild(node);
      }
    };
  }, [container]);

  return mountNode ? createPortal(children, mountNode) : null;
};

export default Portal;