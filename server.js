const express = require('express');
const { getCourseSchedule, getNewToken } = require('./course.js');
const { getGrades } = require('./grade.js'); // 导入getGrades函数

const app = express();
const port = 3000;

/**
 * 获取课程数据的API接口
 * 访问示例: http://localhost:3000/get-course-data?rawPassword=yourPassword&user_code=yourUserCode
 */
app.get('/get-course-data', async (req, res) => {
    const { rawPassword, user_code } = req.query;

    if (!rawPassword || !user_code) {
        return res.status(400).json({ error: '缺少 rawPassword 或 user_code' });
    }

    try {
        const token = await getNewToken(rawPassword, user_code); // 传递user_code

        if (token) {
            const courseData = await getCourseSchedule(token);
            res.json(courseData);
        } else {
            res.status(500).json({ error: '未能获取到token' });
        }
    } catch (error) {
        res.status(500).json({ error: '发生错误', details: error.message });
    }
});

/**
 * 获取成绩数据的API接口
 * 访问示例: http://localhost:3000/get-grade-data?rawPassword=yourPassword&user_code=yourUserCode
 */
app.get('/get-grade-data', async (req, res) => {
    const { rawPassword, user_code } = req.query;

    if (!rawPassword || !user_code) {
        return res.status(400).json({ error: '缺少 rawPassword 或 user_code' });
    }

    try {
        const gradeData = await getGrades(rawPassword, user_code); // 传递参数

        if (gradeData && gradeData.length > 0) {
            res.json(gradeData);
        } else {
            res.status(500).json({ error: '未能获取到成绩数据' });
        }
    } catch (error) {
        res.status(500).json({ error: '发生错误', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});
