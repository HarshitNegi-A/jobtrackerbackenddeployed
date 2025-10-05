const express=require('express')
const app=express()
const signupRoute=require('./routes/signupRoute')
const cors=require('cors')
const sequelize=require('./db')
const User=require('./model/UserModel')
const profileRoute=require('./routes/profileRoute')
const Application=require('./model/ApplicationModel')
const applicationRoute=require('./routes/applicationRoute')
const Reminder=require('./model/ReminderModel')
const reminderRoute=require('./routes/reminderRoute')
const startReminderCron=require('./utils/reminderCron')
const Company=require('./model/CompanyModel')
const companyRoute=require('./routes/companyRoute')
const statsRoute=require('./routes/statsRoute')
const noteRoute=require('./routes/noteRoute')
const Note=require('./model/NoteModel')

app.use(cors({
  origin: "https://jobapplicationtracker11.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json())
app.use('/',signupRoute)
app.use('/profile',profileRoute)
app.use("/api", applicationRoute);
app.use("/api", reminderRoute);
app.use("/api/companies", companyRoute);
app.use("/api/stats", statsRoute);
app.use("/api", noteRoute)

Application.hasMany(Note, { foreignKey: "applicationId", onDelete: "CASCADE" });
Note.belongsTo(Application, { foreignKey: "applicationId" });

User.hasMany(Application, { foreignKey: "userId" });
Application.belongsTo(User, { foreignKey: "userId" });

Application.hasMany(Reminder, { foreignKey: "applicationId" });
Reminder.belongsTo(Application, { foreignKey: "applicationId" });

// User ↔ Reminder (direct link for ownership)
User.hasMany(Reminder, { foreignKey: "userId" });
Reminder.belongsTo(User, { foreignKey: "userId" });

Company.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Company, { foreignKey: "userId" });


Application.belongsTo(Company, { foreignKey: "companyId" });
Company.hasMany(Application, { foreignKey: "companyId" });

sequelize.sync({alter:true})
.then(()=>{
    console.log("Connection created with database")
    startReminderCron();
    app.listen(3000,()=>console.log("Server is running"))
})
.catch((err)=>{
    console.error(err)
})

