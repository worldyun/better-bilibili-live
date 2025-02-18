let observerTimeout = 10000;    // 观察器超时时间
let waitForElementTimeout = 3000;   // 获取element超时时间
//-----------------------------------------------直播去马-------------------------------------------
function modifyZIndex() {
    const targetElement = document.getElementById('web-player-module-area-mask-panel');

    if (targetElement) {
        console.log('[Better Bilibili Live] 已去除直播马赛克遮罩');
        targetElement.style.zIndex = '-2';
    }
}

// 初始化遮罩去除
function initMaskRemoval() {
    // 主执行逻辑
    window.addEventListener('load', () => {
        // 尝试立即执行
        modifyZIndex();

        // 额外添加MutationObserver防止动态加载
        const maskObserver = new MutationObserver((mutations, obs) => {
            if (document.getElementById('web-player-module-area-mask-panel')) {
                obs.disconnect(); // 找到后停止观察
                clearTimeout(fallbackTimeout);
                modifyZIndex();
            }
        });

        // 安全停止观察机制
        const fallbackTimeout = setTimeout(() => {
            maskObserver.disconnect();
            console.log('[Better Bilibili Live] 直播马赛克观察器已超时停止');
        }, observerTimeout);

        // 开始观察
        maskObserver.observe(document.querySelector('.live-player-mounter'), {
            childList: true,
            subtree: true
        });
    });
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
        const element = document.querySelector(selector);
        if (element) return element;
        await new Promise(r => setTimeout(r, 50));
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
}

async function switchToOriginalQuality() {
    try {
        const qualityWrap = await waitForElement('.quality-wrap');

        // 展开画质菜单
        createMouseEvent('mouseenter', qualityWrap);
        await waitForElement('.line-wrap');

        // 在第一个子元素中查找画质选项
        const qualityList = qualityWrap.children[0];
        if (!qualityList) throw new Error('Quality list not found');

        // 寻找原画按钮
        const originalQuality = [...qualityList.children].find(item =>
            item.innerText?.trim().toLowerCase() === '原画'
        );

        if (originalQuality) {
            createMouseEvent('click', originalQuality);
            console.log('[Better Bilibili Live] 已切换到原画质');

        } else {
            console.warn('[Better Bilibili Live] 未找到原画选项');
        }

        // 收起画质菜单
        createMouseEvent('mouseleave', qualityWrap);
    } catch (error) {
        console.error('[Better Bilibili Live] 画质切换失败:', error);
    }
}

async function modifyQuality() {
    try {
        // 等待播放控件加载
        const controllerWrap = await waitForElement('.web-player-controller-wrap', waitForElementTimeout);
        console.log('[Better Bilibili Live] 播放控件已加载');

        // 激活控件交互
        createMouseEvent('mousemove', controllerWrap);

        // 执行画质切换
        await switchToOriginalQuality();
    } catch (error) {
        console.error('[Better Bilibili Live] 播放控件加载失败:', error);
    }
}

function initializeObserver() {
    const controllerObserver = new MutationObserver(async (_, obs) => {
        if (document.querySelector('.web-player-controller-wrap')) {
            obs.disconnect();
            clearTimeout(fallbackTimeout);
            // await new Promise(r => setTimeout(r, 3000)); // 等待控件完全初始化
            modifyQuality();
        }
    });

    // 安全停止观察机制
    const fallbackTimeout = setTimeout(() => {
        controllerObserver.disconnect();
        console.log('[Better Bilibili Live] 直播画质观察器已超时停止');
    }, observerTimeout);

    controllerObserver.observe(document.querySelector('.live-player-mounter'), {
        childList: true,
        subtree: true,
        attributes: true // 增加属性变化监听
    });
}

// 初始化画质控制
function initQualityControl() {
    window.addEventListener('load', () => {
        // 兼容页面动态加载
        if (document.readyState === 'complete') {
            initializeObserver();
        } else {
            window.addEventListener('DOMContentLoaded', initializeObserver);
        }
    });
}

// 配置存储
let config = {
    removeMask: true,
    originalQuality: true
};

// 从存储中加载配置
chrome.storage.sync.get(['removeMask', 'originalQuality'], function (result) {
    Object.assign(config, result);
    if (config.removeMask) initMaskRemoval();
    if (config.originalQuality) initQualityControl();
});