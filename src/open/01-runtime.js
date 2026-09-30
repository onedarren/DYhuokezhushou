/*
 * 抖音自动获客助手 —— 开源模块：运行时基础层
 * 本文件属于项目的开源部分，基于 MIT 协议发布。
 * 提供存储封装、页面 Window 引用、通知、通用工具函数与跨域请求封装。
 */

'use strict';

const hasGM = typeof GM_setValue === 'function' && typeof GM_getValue === 'function';

const store = {
  get(key, defaultValue = null) {
    try {
      if (hasGM) {
        const v = GM_getValue(key);
        return v === undefined || v === null ? defaultValue : JSON.parse(v);
      }
      const v = localStorage.getItem('dycap_' + key);
      return v === null ? defaultValue : JSON.parse(v);
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    const raw = JSON.stringify(value);
    if (hasGM) GM_setValue(key, raw);
    else localStorage.setItem('dycap_' + key, raw);
  },
  remove(key) {
    if (hasGM) GM_deleteValue(key);
    else localStorage.removeItem('dycap_' + key);
  },
};

const PAGE = typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window;

const notify = (title, message) => {
  try {
    if (typeof GM_notification === 'function') GM_notification({ title, text: message, timeout: 5000 });
  } catch {}
};

const randDelay = (min, max) => new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pickRandom = (arr) => (!arr || arr.length === 0 ? '[微笑]' : arr[Math.floor(Math.random() * arr.length)]);
const parseLines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

function waitFor(selector, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryOnce = () => {
      let el = null;
      if (typeof selector === 'object') {
        el = document.querySelector(selector.primary);
        if (!el && selector.backup) {
          for (const b of selector.backup) {
            el = document.querySelector(b);
            if (el) break;
          }
        }
      } else {
        el = document.querySelector(selector);
      }
      if (el) return resolve(el);
      if (Date.now() - start >= timeout) {
        return reject(new Error('等待元素超时: ' + (typeof selector === 'object' ? selector.primary : selector)));
      }
      setTimeout(tryOnce, 200);
    };
    tryOnce();
  });
}

function gmRequest(url, { headers = {}, data = null, timeout = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: data ? 'POST' : 'GET',
      url,
      headers,
      data: data ? JSON.stringify(data) : undefined,
      timeout,
      onload: (res) =>
        resolve({
          ok: res.status >= 200 && res.status < 300,
          status: res.status,
          statusText: res.statusText,
          text: () => res.responseText,
          json: () => JSON.parse(res.responseText),
        }),
      onerror: () => reject(new Error('AI API网络错误')),
      ontimeout: () => reject(new Error('AI API请求超时')),
    });
  });
}
