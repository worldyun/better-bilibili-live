document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的设置
    chrome.storage.sync.get(['removeMask', 'originalQuality'], function(result) {
      document.getElementById('maskToggle').checked = result.removeMask !== false;
      document.getElementById('qualityToggle').checked = result.originalQuality !== false;
    });
  
    // 保存设置
    document.getElementById('maskToggle').addEventListener('change', function(e) {
      chrome.storage.sync.set({ removeMask: e.target.checked });
    });
  
    document.getElementById('qualityToggle').addEventListener('change', function(e) {
      chrome.storage.sync.set({ originalQuality: e.target.checked });
    });
  });