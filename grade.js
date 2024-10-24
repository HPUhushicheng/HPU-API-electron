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
 * 获取成绩的函数
 * @param {string} rawPassword - 原始密码
 * @param {string} user_code - 用户代码
 * @returns {Promise<Array>} 返回成绩列表
 */
async function getGrades(rawPassword, user_code) {
    const token = await getNewToken(rawPassword, user_code);

    if (token) {
        // 请求数据
        var data = qs.stringify({
            'biz_type_id': '1',
            'token': token // 使用获取到的token
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
                'token': token, // 使用获取到的token
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'lgjw.hpu.edu.cn',
                'Connection': 'keep-alive'
            },
            data: data
        };

        // 处理成绩数据
        try {
            const response = await axios(config);
            const businessData = response.data.business_data;

            // 使用 Buffer 解码 Base64
            const decodedData = Buffer.from(businessData, 'base64').toString('utf8');

            // 解析为 JSON 对象
            const jsonData = JSON.parse(decodedData);

            // 提取所需字段
            const results = jsonData.semester_lessons.map(semester => {
                return {
                    semester_credits: semester.semester_credits,
                    semester_gp: semester.semester_gp,
                    lessons: semester.lessons.map(lesson => ({
                        course_name: lesson.course_name,
                        course_gp: lesson.course_gp,
                        course_credit: lesson.course_credit,
                        score_text: lesson.score_text
                    }))
                };
            });

            return results; // 返回成绩
        } catch (error) {
            console.error('获取成绩失败:', error.response ? error.response.data : error.message);
            return [];
        }
    } else {
        console.log('未能获取到token');
        return [];
    }
}

// 移除硬编码的调用示例
// getGrades('020812', '312201030222');

module.exports = {
    getGrades
};
