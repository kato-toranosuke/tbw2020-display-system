'use strict';

export class GeneralFuncs {
  constructor() {
    this.normal_color = 'skyblue';
    this.warning_color = 'orange';
    this.danger_color = 'tomato';

    this.warning_sound = document.getElementById('warning_sound');
    this.danger_sound = document.getElementById('danger_sound');
  }

  normalizeValue(val, maxVal, minVal) {
    if (val > maxVal)
      return maxVal;
    else if (val < minVal)
      return minVal;
    else
      return val;
  }

  playAlert(alert_node) {
    if (alert_node.paused)
      alert_node.play();
  }

  pauseAlert(alert_node) {
    if (!alert_node.paused)
      alert_node.pause();
  }

  checkAlert(val, target_node, warning_val_ranges, danger_val_ranges, mode) {
    switch (mode) {
      case 'altitude':
        // 警告範囲のチェック
        for (const warning_val_range of warning_val_ranges) {
          if (val >= warning_val_range.min && val <= warning_val_range.max) {
            this.pauseAlert(this.danger_sound);
            this.playAlert(this.warning_sound);
            target_node.setAttribute('fill', this.warning_color);
            return;
          }
        }

        // 危険範囲のチェック
        for (const danger_val_range of danger_val_ranges) {
          if (val >= danger_val_range.min && val <= danger_val_range.max) {
            this.pauseAlert(this.warning_sound);
            this.playAlert(this.danger_sound);
            target_node.setAttribute('fill', this.danger_color);
            return;
          }
        }

        // 通常時
        this.pauseAlert(this.warning_sound);
        this.pauseAlert(this.danger_sound);
        target_node.setAttribute('fill', this.normal_color);
        break;

      case 'map':
        // warning_val_ranges = [{r:{min: 0, max: 10}, b:{min: 0, max: 10}}]
        // 警告範囲のチェック
        for (const warning_val_range of warning_val_ranges) {
          let flag = 1;
          // r,g,b,aを取得する
          for (const key of Object.keys(warning_val_range)) {
            // 一つでも範囲から外れるものがあれば、警告対象から外す
            if (!(val[key] >= warning_val_range[key].min && val[key] <= warning_val_range[key].max)) {
              flag = 0;
              break;
            }
          }

          if (flag === 1) {
            this.pauseAlert(this.danger_sound);
            this.playAlert(this.warning_sound);
            // target_node.setAttribute('fill', this.warning_color);
            return;
          }
        }

        // 危険範囲のチェック
        for (const danger_val_range of danger_val_ranges) {
          let flag = 1;
          // r,g,b,aを取得する
          for (const key of Object.keys(danger_val_range)) {
            // 一つでも範囲から外れるものがあれば、警告対象から外す
            if (!(val[key] >= danger_val_range[key].min && val[key] <= danger_val_range[key].max)) {
              flag = 0;
              break;
            }
          }

          if (flag === 1) {
            this.pauseAlert(this.warning_sound);
            this.playAlert(this.danger_sound);
            // target_node.setAttribute('fill', this.warning_color);
            return;
          }
        }

        // 通常時
        this.pauseAlert(this.warning_sound);
        this.pauseAlert(this.danger_sound);
        // target_node.setAttribute('fill', this.normal_color);
        break;
      
      default:
        break;
    }
  }
}