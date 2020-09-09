'use strict';
import { GeneralFuncs } from './generalFuncs.js'

// barmeter_node_id:"barmeter"
export class BarMeter extends GeneralFuncs{
  constructor(barmeter_node_id, barmeter_wrapper_node_id) {
    // 継承したクラスのコンストラクタは super(...) を呼び出し、(!) this を使う前にそれを行わなければなりません。
    /* 
      JavaScriptでは、“継承しているクラスのコンストラクタ関数” とその他すべてで区別があります。継承しているクラスでは、該当するコンストラクタ関数は特別な内部プロパティ [[ConstructorKind]]:"derived" が付けられます。
      違いは:
      ・通常のコンストラクタを実行するとき、this として空のオブジェクトを作り、それを続けます。
      ・しかし、派生したコンストラクタが実行されると、そうは実行されません。親のコンストラクタがこのジョブを実行することを期待しています。
      なので、もし独自のコンスタクタを作っている場合には、super を呼ばないといけません。なぜなら、そうしないとそれを参照する this を持つオブジェクトは生成されないからです。 結果、エラーになるでしょう。
      https://ja.javascript.info/class-inheritance
    */
    super();
    // 最も外側のsvgに指定されているidを格納
    this.barmeter_node_id = barmeter_node_id;
    this.barmeter_wrapper_node_id = barmeter_wrapper_node_id;
    this.init();
  }

  init() {
    // width, heightを取得
    const barmeter_wrapper_node = document.getElementById(this.barmeter_wrapper_node_id);
    this.width = barmeter_wrapper_node.clientWidth;
    this.height = barmeter_wrapper_node.clientHeight;

    // 定数の定義
    this.maxVal = 12; // バーが表示できる最大値
    this.minVal = 0; // それの最小値
    this.minBarWidth = 30; // 最小Bar横幅(px)
    this.warning_val_ranges = [{ min: 1.0, max: 1.5 }, { min: 9.5, max: 10.0 }];
    this.danger_val_ranges = [{ min: this.minVal, max: 1.0 }, { min: 10.0, max: this.maxVal }];
    
    // SVG全体の定義
    const barmeter = window.document.getElementById(this.barmeter_node_id);
    const viewBox_height = Math.abs(this.maxVal - this.minVal) * 100; // ->11 これを100倍して、1100。
    const viewBox_width = viewBox_height / this.height * this.width;
    
    // svgの属性の設定
    // https://lucklog.info/svg-verification-viewbox-width-height2/
    // https://qiita.com/takeshisakuma/items/a6a06902e955acad5c99#preserveaspectratio%E3%81%AE%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AEmeet%E3%81%A8slice%E3%81%AE%E6%AF%94%E8%BC%83
    barmeter.setAttribute('width', this.width);
    barmeter.setAttribute('height', this.height);
    // barmeter.setAttribute('style', `height: ${this.height}px;`);
    barmeter.setAttribute('viewBox', `0 ${-viewBox_height} ${viewBox_width} ${viewBox_height}`);
    
    // Bar部分の定義
    this.bar_width = Math.max(this.width / 3, this.minBarWidth) * (viewBox_width / this.width); // Barの横幅
    this.r = this.bar_width / 2; // Bar半円部分の半径
    this.bar = window.document.querySelector(`#${this.barmeter_node_id} > .bar`); // Bar部分を取得
    // 背景とバーになるrect要素の大きさの定義
    const rects = barmeter.getElementsByTagName('rect');
    rects[0].setAttribute('y', -viewBox_height); // rect[0]: 背景rect
    rects[0].setAttribute('height', viewBox_height);
    for (const rect of rects) {
      rect.setAttribute('width', this.bar_width);
    }

    // barの形を生成するための型
    // 小文字：直前座標からの相対座標。大文字：絶対座標
    const base_barmeter = window.document.querySelector(`#${this.barmeter_node_id} > .base_barmeter`);
    const draw_settings = `
            M 0 ${-viewBox_height} h ${viewBox_width} v ${viewBox_height} h ${-viewBox_width} Z
            m 0 ${this.r}
            a ${this.r} ${this.r} 0 0 1 ${2 * this.r} 0
            l 0 ${viewBox_height - 2 * this.r}
            a ${this.r} ${this.r} 0 0 1 ${-2 * this.r} 0
            z 
        `;
    base_barmeter.setAttribute('d', draw_settings);

    // 目盛り線の長さの定義
    for (const scale_line of window.document.querySelector(`#${this.barmeter_node_id} > .scale > .scale_lines`).children) {
      scale_line.setAttribute('x2', this.bar_width);
    }
    // 目盛り文字の定義
    for (const scale_text of window.document.querySelector(`#${this.barmeter_node_id} > .scale > .scale_texts`).children) {
      scale_text.setAttribute('x', this.bar_width + 5);
    }

    // 現在値を表示する領域
    const present_val_left = (this.bar_width + 5) * (this.width / viewBox_width); // px
    const present_val_top = 0;
    this.present_val = window.document.querySelector(`#${this.barmeter_wrapper_node_id} > .present_val`);
    // 現在値を表示する領域の位置を指定
    this.present_val.setAttribute('style', `top: ${present_val_top}px; left: ${present_val_left}px;`);
    // 現在値の数値のフォントサイズを指定
    const val_font_size = (viewBox_height - 1000) * (this.width / viewBox_width);
    this.present_val.children[0].setAttribute('style', `font-size: ${val_font_size}px;`);
    this.present_val.children[1].setAttribute('style', `font-size: ${val_font_size * 0.6}px;`);

    // バーの高さを計算
    this.tmpY = (tmp, max, min) => -((tmp - min) / (max - min)) * viewBox_height;
  }

  updateValue(val) {
    val = this.normalizeValue(val, this.maxVal, this.minVal); // 値の正規化
    this.checkAlert(val, this.bar, this.warning_val_ranges, this.danger_val_ranges, 'altitude');

    this.present_val.children[0].textContent = val.toFixed(2); // 数値部の表示
    // Barの表示
    this.bar.setAttribute('y', this.tmpY(val, this.maxVal, this.minVal));
    this.bar.setAttribute('height', -this.tmpY(val, this.maxVal, this.minVal));
  }
}