var axios = require('axios');
var qs = require('qs');

// Base64编码原始密码的函数
function encodePassword(password) {
    return Buffer.from(password).toString('base64');
}

// 封装获取新token的函数
async function getNewToken(rawPassword) {
    // 对原始密码进行Base64编码
    var encodedPassword = encodePassword(rawPassword);

    var data = qs.stringify({
        'passwd': encodedPassword,
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

// 整理课程表数据的函数
function processCourseData(courses) {
    return courses.map(course => {
        // 提取所需的字段
        const courseName = course.course_name;
        const date = course.date;
        const startTime = course.start_time;
        const endTime = course.end_time;
        const address = course.rooms[0]?.address || "教师暂未查询到"; // 获取第一个房间的地址

        return {
            courseName,
            date,
            startTime,
            endTime,
            address
        };
    });
}

// 获取课程表数据的函数
async function getCourseSchedule(token) {
    var data = qs.stringify({
        'biz_type_id': '1',
        'end_date': '2024-10-28',
        'semester_id': '184',
        'start_date': '2024-10-21'
    });

    var config = {
        method: 'post',
        url: 'http://lgjw.hpu.edu.cn/app-ws/ws/app-service/student/course/schedule/get-course-tables',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Origin': 'http://lgjw.hpu.edu.cn',
            'Proxy-Connection': 'keep-alive',
            'Referer': 'http://lgjw.hpu.edu.cn/app-web/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
            'token': token, // 使用获取到的token
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
        //console.log('解码输出的business_data:', decodedData);
        const courseList = JSON.parse(decodedData); // 解析JSON数据
        return courseList; // 返回课程列表
    } catch (error) {
        console.error('获取课程表失败:', error);
        return [];
    }
}

// 示例使用
async function exampleUsage() {
    const rawPassword = '020812'; // 原始密码
    const token = await getNewToken(rawPassword);

    if (token) {
        console.log('获取到的新token:', token);
        const courseData = await getCourseSchedule(token); // 获取课程表数据

        // 处理课程表数据
        const processedData = processCourseData(courseData);
        console.log('整理后的课程数据:', processedData);
    } else {
        console.log('未能获取到token');
    }
    
}


exampleUsage();
