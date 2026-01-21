// 简约风格不需要复杂的粒子背景和光标逻辑
// 仅保留基础交互，如需添加简单的滚动效果或其他微交互可在此处添加

console.log('Clean theme loaded.');

// 如果需要平滑滚动或其他基础功能
document.addEventListener('DOMContentLoaded', () => {
    // 简单的淡入效果
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = 0;
        main.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 600,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }
});
