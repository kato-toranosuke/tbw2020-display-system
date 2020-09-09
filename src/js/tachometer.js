'use strict';
import {GeneralFuncs} from './generalFuncs.js'

export class TachoMeter extends GeneralFuncs{
  constructor(tachometer_node_id, tachometer_wrapper_node_id,maxVal = 60, minVal = 0) {
    super();
    this.tachometer_node_id = tachometer_node_id;
    this.tachometer_wrapper_node_id = tachometer_wrapper_node_id;
    this.maxVal = maxVal;
    this.minVal = minVal;
    this.init();
  }

  init() {
    // width, heightを設定
    const tachometer_wrapper_node = document.getElementById(this.tachometer_wrapper_node_id);
    const tachometer_size = Math.min(tachometer_wrapper_node.clientWidth, tachometer_wrapper_node.clientHeight);
    this.width = tachometer_size;
    this.height = tachometer_size;

    this.initAng = Math.PI / 6; // 最小値・最大値の時の角度
    this.r = 95;
    const base_r = 100;

    // 要素の取得
    const tachometer = window.document.getElementById(this.tachometer_node_id);
    const base_arc = window.document.querySelector(`#${this.tachometer_node_id} > .base_arc`);
    this.arc = window.document.querySelector(`#${this.tachometer_node_id} > .arc`);
    this.arc_animation = window.document.querySelector(`#${this.tachometer_node_id} > .arc > animate`);
    this.present_val = window.document.querySelector(`#${this.tachometer_node_id} > .present_val`);

    const start_point_y = base_r * Math.cos(this.initAng);
    // viewBoxの設定
    tachometer.setAttribute('viewBox', `-100 -100 200 ${base_r + start_point_y}`);
    // 大きさの設定
    tachometer.setAttribute('width', this.width);
    tachometer.setAttribute('height', `${this.height * ((base_r + start_point_y) / (base_r * 2))}`);

    // 土台となる扇型の設定
    // d="M{中心座標} L{円弧始め座標} A{半径} {回転角（傾き）} {if 180度以下 0 else 1} {if 反時計回り 0 else 1} {円弧終り座標}z"
    const base_settings = `M0,0 L${-base_r * Math.sin(this.initAng)},${base_r * Math.cos(this.initAng)} A${base_r},${base_r} 0 1,1 ${base_r * Math.sin(this.initAng)},${base_r * Math.cos(this.initAng)}z`;
    base_arc.setAttribute('d', base_settings);

    // 目盛り線の設定
    const interval_angle = (2 * Math.PI - 2 * this.initAng) / 6;
    // childNodes の代わりに、childrenを使うと、TextNode は含まない、要素ノードだけのcollectionが返されます。
    const scale_lines = window.document.querySelector(`#${this.tachometer_node_id} > .scale > .scale_lines`).children;
    for (let i = 0; i < scale_lines.length; i++) {
      const angle = this.initAng + interval_angle * (i + 1);
      const x1 = base_r * Math.sin(angle);
      const y1 = base_r * Math.cos(angle);
      const x2 = this.r * Math.sin(angle);
      const y2 = this.r * Math.cos(angle);
      scale_lines[i].setAttribute('x1', x1);
      scale_lines[i].setAttribute('y1', y1);
      scale_lines[i].setAttribute('x2', x2);
      scale_lines[i].setAttribute('y2', y2);
    }

    // 値による角度を計算する
    this.calcAngle = (tmp, max, min) => ((tmp - min) / (max - min)) * (2 * Math.PI - 2 * this.initAng) + this.initAng;
  }

  updateValue(val) {
    val = this.normalizeValue(val, this.maxVal, this.minVal);
    const presentAng = this.calcAngle(val, this.maxVal, this.minVal);

    // 数値の表示
    this.present_val.textContent = val.toFixed(1);
    // メーターの扇型の設定
    // d="M{中心座標} L{円弧始め座標} A{半径} {回転角（傾き）} {if 180度以下 0 else 1} {if 反時計回り 0 else 1} {円弧終り座標}z"
    const settings = `M0,0 L${-this.r * Math.sin(this.initAng)},${this.r * Math.cos(this.initAng)} A${this.r},${this.r} 0 ${(presentAng <= (Math.PI + this.initAng)) ? 0 : 1} 1 ${-this.r * Math.sin(presentAng)},${this.r * Math.cos(presentAng)}z`;
    // アニメーションの設定
    // const last_settings = this.arc_animation.getAttribute('to');
    // this.arc_animation.setAttribute('from', last_settings);
    // this.arc_animation.setAttribute('to', settings);

    this.arc.setAttribute('d', settings);
  }
}