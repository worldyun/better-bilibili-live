(function () {
    'use strict';

    const waitForElementTimeout = 5000;   // 获取element超时时间
    const waitFormaskPanelTimeout = 15000;  // 获取马赛克遮罩超时时间
    let iframeDocument = null;

    //-----------------------------------------------直播去马-------------------------------------------

    // 初始化遮罩去除
    async function initMaskRemoval() {
        if (!isLiveRome()) return;
        modifyZIndex();
    }

    async function modifyZIndex() {
        try {
            const maskPanel = await waitForElement('#web-player-module-area-mask-panel', waitFormaskPanelTimeout);
            maskPanel.style.zIndex = '-2';
            console.log('[Better Bilibili Live] 直播马赛克已去除');
        } catch (error) {
            console.log('[Better Bilibili Live] 未找到直播马赛克');
        }
    }

    // 判断当前页面url是否为直播间页面
    function isLiveRome() {
        const currentUrl = window.location.href;
        const urlPattern = /^https?:\/\/live\.bilibili\.com\/\d+.*$/;
        return urlPattern.test(currentUrl);
    }

    //---------------------------------------------改原画--------------------------------------------------
    function createMouseEvent(type, element) {
        const event = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
        return event;
    }

    async function waitForElement(selector, timeout = waitForElementTimeout) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const element = (iframeDocument || document).querySelector(selector);
            if (element) return element;
            await new Promise(r => setTimeout(r, 50));
        }
        throw new Error(`Element ${selector} not found within ${timeout}ms`);
    }

    async function switchToOriginalQuality() {
        try {
            const qualityWrap = await waitForElement('.quality-wrap');

            createMouseEvent('mouseenter', qualityWrap);
            await waitForElement('.line-wrap');

            const qualityList = qualityWrap.children[0];
            if (!qualityList) throw new Error('Quality list not found');

            const originalQuality = [...qualityList.children].find(item =>
                item.innerText === '原画'
            );

            if (originalQuality) {
                createMouseEvent('click', originalQuality);
                console.log('[Better Bilibili Live] 已切换到原画质');
            } else {
                console.warn('[Better Bilibili Live] 未找到原画选项');
            }

            createMouseEvent('mouseleave', qualityWrap);
        } catch (error) {
            console.error('[Better Bilibili Live] 画质切换失败:', error);
        }
    }

    async function modifyQuality() {
        try {
            const controllerWrap = await waitForElement('#web-player-controller-wrap-el');
            console.log('[Better Bilibili Live] 播放控件已加载');

            createMouseEvent('mousemove', controllerWrap);
            await switchToOriginalQuality();
        } catch (error) {
            console.error('[Better Bilibili Live] 播放控件加载失败:', error);
        }
    }

    async function initModifyQuality() {
        if (!isLiveRome()) return;
        await modifyQuality();
    }

    // 配置存储
    let config = {
        removeMask: true,
        originalQuality: true
    };

    function initAll() {
        if (config.removeMask) initMaskRemoval();
        if (config.originalQuality) initModifyQuality();
    }

    function loadConfig() {
        // 从存储中加载配置
        chrome.storage.sync.get(['removeMask', 'originalQuality'], async function (result) {
            Object.assign(config, result);
            const livePlayerMounter = document.querySelector('.live-player-mounter');
            if (!livePlayerMounter) {
                const liveIframe = await waitForElement('iframe[src*="live.bilibili.com/blanc"]');
                if (!liveIframe) return;
                liveIframe.contentWindow.addEventListener('load', async () => {
                    if (liveIframe.contentWindow.document.readyState === 'complete') {
                        iframeDocument = liveIframe.contentWindow.document;
                        initAll();
                    } else {
                        liveIframe.contentWindow.addEventListener('DOMContentLoaded', async () => {
                            iframeDocument = liveIframe.contentWindow.document;
                            initAll();
                        }, { once: true });
                    }
                }, { once: true });
                return;
            }
            initAll();
        });
    }

    window.addEventListener('load', async () => {
        if (document.readyState === 'complete') {
            loadConfig();
        } else {
            window.addEventListener('DOMContentLoaded', async () => {
                loadConfig();
            }, { once: true });
        }
    }, { once: true });

})();