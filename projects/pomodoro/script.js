'use strict';

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c⏳ Stay focused, you\'re doing great!', 'color: #4ade80; font-size: 1.2rem; font-weight: bold;');

  // Constants

  const RADIUS = 95;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const BREAK_MESSAGES = [
    'Take a breath, you earned it.',
    'Step away. Stretch. Hydrate.',
    'Seriously, close the tab for 5 minutes.',
    'Rest is part of the work.',
  ];

  const THEME_ICONS = { forest: '🌿', night: '🌙', sunset: '🌅' };

  // DOM refs

  const timeDisplay   = document.getElementById('time-display');
  const ringProgress  = document.getElementById('ring-progress');
  const modeLabel     = document.getElementById('mode-label');
  const breakMessage  = document.getElementById('break-message');
  const btnStart      = document.getElementById('btn-start');
  const btnPause      = document.getElementById('btn-pause');
  const btnReset      = document.getElementById('btn-reset');
  const focusLogEl    = document.getElementById('focus-log');
  const btnClearLog   = document.getElementById('btn-clear-log');
  const themeIcon     = document.getElementById('theme-icon');
  const themeBtns     = document.querySelectorAll('.theme-switcher button');

  // Timer class

  class Timer {
    FOCUS_DURATION = 25 * 60;
    BREAK_DURATION = 5 * 60;

    constructor() {
      this.mode      = 'focus';
      this.timeLeft  = this.FOCUS_DURATION;
      this.isRunning = false;
      this._interval = null;

      ringProgress.style.strokeDasharray  = CIRCUMFERENCE;
      ringProgress.style.strokeDashoffset = 0;
    }

    get _totalDuration() {
      return this.mode === 'focus' ? this.FOCUS_DURATION : this.BREAK_DURATION;
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this._interval = setInterval(() => this._tick(), 1000);
      this._updateControls();
    }

    pause() {
      if (!this.isRunning) return;
      this.isRunning = false;
      clearInterval(this._interval);
      this._interval = null;
      this._updateControls();
    }

    reset() {
      this.pause();
      this.mode     = 'focus';
      this.timeLeft = this.FOCUS_DURATION;
      breakMessage.hidden = true;
      this._render();
      this._updateControls();
    }

    _tick() {
      this.timeLeft--;
      this._render();
      if (this.timeLeft <= 0) this._onComplete();
    }

    _render() {
      const mm  = String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
      const ss  = String(this.timeLeft % 60).padStart(2, '0');
      const str = `${mm}:${ss}`;

      timeDisplay.textContent  = str;
      document.title           = `${str} · Pomodoro Flow`;
      modeLabel.textContent    = this.mode === 'focus' ? 'Focus' : 'Break';

      const progress = this.timeLeft / this._totalDuration;
      ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    }

    _onComplete() {
      this.pause();

      if (this.mode === 'focus') {
        _addLogEntry();
        _playBeep();
        this.mode     = 'break';
        this.timeLeft = this.BREAK_DURATION;
        breakMessage.textContent = BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];
        breakMessage.hidden = false;
        this._render();
        this.start();
      } else {
        // break finished. stay in focus mode and let the user start the next one
        this.mode     = 'focus';
        this.timeLeft = this.FOCUS_DURATION;
        breakMessage.hidden = true;
        _flashTitle('✅ Break over!');
        this._render();
      }

      this._updateControls();
    }

    _updateControls() {
      btnStart.disabled = this.isRunning;
      btnPause.disabled = !this.isRunning;
    }
  }

  // Audio beep

  function _playBeep() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type      = 'sine';
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (_) {
      _flashTitle('⏰ Time\'s up!');
    }
  }

  function _flashTitle(msg) {
    const original = document.title;
    let count = 0;
    const id = setInterval(() => {
      document.title = count % 2 === 0 ? msg : original;
      if (++count >= 6) { clearInterval(id); document.title = original; }
    }, 600);
  }

  // Focus log

  function _loadLog() {
    try { return JSON.parse(localStorage.getItem('pomodoroLog') || '[]'); }
    catch (_) { return []; }
  }

  function _saveLog(log) {
    localStorage.setItem('pomodoroLog', JSON.stringify(log));
  }

  function _addLogEntry() {
    const log = _loadLog();
    const now = new Date();
    log.push({
      label: `Focus session #${log.length + 1}`,
      ts: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    _saveLog(log);
    _renderLog();
  }

  function _renderLog() {
    const log = _loadLog();
    focusLogEl.innerHTML = '';
    log.slice().reverse().forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${entry.label}</span><span class="log-ts">${entry.ts}</span>`;
      focusLogEl.appendChild(li);
    });
  }

  // Theme switching

  function _applyTheme(theme) {
    document.body.dataset.theme = theme;
    themeIcon.textContent = THEME_ICONS[theme] || '🌿';
    themeBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme));
    });
    localStorage.setItem('pomodoroTheme', theme);
  }

  function _initTheme() {
    const saved = localStorage.getItem('pomodoroTheme') || 'forest';
    _applyTheme(saved);
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => _applyTheme(btn.dataset.theme));
  });

  // Bootstrap

  _initTheme();
  _renderLog();

  const timer = new Timer();
  timer._render();
  timer._updateControls();

  btnStart.addEventListener('click', () => timer.start());
  btnPause.addEventListener('click', () => timer.pause());
  btnReset.addEventListener('click', () => timer.reset());
  btnClearLog.addEventListener('click', () => {
    _saveLog([]);
    _renderLog();
  });
});
