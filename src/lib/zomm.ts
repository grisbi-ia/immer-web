export function zoom(node, scale = 1.04) {
    // Use a more performant animation approach
    let zoomInApplied = false;
    
    function zoomIn() {
        if (!zoomInApplied) {
            zoomInApplied = true;
            // Use requestAnimationFrame for smoother transitions
            requestAnimationFrame(() => {
                node.style.transform = `scale(${scale})`;
            });
        }
    }
    
    function zoomOut() {
        zoomInApplied = false;
        requestAnimationFrame(() => {
            node.style.transform = 'scale(1)';
        });
    }
    
    // Don't add transition on mount, only apply when needed
    function handleTransitionStart() {
        node.style.transition = '0.3s transform';
    }
    
    // Add event listeners with passive option for better performance
    node.addEventListener('mouseenter', handleTransitionStart, { passive: true });
    node.addEventListener('mouseenter', zoomIn, { passive: true });
    node.addEventListener('mouseleave', zoomOut, { passive: true });

    return {
        destroy() {
            node.removeEventListener('mouseenter', handleTransitionStart);
            node.removeEventListener('mouseenter', zoomIn);
            node.removeEventListener('mouseleave', zoomOut);
        }
    }
}