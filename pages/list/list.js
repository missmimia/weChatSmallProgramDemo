var dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

Page({
  data: {
    future: [],
    city: '厦门市',
  },
  onLoad(options) {
    console.log('options', options.city);
    this.setData({
      city: options.city,
    });
    this.getFuture();
  },
  onPullDownRefresh() {
    this.getFuture(() => {
      wx.stopPullDownRefresh();
    });
  },
  getFuture(callback) {
    var nowTime = new Date().getTime();
    var date = new Date();
    var that = this;
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: nowTime,
      },
      success: (res) => {
        console.log('list success', this.data.city, res);
        var future = res.data.result;

        future.map((item, i) => {
          let date = new Date()
          date.setDate(date.getDate() + i);
          item.day = dayMap[date.getDay()];
          item.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          item.iconPath = `/images/${item.weather}-icon.png`
        });

        that.setData({
          future: future,
        });

      },
      complete() {
        callback && callback()
      }
    })
  }
})