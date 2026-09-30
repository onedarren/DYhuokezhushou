/*
 * 抖音自动获客助手 —— 开源模块：启动引导
 * 本文件属于项目的开源部分，基于 MIT 协议发布。
 */

function main() {
  if (window.top !== window.self) return;
  if (document.getElementById('dycap-root')) return;
  panel.build();
  console.log('[抖音自动获客助手] 已加载');
  bootResume();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
