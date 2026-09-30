/*
 * 抖音自动获客助手 —— 开源模块：浮动控制面板
 * 本文件属于项目的开源部分，基于 MIT 协议发布。
 * 提供页面内设置面板：表单、校验、拖动折叠、进度展示。
 */

const panel = (() => {
  let root, bodyEl, statusEl, progressEl;
  const els = {};
  const DEFAULT_PROMPT = '你是一个友善的抖音用户，请根据视频内容和用户评论给出恰当的回复，回复要简短有趣。';

  const CSS = `
    #dycap-root { position: fixed; top: 80px; right: 12px; width: 330px; max-height: 82vh;
      background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,.18);
      z-index: 2147483646; font-size: 12px; color: #333; font-family: system-ui, sans-serif; }
    #dycap-root * { box-sizing: border-box; }
    #dycap-header { display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; background: linear-gradient(90deg,#fe2c55,#ff5f7e); color: #fff;
      border-radius: 10px 10px 0 0; cursor: move; user-select: none; font-weight: 600; }
    #dycap-body { padding: 10px 12px; overflow-y: auto; max-height: calc(82vh - 42px); }
    #dycap-body.hidden { display: none; }
    .dycap-group { border: 1px solid #eee; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
    .dycap-group > .dycap-group-title { font-weight: 600; margin-bottom: 6px; color: #fe2c55; }
    .dycap-row { display: flex; gap: 6px; margin-bottom: 6px; }
    .dycap-row > * { flex: 1; }
    .dycap-field { margin-bottom: 6px; }
    .dycap-field label { display: block; margin-bottom: 2px; color: #666; }
    .dycap-check { display: flex; align-items: center; gap: 4px; margin-right: 8px; }
    .dycap-check input { width: auto; }
    #dycap-root input, #dycap-root select, #dycap-root textarea {
      width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px;
      font-size: 12px; font-family: inherit; }
    #dycap-root textarea { resize: vertical; min-height: 40px; }
    #dycap-status { padding: 6px 8px; border-radius: 4px; background: #f5f5f5; margin-bottom: 8px;
      min-height: 18px; word-break: break-all; }
    #dycap-status.success { background: #e8f5e9; color: #2e7d32; }
    #dycap-status.error { background: #ffebee; color: #c62828; }
    .dycap-btns { display: flex; gap: 6px; margin-bottom: 8px; }
    .dycap-btns button { flex: 1; padding: 6px 0; border: none; border-radius: 4px;
      color: #fff; cursor: pointer; font-size: 12px; }
    #dycap-start { background: #fe2c55; }
    #dycap-stop { background: #9e9e9e; }
    #dycap-save { background: #2196f3; }
    #dycap-progress { display: none; border: 1px solid #eee; border-radius: 6px; padding: 8px; }
    #dycap-progress .dycap-prow { display: flex; justify-content: space-between; margin-bottom: 3px; color: #555; }
    #dycap-bar-wrap { background: #eee; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 4px; }
    #dycap-bar { height: 100%; width: 0%; background: #2196f3; transition: width .3s; }
    #dycap-fab { position: fixed; right: 12px; top: 80px; width: 40px; height: 40px; border-radius: 50%;
      background: #fe2c55; color: #fff; border: none; cursor: pointer; z-index: 2147483646;
      font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,.25); display: none; }
  `;

  const HTML = `
    <div id="dycap-header"><span>🎵 抖音自动获客助手</span><span id="dycap-toggle">－</span></div>
    <div id="dycap-body">
      <div id="dycap-status"></div>
      <div class="dycap-btns">
        <button id="dycap-start">开始任务</button>
        <button id="dycap-stop">停止任务</button>
        <button id="dycap-save">保存配置</button>
      </div>
      <div class="dycap-group">
        <div class="dycap-group-title">任务模式</div>
        <div class="dycap-field"><label>运行模式</label>
          <select id="dycap-mode">
            <option value="keyword">关键词搜索模式</option>
            <option value="link">视频链接模式</option>
          </select></div>
        <div id="dycap-keyword-group">
          <div class="dycap-field"><label>搜索关键词（英文逗号分隔）</label>
            <textarea id="dycap-keywords" placeholder="关键词1,关键词2"></textarea></div>
          <div class="dycap-row">
            <div class="dycap-field"><label>排序依据</label>
              <select id="dycap-sortBy"><option value="">不筛选</option><option>综合排序</option><option>最新发布</option><option>最多点赞</option></select></div>
            <div class="dycap-field"><label>发布时间</label>
              <select id="dycap-publishTime"><option value="">不筛选</option><option>一天内</option><option>一周内</option><option>半年内</option></select></div>
          </div>
          <div class="dycap-row">
            <div class="dycap-field"><label>视频时长</label>
              <select id="dycap-duration"><option value="">不筛选</option><option>1分钟以下</option><option>1-5分钟</option><option>5分钟以上</option></select></div>
            <div class="dycap-field"><label>搜索范围</label>
              <select id="dycap-scope"><option value="">不筛选</option><option>关注的人</option><option>最近看过</option><option>还未看过</option></select></div>
          </div>
        </div>
        <div id="dycap-link-group" style="display:none">
          <div class="dycap-field"><label>视频链接（每行一个，支持 /video/ 或 /jingxuan?modal_id= 链接）</label>
            <textarea id="dycap-videoLinks" style="min-height:60px"></textarea></div>
        </div>
      </div>
      <div class="dycap-group">
        <div class="dycap-group-title">操作类型</div>
        <div class="dycap-row" style="margin-bottom:0">
          <label class="dycap-check"><input type="checkbox" id="dycap-likeAction" checked> 点赞</label>
          <label class="dycap-check"><input type="checkbox" id="dycap-favoriteAction"> 收藏</label>
          <label class="dycap-check"><input type="checkbox" id="dycap-commentAction" checked> 评论</label>
        </div>
      </div>
      <div class="dycap-group" id="dycap-comment-group">
        <div class="dycap-group-title">评论设置</div>
        <div class="dycap-row">
          <div class="dycap-field"><label>评论方式</label>
            <select id="dycap-commentMode"><option value="reply">回复评论</option><option value="direct">直接评论</option></select></div>
          <div class="dycap-field"><label>评论类型</label>
            <select id="dycap-commentType"><option value="emoji">仅表情回复</option><option value="text">文本回复</option><option value="ai">AI回复</option></select></div>
        </div>
        <div class="dycap-field" id="dycap-text-group"><label>评论文本（多行，随机选一条）</label>
          <textarea id="dycap-comments" placeholder="每行一条评论内容"></textarea></div>
        <div id="dycap-ai-group" style="display:none">
          <div class="dycap-row">
            <div class="dycap-field"><label>AI 模型</label>
              <select id="dycap-aiModel">
                <option value="deepseek">DeepSeek</option><option value="kimi">Kimi</option>
                <option value="openai">OpenAI (GPT)</option><option value="openrouter">OpenRouter</option>
                <option value="xiaomimimo">小米 MiMo</option><option value="ollama">Ollama</option>
                <option value="gemini">Gemini</option>
              </select></div>
            <div class="dycap-field"><label>API Key</label>
              <input type="password" id="dycap-apiKey" placeholder="请输入API Key"></div>
          </div>
          <div class="dycap-field" id="dycap-baseUrl-group" style="display:none"><label>自定义接口地址（Ollama）</label>
            <input type="text" id="dycap-aiBaseUrl" placeholder="例如：http://127.0.0.1:11434/v1/chat/completions"></div>
          <div class="dycap-field" id="dycap-customModel-group" style="display:none"><label>自定义模型名（Ollama）</label>
            <input type="text" id="dycap-aiCustomModel" placeholder="例如：qwen2.5:7b"></div>
          <div class="dycap-field"><label>AI 提示词</label>
            <textarea id="dycap-aiPrompt"></textarea></div>
          <div class="dycap-row" style="margin-bottom:0">
            <label class="dycap-check"><input type="checkbox" id="dycap-imageCommentEnabled"> 图片评论</label>
            <div class="dycap-field" style="margin:0"><label>使用第几张收藏图片</label>
              <input type="number" id="dycap-imageCommentIndex" value="1" min="1"></div>
          </div>
        </div>
        <div class="dycap-row">
          <div class="dycap-field"><label>每视频评论数</label><input type="number" id="dycap-commentsPerVideo" value="3" min="1"></div>
          <div class="dycap-field"><label>每关键词视频数</label><input type="number" id="dycap-videosPerKeyword" value="2" min="1"></div>
          <div class="dycap-field"><label>评论间隔(秒)</label><input type="number" id="dycap-commentInterval" value="3" min="0"></div>
        </div>
        <div class="dycap-row">
          <label class="dycap-check"><input type="checkbox" id="dycap-onlyFirstLevel" checked> 仅一级评论</label>
          <label class="dycap-check"><input type="checkbox" id="dycap-likeBeforeReply"> 回复前点赞</label>
        </div>
        <div class="dycap-row" style="margin-bottom:0">
          <div class="dycap-field"><label>包含关键词（回复含这些词的评论）</label>
            <input type="text" id="dycap-includeKeywords"></div>
          <div class="dycap-field"><label>排除关键词（跳过含这些词的评论）</label>
            <input type="text" id="dycap-excludeKeywords"></div>
        </div>
      </div>
      <div id="dycap-progress">
        <div class="dycap-prow"><span>状态</span><span id="dycap-pstatus">-</span></div>
        <div class="dycap-prow"><span>当前关键词</span><span id="dycap-pkeyword">-</span></div>
        <div class="dycap-prow"><span>关键词进度</span><span id="dycap-pkeywordProgress">-</span></div>
        <div class="dycap-prow"><span>视频进度</span><span id="dycap-pvideoProgress">-</span></div>
        <div class="dycap-prow"><span>评论进度</span><span id="dycap-pcommentProgress">-</span></div>
        <div id="dycap-bar-wrap"><div id="dycap-bar"></div></div>
      </div>
      <div style="color:#999;font-size:11px;margin-top:6px">
        界面与工具模块开源（MIT）· 核心引擎闭源 · 仅供学习交流，请遵守平台规则与法律法规
      </div>
    </div>
    <button id="dycap-fab" title="展开面板">🎵</button>
  `;

  const $id = (id) => root.querySelector('#' + id);

  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    root = document.createElement('div');
    root.id = 'dycap-root';
    root.innerHTML = HTML;
    document.body.appendChild(root);
    ['mode', 'keywords', 'sortBy', 'publishTime', 'duration', 'scope', 'videoLinks', 'likeAction',
      'favoriteAction', 'commentAction', 'commentMode', 'commentType', 'comments', 'aiModel', 'apiKey',
      'aiBaseUrl', 'aiCustomModel', 'aiPrompt', 'imageCommentEnabled', 'imageCommentIndex',
      'commentsPerVideo', 'videosPerKeyword', 'commentInterval', 'onlyFirstLevel', 'likeBeforeReply',
      'includeKeywords', 'excludeKeywords'].forEach((k) => (els[k] = $id('dycap-' + k)));
    statusEl = $id('dycap-status');
    progressEl = $id('dycap-progress');
    bindEvents();
    loadConfig();
    refreshMode();
    refreshCommentType();
    refreshAIModel();
    restoreProgress();
  }

  function toggleCollapse() {
    const body = $id('dycap-body');
    const fab = $id('dycap-fab');
    const hidden = body.classList.toggle('hidden');
    $id('dycap-toggle').textContent = hidden ? '＋' : '－';
    fab.style.display = hidden ? 'block' : 'none';
  }

  function setupDrag() {
    let drag = null;
    const header = $id('dycap-header');
    header.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      const rect = root.getBoundingClientRect();
      drag = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top, moved: false };
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      drag.moved = true;
      const left = Math.max(0, Math.min(drag.origLeft + dx, window.innerWidth - 80));
      const top = Math.max(0, Math.min(drag.origTop + dy, window.innerHeight - 40));
      root.style.left = left + 'px';
      root.style.top = top + 'px';
      root.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (moved) {
        const rect = root.getBoundingClientRect();
        store.set('panelPos', { left: rect.left, top: rect.top });
      } else {
        toggleCollapse();
      }
    });
    const saved = store.get('panelPos');
    if (saved && typeof saved.left === 'number') {
      root.style.left = Math.max(0, Math.min(saved.left, window.innerWidth - 80)) + 'px';
      root.style.top = Math.max(0, Math.min(saved.top, window.innerHeight - 40)) + 'px';
      root.style.right = 'auto';
    }
  }

  function bindEvents() {
    $id('dycap-fab').addEventListener('click', () => {
      $id('dycap-body').classList.remove('hidden');
      $id('dycap-fab').style.display = 'none';
      $id('dycap-toggle').textContent = '－';
    });
    setupDrag();
    els.mode.addEventListener('change', refreshMode);
    els.commentType.addEventListener('change', refreshCommentType);
    els.aiModel.addEventListener('change', refreshAIModel);
    els.imageCommentEnabled.addEventListener('change', () => {
      els.imageCommentIndex.parentElement.style.display = els.imageCommentEnabled.checked ? 'block' : 'none';
    });
    els.commentAction.addEventListener('change', () => {
      els.commentMode.closest('.dycap-row').style.display = els.commentAction.checked ? 'flex' : 'none';
    });
    $id('dycap-save').addEventListener('click', () => {
      const { settings: s, error } = collectSettings(false);
      if (error) return setStatus(error, 'error');
      store.set('settings', s);
      setStatus('配置已保存', 'success');
    });
    $id('dycap-start').addEventListener('click', () => {
      if (store.get('taskRunning', false)) return setStatus('任务已在运行中，请先停止', 'error');
      const { settings: s, error } = collectSettings(true);
      if (error) return setStatus(error, 'error');
      store.set('settings', s);
      const res = startTask(s);
      if (res.success) setStatus('任务已开始，正在打开页面...', 'success');
      else setStatus(res.message, 'error');
    });
    $id('dycap-stop').addEventListener('click', () => {
      stopTask();
    });
  }

  function collectSettings(forStart) {
    const normalizeCommas = (s) => s.replace(/，/g, ',').replace(/、/g, ',');
    const s = {
      commentMode: els.commentMode.value,
      mode: els.mode.value,
      keywords: normalizeCommas(els.keywords.value.trim()),
      searchSortBy: els.sortBy.value,
      searchPublishTime: els.publishTime.value,
      searchDuration: els.duration.value,
      searchScope: els.scope.value,
      videoLinks: els.videoLinks.value.trim(),
      comments: els.comments.value.trim(),
      commentsPerVideo: parseInt(els.commentsPerVideo.value) || 3,
      videosPerKeyword: parseInt(els.videosPerKeyword.value) || 2,
      commentInterval: parseInt(els.commentInterval.value) || 3,
      onlyFirstLevel: els.onlyFirstLevel.checked,
      likeBeforeReply: els.likeBeforeReply.checked,
      commentType: els.commentType.value,
      aiModel: els.aiModel.value,
      aiBaseUrl: els.aiBaseUrl.value.trim(),
      aiCustomModel: els.aiCustomModel.value.trim(),
      apiKey: els.apiKey.value,
      aiPrompt: els.aiPrompt.value,
      likeAction: els.likeAction.checked,
      favoriteAction: els.favoriteAction.checked,
      commentAction: els.commentAction.checked,
      imageCommentEnabled: els.imageCommentEnabled.checked,
      imageCommentIndex: parseInt(els.imageCommentIndex.value) || 1,
      commentIncludeKeywords: els.includeKeywords.value.trim(),
      commentExcludeKeywords: els.excludeKeywords.value.trim(),
    };
    if (forStart) {
      if (s.mode === 'keyword' && !s.keywords) return { error: '请输入搜索关键词' };
      if (s.mode === 'link') {
        if (!s.videoLinks) return { error: '请输入视频链接地址' };
        const valid = s.videoLinks.split('\n').filter((l) => l.trim()).filter(
          (l) => l.includes('douyin.com') && (l.includes('/video/') || l.includes('/jingxuan?')),
        );
        if (valid.length === 0) return { error: '请输入有效的抖音视频链接' };
      }
      if (!s.likeAction && !s.favoriteAction && !s.commentAction) {
        return { error: '请至少选择一种操作类型（点赞、收藏或评论）' };
      }
      if (s.commentAction) {
        if (s.commentType === 'text' && !s.comments) return { error: '请输入评论文本内容' };
        if (s.commentType === 'ai') {
          if (s.aiModel !== 'ollama' && !s.apiKey) return { error: '请输入API Key' };
          if (!s.aiPrompt) return { error: '请输入AI回复提示词' };
        }
        if (s.commentType === 'emoji' && !s.comments) s.comments = '[微笑]';
      }
    }
    return { settings: s };
  }

  function loadConfig() {
    const s = store.get('settings');
    if (!s) {
      els.aiPrompt.value = DEFAULT_PROMPT;
      setStatus('首次使用，请先配置参数', 'success');
      return;
    }
    els.commentMode.value = s.commentMode || 'reply';
    els.mode.value = s.mode || 'keyword';
    els.keywords.value = s.keywords || '';
    els.sortBy.value = s.searchSortBy || '';
    els.publishTime.value = s.searchPublishTime || '';
    els.duration.value = s.searchDuration || '';
    els.scope.value = s.searchScope || '';
    els.videoLinks.value = s.videoLinks || '';
    els.comments.value = s.comments || '';
    els.commentsPerVideo.value = s.commentsPerVideo || 3;
    els.videosPerKeyword.value = s.videosPerKeyword || 2;
    els.commentInterval.value = s.commentInterval || 3;
    els.onlyFirstLevel.checked = s.onlyFirstLevel !== false;
    els.likeBeforeReply.checked = s.likeBeforeReply || false;
    els.likeAction.checked = s.likeAction !== false;
    els.favoriteAction.checked = s.favoriteAction || false;
    els.commentAction.checked = s.commentAction !== false;
    els.commentType.value = s.commentType || 'emoji';
    els.aiModel.value = s.aiModel || 'deepseek';
    els.aiBaseUrl.value = s.aiBaseUrl || '';
    els.aiCustomModel.value = s.aiCustomModel || '';
    els.apiKey.value = s.apiKey || s.aiApiKey || '';
    els.aiPrompt.value = s.aiPrompt || DEFAULT_PROMPT;
    els.imageCommentEnabled.checked = s.imageCommentEnabled || false;
    els.imageCommentIndex.value = s.imageCommentIndex || 1;
    els.includeKeywords.value = s.commentIncludeKeywords || '';
    els.excludeKeywords.value = s.commentExcludeKeywords || '';
    els.imageCommentIndex.parentElement.style.display = els.imageCommentEnabled.checked ? 'block' : 'none';
  }

  function refreshMode() {
    const isKeyword = els.mode.value === 'keyword';
    $id('dycap-keyword-group').style.display = isKeyword ? 'block' : 'none';
    $id('dycap-link-group').style.display = isKeyword ? 'none' : 'block';
  }
  function refreshCommentType() {
    const t = els.commentType.value;
    els.comments.parentElement.style.display = t === 'text' ? 'block' : 'none';
    $id('dycap-ai-group').style.display = t === 'ai' ? 'block' : 'none';
  }
  function refreshAIModel() {
    const isOllama = els.aiModel.value === 'ollama';
    $id('dycap-baseUrl-group').style.display = isOllama ? 'block' : 'none';
    $id('dycap-customModel-group').style.display = isOllama ? 'block' : 'none';
    els.apiKey.parentElement.style.display = isOllama ? 'none' : 'block';
  }

  function setStatus(text, type = '') {
    statusEl.textContent = text;
    statusEl.className = type;
  }

  function onTaskStarted() {
    progressEl.style.display = 'block';
    $id('dycap-pstatus').textContent = '运行中';
    $id('dycap-pstatus').style.color = '#2196f3';
    $id('dycap-bar').style.background = '#2196f3';
    setStatus('任务正在运行中', 'success');
    updateProgress(store.get('taskProgress') || {});
  }

  function updateProgress(progress) {
    const s = store.get('settings');
    if (!s || !progressEl) return;
    progressEl.style.display = 'block';
    const mode = progress.mode || s.mode || 'keyword';
    $id('dycap-pstatus').textContent = '运行中';
    if (mode === 'keyword') {
      const keywords = s.keywords.split(',').map((x) => x.trim()).filter(Boolean);
      const kwTotal = keywords.length;
      const vpk = s.videosPerKeyword || 2;
      const cpv = s.commentsPerVideo || 3;
      const videoTotal = kwTotal * vpk;
      const commentTotal = kwTotal * vpk * cpv;
      const videoDone = (progress.keywordIndex || 0) * vpk + (progress.videoIndex || 0);
      const commentDone =
        (progress.keywordIndex || 0) * vpk * cpv + (progress.videoIndex || 0) * cpv + (progress.commentedCount || 0);
      $id('dycap-pkeyword').textContent = keywords[progress.keywordIndex || 0] || '-';
      $id('dycap-pkeywordProgress').textContent = (progress.keywordIndex || 0) + 1 + '/' + kwTotal;
      $id('dycap-pvideoProgress').textContent = videoDone + '/' + videoTotal;
      $id('dycap-pcommentProgress').textContent = commentDone + '/' + commentTotal;
      $id('dycap-bar').style.width = (commentTotal > 0 ? (commentDone / commentTotal) * 100 : 0) + '%';
    } else {
      const linkTotal = s.videoLinks.split('\n').filter((x) => x.trim()).length;
      const cpv = s.commentsPerVideo || 3;
      const commentTotal = linkTotal * cpv;
      const commentDone = (progress.videoIndex || 0) * cpv + (progress.commentedCount || 0);
      $id('dycap-pkeyword').textContent = '视频链接模式';
      $id('dycap-pkeywordProgress').textContent = '-';
      $id('dycap-pvideoProgress').textContent = (progress.videoIndex || 0) + 1 + '/' + linkTotal;
      $id('dycap-pcommentProgress').textContent = commentDone + '/' + commentTotal;
      $id('dycap-bar').style.width = (commentTotal > 0 ? (commentDone / commentTotal) * 100 : 0) + '%';
    }
  }

  function onComplete(data) {
    $id('dycap-pstatus').textContent = '已完成';
    $id('dycap-pstatus').style.color = '#4caf50';
    $id('dycap-bar').style.background = '#4caf50';
    $id('dycap-bar').style.width = '100%';
    setStatus('所有任务已完成！总评论数：' + data.totalComments, 'success');
  }

  function restoreProgress() {
    if (store.get('taskRunning', false)) {
      onTaskStarted();
    }
  }

  return { setStatus, updateProgress, onTaskStarted, onComplete, build };
})();
