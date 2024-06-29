const setWidth = <HTMLButtonElement>document.getElementById('setWidth');
const inputLeftWidth = <HTMLInputElement>document.getElementById('inputLeftWidth');
const inputRightWidth = <HTMLInputElement>document.getElementById('inputRightWidth');

setWidth.addEventListener('click', function() {
    const leftWidth = inputLeftWidth.value;
    const rightWidth = inputRightWidth.value;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        if (activeTab.id !== undefined) {
            chrome.tabs.sendMessage(
                activeTab.id, 
                {
                    action: 'setWidth',
                    leftWidth: leftWidth,
                    rightWidth: rightWidth
                },
                (response) => {
                console.log('Response from content script:', response);
            });
        }
    });
});
