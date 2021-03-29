let api = require('../../api.js');
let appUtils = require('../../utils/appUtils.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideHomeButton({
    //   complete: (res) => {
    //     console.log('隐藏返回首页按钮', res);
    //   }
    // });
  },

  getUserInfo: function (e) {
    console.log('用户信息授权：', e);
    if (e.detail.userInfo) { // 已经授权
      const {iv, encryptedData} = e.detail;

      wx.login({
        success: (res) => {
          appUtils.get(api.user_userAuth, {
            jsCode: res.code,
            encryptedData,
            iv
          }).then((res) => {
            console.log('login页面授权登录：', res.isBaseAuth);
            wx.setStorageSync('isBaseAuth', res.isBaseAuth);
            const detailUrl = wx.getStorageSync('detailUrl');
            if (detailUrl) {
              wx.removeStorageSync('detailUrl');
              wx.reLaunch({
                url: detailUrl
              });
            } else {
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          });
        }
      });
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 通过后端接口获取手机号（个人账号暂不可以获取）
  getPhoneNumber: (e) => {
    console.log(e);
    const {iv, encryptedData} = e.detail;

    wx.login({
      success: (res) => {
        appUtils.get(api.user_userAuthPhone, {
          jsCode: res.code,
          encryptedData,
          iv
        }).then((res) => {
          console.log('login页面授权获取电话：', res);
          wx.switchTab({
            url: '/pages/index/index'
          });
        });
      }
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});