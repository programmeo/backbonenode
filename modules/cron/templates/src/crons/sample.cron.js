import cron from 'node-cron';

// Schedule a task to run every minute
// To enable this cron, you should import this file somewhere in your server bootstrap (e.g. app.js or server.js)
const task = cron.schedule('* * * * *', () => {
    console.log('Running sample cron job every minute...');
}, {
    scheduled: false // set to true to auto-start, or call task.start()
});

export default task;
