'use strict';

export class GeneralFuncs {
  static is_playing_alert = { altitude: false, map: false };
  static warning_sound = document.getElementById('warning_sound');
  static danger_sound = document.getElementById('danger_sound');
  static is_ok_playing_alert = false;

  constructor() {
    this.normal_color = 'skyblue';
    this.warning_color = 'orange';
    this.danger_color = 'tomato';
  }

  normalizeValue(val, maxVal, minVal) {
    if (val > maxVal)
      return maxVal;
    else if (val < minVal)
      return minVal;
    else
      return val;
  }

  playAlert(alert_type, target) {
    if (GeneralFuncs.is_ok_playing_alert) {
      switch (alert_type) {
        case 'warning':
          // 危険音がなっていたら、再生しない
          if (GeneralFuncs.warning_sound.paused && GeneralFuncs.danger_sound.paused) {
            GeneralFuncs.warning_sound.play();
            GeneralFuncs.is_playing_alert[target] = true;
          }
          break;
        case 'danger':
          if (GeneralFuncs.danger_sound.paused) {
            this.pauseAlert('warning');
            GeneralFuncs.danger_sound.play();
            GeneralFuncs.is_playing_alert[target] = true;
          }
          break;
        default:
          break;
      }
    }
  }

  pauseAlert(alert_type, target) {
    // 他のtergetのalertが再生されていれば、停止しない
    const keys = Object.keys(GeneralFuncs.is_playing_alert).filter(val => val != target);
    for (const key of keys) {
      if (GeneralFuncs.is_playing_alert[key] === true)
        return;
    }

    switch (alert_type) {
      case 'warning':
        if (!GeneralFuncs.warning_sound.paused) {
          GeneralFuncs.warning_sound.pause();
          GeneralFuncs.is_playing_alert[target] = false;
        }
        break;
      case 'danger':
        if (!GeneralFuncs.danger_sound.paused) {
          GeneralFuncs.danger_sound.pause();
          GeneralFuncs.is_playing_alert[target] = false;
        }
        break;
      default:
        break;
    }
  }

  checkAlert(val, target_node, warning_val_ranges, danger_val_ranges, mode) {
    switch (mode) {
      case 'altitude':
        // 警告範囲のチェック
        for (const warning_val_range of warning_val_ranges) {
          if (val >= warning_val_range.min && val <= warning_val_range.max) {
            this.pauseAlert('danger', 'altitude');
            this.playAlert('warning', 'altitude');
            target_node.setAttribute('fill', this.warning_color);
            return;
          }
        }

        // 危険範囲のチェック
        for (const danger_val_range of danger_val_ranges) {
          if (val >= danger_val_range.min && val <= danger_val_range.max) {
            this.pauseAlert('warning', 'altitude');
            this.playAlert('danger', 'altitude');
            target_node.setAttribute('fill', this.danger_color);
            return;
          }
        }

        // 通常時
        this.pauseAlert('warning', 'altitude');
        this.pauseAlert('danger', 'altitude');
        target_node.setAttribute('fill', this.normal_color);
        break;

      case 'map':
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
            this.pauseAlert('danger', 'map');
            this.playAlert('warning', 'map');
            // target_node.setAttribute('fill', this.warning_color);
            return;
          }
        }

        // 危険範囲のチェック
        // console.log(warning_val_ranges);
        // console.log(danger_val_ranges);
        // console.log(val);
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
            this.pauseAlert('warning', 'map');
            this.playAlert('danger', 'map');
            // target_node.setAttribute('fill', this.warning_color);
            return;
          }
        }

        // 通常時
        this.pauseAlert('warning', 'map');
        this.pauseAlert('danger', 'map');
        // target_node.setAttribute('fill', this.normal_color);
        break;

      default:
        break;
    }
  }
}