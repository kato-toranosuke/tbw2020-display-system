'use strict';
import { BarMeter } from './barmeter.js';
import { TachoMeter } from './tachometer.js';
import { Map } from './map.js';
import { Posture } from './posture.js';
import { GeneralFuncs} from './generalFuncs.js';

let map, alt_barmeter, aspd_tachometer, gspd_tachometer, rpm_tachometer, posture;

// 画面読み込み完了時に発動
window.onload = async function () {  
  alt_barmeter = new BarMeter('alt_barmeter', 'alt_barmeter_wrapper');
  map = new Map('map', 'map_wrapper');
  aspd_tachometer = new TachoMeter('aspd_tachometer', 'aspd_tachometer_wrapper');
  gspd_tachometer = new TachoMeter('gspd_tachometer', 'gspd_tachometer_wrapper');
  rpm_tachometer = new TachoMeter('rpm_tachometer', 'rpm_tachometer_wrapper');
  posture = new Posture('posture_wrapper');
  
  setInterval(function () {
    const dataset = createValues();
    updateValues(dataset);
   }, 1500);
};

// update
function updateValues(dataset) {
  alt_barmeter.updateValue(dataset.alt);
  map.updateValue(dataset.lng, dataset.lat);
  posture.updateValue(dataset.roll, dataset.pitch, dataset.yaw);
  aspd_tachometer.updateValue(dataset.aspd);
  gspd_tachometer.updateValue(dataset.gspd);
  rpm_tachometer.updateValue(dataset.rpm);
}

// updateSize
function updateNodeSize() {
  alt_barmeter.init();
  map.init();
  // 既に設定されている子要素の削除
  const posture_node = document.getElementById('posture_wrapper');
  const clone = posture_node.cloneNode(false);
  posture_node.parentNode.replaceChild(clone, posture_node);
  posture.init();
  aspd_tachometer.init();
  gspd_tachometer.init();
  rpm_tachometer.init();
}

// アラート音設定
const alert_switch = document.getElementById('alert_switch');
alert_switch.addEventListener('click', audioPlay);
function audioPlay() {
  if (!GeneralFuncs.is_ok_playing_alert) {
    document.getElementById('warning_sound').play();
    document.getElementById('danger_sound').play();
    GeneralFuncs.is_ok_playing_alert = true;
    alert_switch.innerText = 'Alert OFF';
  } else {
    GeneralFuncs.is_ok_playing_alert = false;
    alert_switch.innerText = 'Alert ON';
  }
}

// 全画面表示
const goFS_node = document.getElementById("goFS");
function toggleFullScreen() {
  let doc = window.document;
  let docEl = doc.documentElement; // documentのルート要素（HTML文書の場合は<html>）を取得

  // ベンダープレフィックスを付けているが、将来的に要らなくなる可能性あり。
  // あとchromeのHTMLレンダリングエンジンはBlinkになってきているが、ベンダプレフィックスはwebkitのままで良さそう。（BlinkがWebkitの派生だから？）
  let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  let exitFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    // document.documentElement: root要素を取得。この場合はhtml要素。
    // document.documentElement.style.setProperty('--window-width', window.parent.screen.width);
    // document.documentElement.style.setProperty('--window-height', window.parent.screen.height);
    requestFullScreen.call(docEl);
    goFS_node.innerText = "Exit";
    updateNodeSize();
  } else {
    exitFullScreen.call(doc);
    goFS_node.innerText = "Fullscreen";
    updateNodeSize();
  }
}
goFS_node.addEventListener('click', toggleFullScreen, false);

function createValues() {
  let dataset = {};
  dataset.alt = Math.random() * (alt_barmeter.maxVal - alt_barmeter.minVal) + alt_barmeter.minVal;
  dataset.lat = Math.random() * (map.coordinate.sounth_lat - map.coordinate.north_lat);
  dataset.lng = Math.random() * (map.coordinate.east_lng - map.coordinate.west_lng);
  dataset.roll = Math.random() * Math.PI * 2;
  dataset.pitch = Math.random() * Math.PI * 2;
  dataset.yaw = Math.random() * Math.PI * 2;
  dataset.aspd = Math.random() * (aspd_tachometer.maxVal - aspd_tachometer.minVal) + aspd_tachometer.minVal;
  dataset.gspd = Math.random() * (gspd_tachometer.maxVal - gspd_tachometer.minVal) + gspd_tachometer.minVal;
  dataset.rpm = Math.random() * (rpm_tachometer.maxVal - rpm_tachometer.minVal) + rpm_tachometer.minVal;
  dataset.time = new Date();
  return dataset;
}