require("dotenv").config();

const express=require("express")
const cookieParser=require("cookie-parser")
const cors=require("cors")

const authRoutes=require("./routes/auth.routes")
const userRoutes=require("./routes/user.routes")

const app=express()

app.use(cors({
    origin:"http://localhost:3001",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/",authRoutes)
app.use("/",userRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found!` });
});

// Error handler
app.use((err, req, res, next) => {
  console.log("Error:", err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || "Something went wrong" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});