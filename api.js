let app = getApp();
const apiroot = app.globalData.apiroot;
let api = {
  pic_uploadPic: 'pic/uploadPic' // 1. 图片上传
};
for (let key in api) {
  api[key] = apiroot + api[key];
}
module.exports = api;