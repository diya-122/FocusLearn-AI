import axios from 'axios';
axios.get('https://my.spline.design/qj6BqC0tG-VnFq5W/').then(res => console.log("OK", res.status)).catch(e => console.log("ERR", e.message));
