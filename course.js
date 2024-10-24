const axios = require('axios');
const qs = require('qs');

/**
 * Base64编码原始密码的函数
 * @param {string} password - 原始密码
 * @returns {string} 编码后的密码
 */
function encodePassword(password) {
    return Buffer.from(password).toString('base64');
}

/**
 * 获取新token的函数
 * @param {string} rawPassword - 原始密码
 * @param {string} user_code - 用户代码
 * @returns {Promise<string|null>} 返回token或null
 */
async function getNewToken(rawPassword, user_code) {
    // 对原始密码进行Base64编码
    const encodedPassword = encodePassword(rawPassword);

    const data = qs.stringify({
        'passwd': encodedPassword,
        'user_code': user_code // 使用传入的user_code
    });

    const config = {
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
        console.error('获取新token失败:', error.response ? error.response.data : error.message);
        return null;
    }
}

/**
 * 整理课程表数据的函数
 * @param {Array} courses - 原始课程数据
 * @returns {Array} 处理后的课程数据
 */
function processCourseData(courses) {
    return courses.map(course => {
        // 提取所需的字段
        const courseName = course.course_name;
        const date = course.date;
        const startTime = course.start_time;
        const endTime = course.end_time;
        const address = course.rooms && course.rooms.length > 0 ? course.rooms[0].address : "教师暂未查询到"; // 获取第一个房间的地址

        return {
            courseName,
            date,
            startTime,
            endTime,
            address
        };
    });
}

/**
 * 获取课程表数据的函数
 * @param {string} token - 用户token
 * @returns {Promise<Array>} 返回课程列表
 */
async function getCourseSchedule(token) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 获取今天是周几，周日为0
    const start = new Date(today);
    start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // 计算周一的日期
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // 计算周日的日期

    // 格式化日期为YYYY-MM-DD
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    const data = qs.stringify({
        'biz_type_id': '1',
        'end_date': endDate,
        'semester_id': '184',
        'start_date': startDate
    });

    const config = {
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
        const courseList = JSON.parse(decodedData); // 解析JSON数据
        return processCourseData(courseList); // 返回处理后的课程列表
    } catch (error) {
        console.error('获取课程表失败:', error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = {
    getNewToken,
    getCourseSchedule
};
