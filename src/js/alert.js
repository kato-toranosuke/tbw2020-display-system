'use strict';
function togglePlaying(id, ctrl_id) {
  const alert = document.getElementById(id);
  const ctrl = document.getElementById(ctrl_id);

  // スマホへの対応。スマホ版Safariでは一度音声ファイルを再生しないと、currentTimeを認識しない。
  if (typeof (alert.currentTime) != 'undefined')
    alert.currentTime = 0; // 0秒時点に再生ヘッドを戻す

  if (!alert.paused) {
    alert.pause();
    ctrl.textContent = "Play";
  } else {
    alert.play();
    ctrl.textContent = "Pause";
  }
}