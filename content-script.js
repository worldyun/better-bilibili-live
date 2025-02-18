//直播去马
function modifyZIndex() {
    const targetElement = document.getElementById('web-player-module-area-mask-panel');

    if (targetElement) {
        console.log('[Better Bilibili Live] 找到直播马赛克遮罩, 正在去除...');
        targetElement.style.zIndex = '-2';
    }
}

// 主执行逻辑
window.addEventListener('load', () => {
    // 尝试立即执行
    modifyZIndex();

    // 额外添加MutationObserver防止动态加载
    const observer = new MutationObserver((mutations, obs) => {
        if (document.getElementById('web-player-module-area-mask-panel')) {
            modifyZIndex();
            obs.disconnect(); // 找到后停止观察
        }
    });

    // 开始观察整个文档的变化
    observer.observe(document, {
        childList: true,
        subtree: true
    });

    setTimeout(() => {
        observer.disconnect();
    }, 30000); // 30秒延迟后停止观察
});

//改原画
function modifyQuality() {
    //延迟3秒执行, 确保播放控件加载完全
    setTimeout(() => {
        //获取并显示直播视频控件
        const controllerWrap = document.querySelector('.web-player-controller-wrap');
        if (controllerWrap) {
            console.log('[Better Bilibili Live] 找到播放控件, 正在显示画质切换选择框...');
            controllerWrap.dispatchEvent(new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            //延时100ms后, 获取并显示画质选择框
            setTimeout(() => {
                //获取并点击原画按钮
                const qualityWrap = document.querySelector('.quality-wrap');
                if (qualityWrap && qualityWrap.children[0].innerText !== '原画') {
                    qualityWrap.dispatchEvent(new MouseEvent('mouseenter', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    //延时100ms后, 获取并点击原画按钮
                    setTimeout(() => {
                        if (qualityWrap.childElementCount > 1 && qualityWrap.children[1].innerText !== '原画') {
                            for (let i = 0; i < qualityWrap.children[0].childElementCount; i++) {
                                if (qualityWrap.children[0].children[i].innerText === '原画') {
                                    qualityWrap.children[0].children[i].dispatchEvent(new MouseEvent('click', {
                                        bubbles: true,
                                        cancelable: true,
                                        view: window
                                    }));
                                    console.log('[Better Bilibili Live] 找到原画按钮, 正在切换原画...');
                                    break;
                                }
                            }
                        };
                        qualityWrap.dispatchEvent(new MouseEvent('mouseleave', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        }));
                    }, 100);
                }
            }, 100);
        }
    }, 3000);
}

window.addEventListener('load', () => {
    const controllerObserver = new MutationObserver((mutations, obs) => {
        if (document.querySelector('.web-player-controller-wrap')) {
            modifyQuality();
            obs.disconnect(); // 找到后停止观察
        }
    });

    controllerObserver.observe(document, {
        childList: true,
        subtree: true
    });
    
    setTimeout(() => {
        controllerObserver.disconnect();
    }, 30000); // 30秒延迟后停止观察
});