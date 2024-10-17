var axios = require('axios');
var qs = require('qs');
var readline = require('readline');

// 创建CLI接口，获取用户输入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Base64编码原始密码的函数
function encodePassword(password) {
    return Buffer.from(password).toString('base64');
}

// 封装获取新token的函数
async function getNewToken(rawPassword, userCode) {
    // 对原始密码进行Base64编码
    var encodedPassword = encodePassword(rawPassword);

    var data = qs.stringify({
        'passwd': encodedPassword,
        'user_code': userCode
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
        console.log('响应内容:', response.data); // 打印完整的响应数据
        const businessData = response.data.business_data;
    
        if (businessData) {
            const decodedData = Buffer.from(businessData, 'base64').toString('utf8');
            const token = JSON.parse(decodedData).token; // 提取token字段
            return token; // 直接返回token
        } else {
            console.error('business_data 不存在');
            return null;
        }
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
        const address = course.rooms[0]?.address || "地址未提供"; // 获取第一个房间的地址

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
        'end_date': '2024-10-27',
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
        const courseList = JSON.parse(decodedData); // 解析JSON数据
        return courseList; // 返回课程列表
    } catch (error) {
        console.error('获取课程表失败:', error);
        return [];
    }
}

// 按日期获取对应星期几的课程
function getCoursesForDay(courses, dayOfWeek) {
    const daysMap = {
        '1': '2024-10-21', // 周一
        '2': '2024-10-22', // 周二
        '3': '2024-10-23', // 周三
        '4': '2024-10-24', // 周四
        '5': '2024-10-25', // 周五
        '6': '2024-10-26', // 周六
        '7': '2024-10-27'  // 周日
    };

    const selectedDate = daysMap[dayOfWeek];
    const filteredCourses = courses.filter(course => course.date === selectedDate);

    if (filteredCourses.length > 0) {
        return filteredCourses.sort((a, b) => a.startTime.localeCompare(b.startTime));
    } else {
        return null; // 没有匹配的课程
    }
}

// CLI 用户输入
rl.question('请输入学号: ', (userCode) => {
    rl.question('请输入密码: ', async (rawPassword) => {
        const token = await getNewToken(rawPassword,userCode);

        if (token) {
            const courseData = await getCourseSchedule(token); // 获取课程表数据
            const processedData = processCourseData(courseData);

            rl.question('请输入您想查询的星期几（1: 周一, 2: 周二, 3: 周三, 4: 周四, 5: 周五, 6: 周六, 7: 周日）: ', (dayOfWeek) => {
                const coursesForDay = getCoursesForDay(processedData, dayOfWeek);

                if (coursesForDay && coursesForDay.length > 0) {
                    console.log('当天的课程安排:');
                    coursesForDay.forEach(course => {
                        console.log(`课程名称: ${course.courseName}, 开始时间: ${course.startTime}, 结束时间: ${course.endTime}, 地点: ${course.address}`);
                    });
                } else {
                    console.log('今天暂无课程');
                }
                rl.close();
            });
        } else {
            console.log('获取token失败');
            rl.close();
        }
    });
});
