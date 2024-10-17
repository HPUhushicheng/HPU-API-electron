var axios = require('axios');
var qs = require('qs');

// 请求数据
var data = qs.stringify({
   'biz_type_id': '1',
   'kind': 'all',
   'token': '089531f71e3e4bf7926c14c58a8642a4' 
});

// 请求配置
var config = {
   method: 'post',
   url: 'http://lgjw.hpu.edu.cn/app-ws/ws/app-service/student/exam/grade/get-grades',
   headers: { 
      'Accept': 'application/json, text/plain, */*', 
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6', 
      'Origin': 'http://lgjw.hpu.edu.cn', 
      'Proxy-Connection': 'keep-alive', 
      'Referer': 'http://lgjw.hpu.edu.cn/app-web/', 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', 
      'token': '089531f71e3e4bf7926c14c58a8642a4', 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Host': 'lgjw.hpu.edu.cn', 
      'Connection': 'keep-alive'
   },
   data: data
};

// 发送请求并解码Base64
axios(config)
   .then(function (response) {
      // 获取business_data字段
      const businessData = response.data.business_data;

      // 使用 Buffer 解码 Base64
      const decodedData = Buffer.from(businessData, 'base64').toString('utf8');

      // 输出解码后的数据
      console.log('解码输出的business_data:', decodedData);
   })
   .catch(function (error) {
      console.log(error);
   });
