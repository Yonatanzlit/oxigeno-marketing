/* Background music for the Bagó games, composed in code with Web Audio (no files, no licenses).
   BagoMusic(getCtx) → { start({style, bpm, layer}), stop(fade), setBpm, setLayer, duck, onBeat }
   style "calm" (Memotest) or "rush" (Góndola Rush). layer 0..3 adds instruments:
   0 kick + bass · 1 + hats (+ snare in rush) · 2 + arpeggio · 3 + melody.
   onBeat(cb) calls cb(beatNumber) on every beat, in time with the audio, so the page can pulse. */
(function () {
  "use strict";
  var PROG = [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]]; // C G Am F
  var MEL = {
    calm: [76, 0, 79, 0, 77, 76, 74, 0, 74, 0, 79, 0, 77, 74, 71, 0, 72, 0, 76, 0, 74, 72, 69, 0, 69, 0, 72, 0, 74, 0, 72, 0],
    rush: [79, 0, 79, 76, 0, 79, 81, 0, 79, 0, 79, 74, 0, 79, 83, 0, 81, 0, 81, 76, 0, 81, 84, 0, 81, 79, 77, 0, 77, 79, 81, 0]
  };
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  window.BagoMusic = function (getCtx) {
    var ac = null, master = null, noise = null, timer = 0, next = 0, step = 0, beatTimers = [];
    var bpm = 100, layer = 1, style = "calm", playing = false, beatCb = null;

    function voice(type, f, t, dur, vol, slideTo) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    }
    function hiss(t, dur, vol, type, freq) {
      if (!noise) {
        noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
        var d = noise.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; f.type = type; f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
    }
    // one step = one eighth note; 8 steps per bar, 4 bars per loop
    function play(t, s) {
      var rush = style === "rush", e = s % 8, ch = PROG[Math.floor(s / 8) % 4], onBeat = e % 2 === 0;
      if (onBeat) {
        voice("sine", 150, t, 0.16, rush ? 0.22 : 0.12, 45);
        if (beatCb) {
          var n = s / 2, wait = Math.max(0, (t - ac.currentTime) * 1000);
          beatTimers.push(setTimeout(function () { if (playing) beatCb(n); }, wait));
        }
      }
      if (e === 0 || e === 4 || (rush && (e === 3 || e === 7))) voice("triangle", hz(ch[0] - 12), t, rush ? 0.22 : 0.4, 0.13);
      if (layer >= 1) {
        if (!onBeat) hiss(t, 0.04, rush ? 0.05 : 0.03, "highpass", 7000);
        if (rush && (e === 2 || e === 6)) hiss(t, 0.12, 0.07, "bandpass", 1800);
      }
      if (layer >= 2) voice("square", hz(ch[1 + (s % 3)] + 12), t, 0.12, rush ? 0.02 : 0.014);
      if (layer >= 3) { var m = MEL[style][s % 32]; if (m) voice("triangle", hz(m), t, 0.22, 0.045); }
    }
    function tick() {
      if (!playing) return;
      var spb = 60 / bpm / 2;
      if (next < ac.currentTime) next = ac.currentTime + 0.05; // tab was asleep: skip, don't burst
      while (next < ac.currentTime + 0.12) { play(next, step); next += spb; step++; }
    }
    document.addEventListener("visibilitychange", function () {
      if (!playing || !ac) return;
      try { if (document.hidden) ac.suspend(); else ac.resume(); } catch (e) {}
    });
    return {
      start: function (o) {
        if (playing) return;
        ac = getCtx(); if (!ac) return;
        style = o.style || "calm"; bpm = o.bpm || 100; layer = o.layer == null ? 1 : o.layer;
        master = ac.createGain();
        master.gain.setValueAtTime(0.0001, ac.currentTime);
        master.gain.exponentialRampToValueAtTime(0.7, ac.currentTime + 0.25);
        master.connect(ac.destination);
        step = 0; next = ac.currentTime + 0.05; playing = true;
        tick(); timer = setInterval(tick, 25);
      },
      stop: function (fade) {
        beatTimers.forEach(clearTimeout); beatTimers = [];
        if (!playing) return;
        playing = false; clearInterval(timer);
        var m = master, t = ac.currentTime, f = fade || 0.25;
        try {
          m.gain.cancelScheduledValues(t);
          m.gain.setValueAtTime(Math.max(m.gain.value, 0.0001), t);
          m.gain.exponentialRampToValueAtTime(0.0001, t + f);
        } catch (e) {}
        setTimeout(function () { try { m.disconnect(); } catch (e) {} }, f * 1000 + 150);
      },
      setBpm: function (b) { bpm = b; },
      setLayer: function (l) { layer = Math.max(0, Math.min(3, l)); },
      duck: function () {
        if (!playing) return;
        var t = ac.currentTime;
        try {
          master.gain.cancelScheduledValues(t);
          master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
          master.gain.exponentialRampToValueAtTime(0.2, t + 0.05);
          master.gain.exponentialRampToValueAtTime(0.7, t + 0.6);
        } catch (e) {}
      },
      onBeat: function (cb) { beatCb = cb; },
      isPlaying: function () { return playing; }
    };
  };
})();
