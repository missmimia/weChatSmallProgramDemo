const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
};

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
};

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;

// const UNPROMPTED_TIPS = "点击获取当前位置";
// const UNAUTHORIZED_TIPS = "点击开启位置权限";
// const AUTHORIZED_TIPS = "";

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    forecast: [],
    todayDate: '',
    todayTemp: '',
    locationCity: '佛山市',
    locationAuthTpye: UNPROMPTED,
    // locationTips: UNPROMPTED_TIPS,
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh();
    });
  },
  onLoad() {
    // 实例化API核心类
    // mi: 注意实例化要放在load时
    this.qqMap = new QQMapWX({
      key: 'Q6UBZ-AZLLX-AWH4X-ZPU6R-L43SF-P4F6J' // 必填
    });

    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting['scope.userLocation'];
        console.log(12, auth);

        //  权限从无到有
        this.setData({
          // locationTips: auth ? AUTHORIZED_TIPS : (auth === false) ? UNAUTHORIZED_TIPS : UNPROMPTED_TIPS,
          locationAuthTpye: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED,
        });
        if (auth)
          this.getPosition();
        else
          this.getNow();
      }
    })
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.locationCity,
      },
      success: (res) => {
        // console.log('success', this.data.locationCity, res);
        let forecast = res.data.result.forecast;
        const nowHour = new Date().getHours();
        const date = new Date();

        // 未来24小时天气
        forecast.map((item, i) => {
          i = 0 + i * 3;
          item.time = (nowHour + i) % 24 + '时';
          item.iconpath = '/images/' + item.weather + '-icon.png';
        })
        forecast[0].time = '现在';

        // 

        this.setData({
          nowTemp: res.data.result.now.temp,
          nowWeather: weatherMap[res.data.result.now.weather],
          nowWeatherBackground: '/images/' + res.data.result.now.weather + '-bg.png',
          forecast: forecast,
          todayTemp: `${res.data.result.today.minTemp}° - ${res.data.result.today.maxTemp}°`,
          todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`,
        });

        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[res.data.result.now.weather],
        });

      },
      complete: () => {
        callback && callback()
        // wx.stopPullDownRefresh();
      }
    })
  },
  toDayWeather: function () {
    // wx.showToast({
    //   title: '你点我la',
    // });
    wx.navigateTo({
      url: `/pages/list/list?city=${this.data.locationCity}`,
    })
  },
  onTapLocation() {
    if (this.data.locationAuthTpye === UNAUTHORIZED)
      wx.openSetting({
        success: (res) => {
          console.log('123', res);
          if (res.authSetting['scope.userLocation']) {
            this.getPosition();
          }
        }
      });
    else
      this.getPosition();
  },
  getPosition() {
    wx.getLocation({
      success: (res) => {
        this.setData({
          locationAuthTpye: AUTHORIZED,
          // locationTips: AUTHORIZED_TIPS,
        });
        this.qqMap.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            this.setData({
              locationCity: res.result.address_component.city,
              // locationTips: '',
            })
          }
        });
      },
      fail: (err) => {
        console.log(err);
        this.setData({
          locationAuthTpye: UNAUTHORIZED,
          // locationTips: UNAUTHORIZED_TIPS,
        });
      }
    })
  }
  // onShow() {
  //   // onShow() 函数在每一次页面出现时都会被调用，第一次打开时页面会出现，从设置页面返回时页面会出现，从第二页返回时页面会出现。一有考虑不慎，就会产生问题。
  //   wx.getSetting({
  //     success: (res) => {
  //       console.log(12, res.authSetting['scope.userLocation']);
  //       if (res.authSetting['scope.userLocation'] && this.data.locationAuthTpye === UNAUTHORIZED) {
  //          权限从无到有
  //         this.setData({
  //           locationTips: AUTHORIZED_TIPS,
  //           locationAuthTpye: AUTHORIZED,
  //         });
  //         this.getPosition();
  //       }
  //     }
  //   })
  // }
})
