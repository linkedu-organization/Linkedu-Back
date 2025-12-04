import express from 'express';
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
export default app;
//# sourceMappingURL=app.js.map