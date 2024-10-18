// const express = require('express');
// const { getNewToken, getCourseSchedule } = require('./course.js');

// const app = express();
// const port = 3000;

// app.get('/get-course-data', async (req, res) => {
//   const { rawPassword, user_code } = req.query;

//   if (!rawPassword || !user_code) {
//     return res.status(400).json({ error: 'Missing rawPassword or user_code' });
//   }

//   try {
//     const token = await getNewToken(rawPassword);

//     if (token) {
//       const courseData = await getCourseSchedule(token);
//       res.json(courseData);
//     } else {
//       res.status(500).json({ error: 'Failed to retrieve token' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred', details: error.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });



const express = require('express');
const { getNewToken, getCourseSchedule, processCourseData, getCoursesForDay } = require('./cli_course_test.js');

const app = express();
const port = 4000;

app.get('/get-course-data', async (req, res) => {
    const { rawPassword, userCode, dayOfWeek } = req.query;

    if (!rawPassword || !userCode || !dayOfWeek) {
        return res.status(400).json({ error: 'Missing rawPassword, userCode, or dayOfWeek' });
    }

    try {
        const token = await getNewToken(rawPassword, userCode);

        if (token) {
            const courseData = await getCourseSchedule(token);
            const processedData = processCourseData(courseData);
            const coursesForDay = getCoursesForDay(processedData, dayOfWeek);

            if (coursesForDay && coursesForDay.length > 0) {
                res.json(coursesForDay);
            } else {
                res.json({ message: '今日无课，去海皮吧' });
            }
        } else {
            res.status(500).json({ error: 'Failed to retrieve token' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});