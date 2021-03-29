// app.js
App({
  onLaunch: function () {

    // 初始化进入页面；
    // 先通过wx.login返回的code查openId；
    // 如果有该用户，则进入首页；
    // 如果没有该用户，则进入/login/login页面注册；
    this.wxaLogin = () => {
      console.log('app.js入口登录开始');
      return new Promise(((resolve, reject) => {
        wx.login({
          success: (res) => {
            wx.request({
              url: this.globalData.apiroot + 'user/wxaLogin',
              data: {
                jsCode: res.code
              },
              success: (res) => {
                const data = res.data || {};
                console.log('app.js入口登录：', data);
                if (data.code === 0) {
                  const {isBaseAuth, wxaOpenId} = data.data;
                  this.globalData.wxaOpenId = wxaOpenId;
                  wx.setStorageSync('wxaOpenId', wxaOpenId);
                  wx.setStorageSync('isBaseAuth', isBaseAuth);
                  // 如果之前没有授权过，即为新用户，则授权用户信息
                  console.log('用户是否已授权过：', !!isBaseAuth);
                  if (!isBaseAuth) {
                    wx.redirectTo({
                      url: '/pages/login/login'
                    });
                  }
                  resolve();
                } else {
                  wx.showToast({
                    title: data.msg || '服务器异常，请稍后重试',
                    icon: 'none',
                    duration: 1500
                  });
                }

              },
              fail (res) {
                wx.showToast({
                  title: res.errMsg || '服务器异常，请稍后重试',
                  icon: 'none',
                  duration: 1500
                });
              }
            });
          }
        });
      }));
    };
    // this.wxaLogin();

  },
  globalData: {
    lightColor: '#2428F5',
    wxaOpenId: null,
    page: 1, // 默认从第1页开始
    appid: '',
    ossDomain: 'https://img.***.com/', // 阿里云图片域名
    apiroot: 'https://api.***.com/' // 线上
  }
});