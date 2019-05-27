
window.addEventListener('load', () => {
    canvasInit();

    // Init sockets
    app.initiateSockets();
    wboard.initSocketHandlers();
    chatui.initSocketHandlers(); appui.initSocketHandlers();
    
    // Refresh available groups
    appui.forceGlobalGroupRefresh();
});
