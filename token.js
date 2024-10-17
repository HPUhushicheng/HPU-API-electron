var axios = require('axios');
var qs = require('qs');

// 封装获取新token的函数
async function getNewToken() {
    var data = qs.stringify({
        'passwd': 'MDIwODEy',
        'user_code': '312201030222'
    });
    var config = {
        method: 'post',
        url: 'http://lgjw.hpu.edu.cn/app-ws/ws/app-service/login',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Origin': 'http://lgjw.hpu.edu.cn',
            'Proxy-Connection': 'keep-alive',
            'Referer': 'http://lgjw.hpu.edu.cn/app-web/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
            'Cookie': 'INGRESSCOOKIE=3105ba56b8cab4c5d8f8264544076b32|69770b29de3f3d7b1578acd945cb3a27; _gscu_1470794712=88388573boy2n918',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'lgjw.hpu.edu.cn',
            'Connection': 'keep-alive'
        },
        data: data
    };

    try {
        const response = await axios(config);
        const businessData = response.data.business_data;
        const decodedData = Buffer.from(businessData, 'base64').toString('utf8');
        const token = JSON.parse(decodedData).token; // 提取token字段
        return token; // 直接返回token
    } catch (error) {
        console.error('获取新token失败:', error);
        return null;
    }
}

// 使用示例
async function exampleUsage() {
    const token = await getNewToken();
    console.log('获取到的新token:', token);
}

exampleUsage();
