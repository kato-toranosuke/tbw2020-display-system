// 外部コンテンツの元が HTML の <img> または SVG の <svg> 要素であった場合、キャンバスの内容を取得しようとすることは許可されていません。(https://developer.mozilla.org/ja/docs/Web/HTML/CORS_enabled_image)
// こっちの方が問題の本質に近そう。要はChromeの設定によってローカル環境の同一フォルダに含まれるファイルは同一Originだとは認識されないらしい。Google様が色々気を使っているらしいが、逆に迷惑。
// https://www.petitmonte.com/javascript/chrome_securityerror.html
// https://yujisoftware.hatenablog.com/entry/20100815/1281885412
// https://www.karakaram.com/mac-google-chrome-option/
'use strict';
import { GeneralFuncs } from './generalFuncs.js';

export class Map extends GeneralFuncs {
  constructor(map_node_id, map_wrapper_node_id = 'map_wrapper', coordinate = { north_lat: 0, sounth_lat: 500, east_lng: 500, west_lng: 0 }, map_img_name = 'map_area_detecting_test.png') {
    super();
    this.map_node_id = map_node_id;
    this.map_wrapper_node_id = map_wrapper_node_id;
    this.map_wrapper_node = document.getElementById(this.map_wrapper_node_id);
    this.coordinate = coordinate; // 地図画像の緯度・経度の範囲
    this.map_img_name = map_img_name;

    // width, height取得
    // 画像の読み込み
    this.map_img = new Image();
    // このJSファイルから読み出されるわけでなく、HTMLファイルからの読み出しになる。（画像要素をDOMに付加するため。）よって相対パスで指定する場合は要注意。
    this.map_img.src = `./img/${this.map_img_name}`;
    this.map_img.onload = this.getWidthAndHeight();

    this.init();
  }

  getWidthAndHeight() {
    // naturalWidth / naturalHeight -> 表示されているサイズではなく、画像の本来のサイズを取得したい場合
    const map_img_natural_width = this.map_img.naturalWidth;
    const map_img_natural_height = this.map_img.naturalHeight;
    const map_img_aspect = map_img_natural_height / map_img_natural_width;

    const map_wrapper_width = this.map_wrapper_node.clientWidth;
    const map_wrapper_height = this.map_wrapper_node.clientHeight;

    const tmp_map_img_height = map_wrapper_width * map_img_aspect; // マップ画像の横幅をwrapperの横幅いっぱいにした際の縦幅
    const tmp_map_img_width = map_wrapper_height * (1 / map_img_aspect); // その逆

    if (tmp_map_img_width > map_wrapper_width) {
      this.width = map_wrapper_width;
      this.height = tmp_map_img_height;
    } else if (tmp_map_img_height > map_wrapper_height) {
      this.width = tmp_map_img_width;
      this.height = map_wrapper_height;
    } else {
      if (map_wrapper_width * tmp_map_img_height > tmp_map_img_width * map_wrapper_height) {
        this.width = map_wrapper_width;
        this.height = tmp_map_img_height;
      } else {
        this.width = tmp_map_img_width;
        this.height = map_wrapper_height;
      }
    }
  }

  init() {
    // ------- 定数 --------
    this.warning_val_range = [{ r: { min: 0, max: 0 }, g: { min: 255, max: 255 }, b: { min: 0, max: 0 }, a: { min: 1, max: 1 } }];
    this.danger_val_range = [{ r: { min: 255, max: 255 }, g: { min: 0, max: 0 }, b: { min: 0, max: 0 }, a: { min: 1, max: 1 } }];

    // ------- map_layer -------
    // canvas要素を取得・設定。
    const canvas = document.querySelector(`#${this.map_node_id} > .map_layer`);
    canvas.width = this.width;
    canvas.height = this.height;
    // 2Dコンテキストの取得
    this.context = canvas.getContext("2d");

    // 画像の読み込み時に発動
    // this.map_img.onload = function () {....} とした場合、無名関数内のthisはimg要素自体を表す。
    // 一方、有名関数としてそれを呼び出した場合、thisはMapオブジェクト自体を表す。つまり、bindはなくてもよかった。
    this.map_img.onload = this.drawMap();

    // ------- points_layer -------
    // svg要素を取得・設定
    const svg = document.querySelector(`#${this.map_node_id} > .points_layer`);
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);
    svg.setAttribute('viewBox', `${this.coordinate.west_lng} ${-this.coordinate.north_lat} ${Math.abs(this.coordinate.east_lng - this.coordinate.west_lng)} ${Math.abs(this.coordinate.north_lat - this.coordinate.sounth_lat)}`);
    // 現在値表現のNodeを取得
    this.present_effect = document.querySelector(`#${this.map_node_id} > .points_layer > .present_effect`);
    // 地点表示領域の取得
    this.points = document.querySelector(`#${this.map_node_id} > .points_layer > .points`);
    // 最大表示point数を設定
    this.max_points_num = 100;

    // ----- 表示位置 ------
    const top = this.map_wrapper_node.clientHeight - this.height;
    const left = this.map_wrapper_node.clientWidth - this.width;
    canvas.setAttribute('style', `top: ${top}px; left: ${left}px;`);
    svg.setAttribute('style', `top: ${top}px; left: ${left}px;`);
  }

  // マップの描画
  drawMap() {
    const map_img_width = this.map_img.width;
    const map_img_height = this.map_img.height;
    // drawImageの解説：http://www.htmq.com/canvas/drawImage_s.shtml
    this.context.drawImage(this.map_img, 0, 0, map_img_width, map_img_height, 0, 0, this.width, this.height);
  }

  // 円の描画
  drawPoint(x, y, r) {
    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttributeNS(null, "cx", x);
    point.setAttributeNS(null, "cy", y);
    // point.setAttributeNS(null, "cy", -y); 本当はこれ
    point.setAttributeNS(null, "r", r);

    // 追加
    this.points.appendChild(point);

    // 現在地点を示す効果を描画
    this.drawCurrentEffect(x, y, 2 * r);
  }

  // 現在地点表現を描画
  drawCurrentEffect(x, y, r) {
    this.present_effect.setAttribute("cx", x);
    this.present_effect.setAttribute("cy", y);
    this.present_effect.setAttribute("r", r);
  }

  updateValue(x, y) {
    // 最大表示数を超えたら削除
    if (this.points.children.length >= this.max_points_num)
      this.points.removeChild(this.points.firstChild);

    // 指定座標から幅１、高さ１のImageDataObjectを取得
    // 画像だけでなくcanvas上にある全ての要素も含めピクセル値を調べる
    const imgdata = this.context.getImageData(x, y, 1, 1);
    // RGBA値を格納
    const pixel_data = { r: imgdata.data[0], g: imgdata.data[1], b: imgdata.data[2], a: imgdata.data[3] };
    console.log(pixel_data);
    this.checkAlert(pixel_data, this.present_effect, this.map_wrapper_node_id, this.danger_val_range, 'map');

    this.drawPoint(x, y, 5);
  }
}