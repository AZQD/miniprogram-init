let app = getApp();
let api = require('../api.js');

/**
 * Promise增加finally方法
 * @param callback
 * @returns {Promise<any>}
 */
Promise.prototype.finally = function (callback) {
  let Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
};

module.exports = {
  globalData: app.globalData, // 全局变量

  /**
   * 联系方式正则表达式
   * @param phone
   * @returns {boolean}
   */
  regExpPhone (phone) {
    let phoneReg = /^[1][3|4|5|7|8][0-9]{9}$/;
    return phoneReg.test(phone);
  },

  /**
   * 正整数正则表达式
   * @param number
   * @returns {boolean}
   */
  regExpPositiveInteger (number) {
    let intNumberReg = /^[1-9]\d*$/;
    return intNumberReg.test(number);
  },

  /**
   * 正数正则表达式（包含小数点）
   * @param number
   * @returns {boolean}
   */
  regExpPositiveNumber (number) {
    // let intNumberReg = /^(([1-9][0-9]*(\.\d{1,2})?)|(0\.\d{1,2}))$/; // 小数点后最多两位
    let intNumberReg = /^(([1-9][0-9]*(\.\d+)?)|(0\.\d+))$/; // 小数点后位数未限制
    return intNumberReg.test(number);
  },

  tips: {

    /**
     * toast提示
     * @param title
     * @param options
     */
    toast (title, options) {
      options = {
        duration: 1500,
        icon: 'none', // success(最对7个汉字), loading(最对7个汉字), none
        complete: null,
        close: null,
        mask: true,
        ...options
      };
      wx.showToast &&
      wx.showToast({
        title,
        ...options
      });
      options.close &&
      setTimeout(() => {
        options.close();
      }, options.duration);
    },

    /**
     * alert提示
     * @param title
     * @param content
     * @param options
     * @returns {Promise<any>}
     */
    alert (title, content, options = {}) {
      if (!content && title) {
        content = title;
        title = '提示';
      }
      return new Promise((resolve) => {
        wx.showModal &&
        wx.showModal({
          title,
          showCancel: false,
          confirmColor: app.globalData.lightColor,
          content,
          success (res) {
            resolve(res.confirm);
          },
          ...options
        });
      });
    },

    /**
     * confirm提示
     * @param title
     * @param content
     * @param cb：用户点击确定
     * @param cancelCb：用户点击取消
     * @param options
     * @returns {Promise<any>}
     */
    confirm (title, content, cb, cancelCb, options = {}) {
      const args = arguments;
      return new Promise((resolve) => {
        wx.showModal &&
        wx.showModal({
          title,
          content,
          confirmColor: app.globalData.lightColor,
          ...options,
          success: (res) => {
            if (res.confirm) {
              resolve(true);
              cb && cb.apply(this, args);
            } else {
              resolve(false);
              cancelCb && cancelCb.apply(this, args);
            }
          }
        });
      });
    }
  },

  isBaseAuthFun () {
    const isBaseAuth = wx.getStorageSync('isBaseAuth');
    if (!isBaseAuth) {
      this.tips.confirm('', '授权后您可体验更完整的功能，前往授权吗？', () => {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      });
      return false;
    }
    return true;
  },

  /** get请求
   * @param url
   * @param params
   * @returns {Promise<any>}
   */
  get (url, params) {
    return new Promise((resolve, reject) => {
      const wxaOpenId = wx.getStorageSync('wxaOpenId');
      if (wxaOpenId) {
        wx.showLoading({
          title: '加载中...'
        });
        wx.request({
          url: url,
          data: {
            ...params,
            wxaOpenId
          },
          method: 'GET',
          success: (res) => {
            if (res.data.code === 0) {
              // 隐藏loading 提示框
              wx.hideLoading();
              resolve(res.data.data);
            } else if (res.data.code === -1) {
              // 小程序未登陆
              app.wxaLogin().then(() => {
                this.get(url, params).then((res) => {
                  resolve(res);
                });
              });
            } else {
              this.tips.toast(res.data.msg); // 请求失败：错误提示
              // 隐藏loading 提示框
              wx.hideLoading();
              reject(res);
              console.log('请求失败：', res);
              console.log('url和params为：', url, params);
            }
          },
          fail: (err) => {
            // 隐藏loading 提示框
            wx.hideLoading();
            this.tips.toast(err.errMsg); // 请求异常：错误提示
            reject(err);
            console.log('请求异常：', err);
            console.log('url和params为：', url, params);
          }
        });
      } else {
        // 小程序未登陆
        app.wxaLogin().then(() => {
          this.get(url, params).then((res) => {
            resolve(res);
          });
        });
      }
    });
  },

  /**
   * post请求
   * @param url
   * @param params
   * @returns {Promise<any>}
   */
  post (url, params) {
    return new Promise((resolve, reject) => {
      const wxaOpenId = wx.getStorageSync('wxaOpenId');
      if (wxaOpenId) {
        wx.showLoading({
          title: '加载中...'
        });
        wx.request({
          url: url,
          data: {
            ...params,
            wxaOpenId
          },
          method: 'POST',
          success: (res) => {
            if (res.data.code === 0) {
              // 隐藏loading 提示框
              wx.hideLoading();
              resolve(res.data.data);
            } else if (res.data.code === -1) {
              // 小程序未登陆
              app.wxaLogin().then(() => {
                this.post(url, params).then((res) => {
                  resolve(res);
                });
              });
            } else {
              // 隐藏loading 提示框
              wx.hideLoading();
              this.tips.toast(res.data.msg); // 请求失败：错误提示
              reject(res);
              console.log('请求失败：', res);
              console.log('url和params为：', url, params);
            }
          },
          fail: (err) => {
            // 隐藏loading 提示框
            wx.hideLoading();
            this.tips.toast(err.errMsg); // 请求异常：错误提示
            reject(err);
            console.log('请求异常：', err);
            console.log('url和params为：', url, params);
          }
        });
      } else {
        // 小程序未登陆
        app.wxaLogin().then(() => {
          this.post(url, params).then((res) => {
            resolve(res);
          });
        });
      }
    });
  },

  // 选择图片函数
  uploadImgFun: function (number = 1) {
    return new Promise((resolve, reject) => {
      const wxaOpenId = wx.getStorageSync('wxaOpenId');
      if (wxaOpenId) {
        wx.chooseImage({
          count: number,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            this.chooseImageAfter(res, resolve);
          }
        });
      } else {
        // 小程序未登陆
        app.wxaLogin().then(() => {
          this.uploadImgFun(number).then((res) => {
            resolve(res);
          });
        });
      }
    });
  },

  chooseImageAfter: async function (res, resolve) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let uploadImgArr = [];
    for (let i = 0; i < res.tempFilePaths.length; i++) {
      let data = await this.realUploadImgFun(res.tempFilePaths[i]);

      let picUrl;
      if (data.code === 0) {
        picUrl = data.data.picUrl;
      } else {
        this.tips.alert(`第${i + 1}张图片上传失败原因：${data.msg}`);
      }

      console.log(`第${i}张图片上传${picUrl ? '成功' : '失败'}！`);
      picUrl && uploadImgArr.push(picUrl);
      if (i === res.tempFilePaths.length - 1) {
        // 隐藏loading 提示框
        wx.hideLoading();
        console.log('上传成功的图片数组：', uploadImgArr);
        resolve(uploadImgArr);
      }
    }
  },

  realUploadImgFun: async function (tempFilePath) {
    const wxaOpenId = wx.getStorageSync('wxaOpenId');
    return new Promise((resolve) => {
      wx.uploadFile({
        url: api.pic_uploadPic,
        filePath: tempFilePath,
        name: 'file', // 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容，是后端预先定义的
        formData: {
          wxaOpenId
        },
        success (resp) {
          let data = JSON.parse(resp.data);
          console.log('success', data);
          resolve(data);
        },
        fail (error) {
          console.log('error', error);
          resolve();
        }
      });
    });
  }

};
