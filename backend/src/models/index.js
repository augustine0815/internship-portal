const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// ============ USER ============
const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'company', 'admin', 'coordinator'),
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ STUDENT PROFILE ============
const StudentProfile = sequelize.define('StudentProfile', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  full_name: { type: DataTypes.STRING(150) },
  phone: { type: DataTypes.STRING(20) },
  university: { type: DataTypes.STRING(255) },
  degree: { type: DataTypes.STRING(150) },
  start_year: { type: DataTypes.INTEGER },
  skills: { type: DataTypes.JSON, defaultValue: [] },
  resume_url: { type: DataTypes.STRING(500) },
  profile_photo_url: { type: DataTypes.STRING(500) },
  bio: { type: DataTypes.TEXT },
}, {
  tableName: 'student_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ COMPANY PROFILE ============
const CompanyProfile = sequelize.define('CompanyProfile', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  company_name: { type: DataTypes.STRING(255) },
  industry: { type: DataTypes.STRING(150) },
  website: { type: DataTypes.STRING(255) },
  logo_url: { type: DataTypes.STRING(500) },
  description: { type: DataTypes.TEXT },
  verified_by_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'company_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ INTERNSHIP ============
const Internship = sequelize.define('Internship', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  company_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: { type: DataTypes.TEXT },
  required_skills: { type: DataTypes.JSON, defaultValue: [] },
  location: { type: DataTypes.STRING(255) },
  is_remote: { type: DataTypes.BOOLEAN, defaultValue: false },
  stipend: { type: DataTypes.DECIMAL(10, 2) },
  duration_weeks: { type: DataTypes.INTEGER },
  openings: { type: DataTypes.INTEGER, defaultValue: 1 },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'closed', 'filled'),
    defaultValue: 'draft',
  },
  application_deadline: { type: DataTypes.DATEONLY },
  approved_by_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'internships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ APPLICATION ============
const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  internship_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'applied', 'under_review', 'shortlisted',
      'rejected', 'offered', 'withdrawn', 'hired'
    ),
    defaultValue: 'applied',
  },
  cover_letter: { type: DataTypes.TEXT },
  applied_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'applications',
  timestamps: true,
  createdAt: 'applied_at',
  updatedAt: 'updated_at',
});

// ============ OFFER ============
const Offer = sequelize.define('Offer', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  application_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  offered_stipend: { type: DataTypes.DECIMAL(10, 2) },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  offer_letter_url: { type: DataTypes.STRING(500) },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired'),
    defaultValue: 'pending',
  },
  responded_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'offers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ NOTIFICATION ============
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  body: { type: DataTypes.TEXT },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  related_entity_type: { type: DataTypes.STRING(50), allowNull: true },
  related_entity_id: { type: DataTypes.BIGINT, allowNull: true },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ LOGBOOK ============
const Logbook = sequelize.define('Logbook', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  ai_generated_content: {
    type: DataTypes.TEXT,
  },
  final_content: {
    type: DataTypes.TEXT,
  },
  photo_urls: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'reviewed'),
    defaultValue: 'draft',
  },
  reviewer_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'logbooks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ GRADE ============
const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  coordinator_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  internship_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  performance_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  attitude_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  technical_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  overall_grade: {
    type: DataTypes.STRING(5),
  },
  comments: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'grades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ CONVERSATION ============
const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  company_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
   coordinator_user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  internship_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ============ MESSAGE ============
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  conversation_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  sender_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  body: { type: DataTypes.TEXT, allowNull: false },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'messages',
  timestamps: false,
});

// ============ ASSOCIATIONS ============
User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'studentProfile' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CompanyProfile, { foreignKey: 'user_id', as: 'companyProfile' });
CompanyProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

CompanyProfile.hasMany(Internship, { foreignKey: 'company_id', as: 'internships' });
Internship.belongsTo(CompanyProfile, { foreignKey: 'company_id', as: 'company' });

Internship.hasMany(Application, { foreignKey: 'internship_id', as: 'applications' });
Application.belongsTo(Internship, { foreignKey: 'internship_id', as: 'internship' });

StudentProfile.hasMany(Application, { foreignKey: 'student_id', as: 'applications' });
Application.belongsTo(StudentProfile, { foreignKey: 'student_id', as: 'student' });

Application.hasOne(Offer, { foreignKey: 'application_id', as: 'offer' });
Offer.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

StudentProfile.hasMany(Conversation, { foreignKey: 'student_id', as: 'conversations' });
Conversation.belongsTo(StudentProfile, { foreignKey: 'student_id', as: 'student' });

CompanyProfile.hasMany(Conversation, { foreignKey: 'company_id', as: 'conversations' });
Conversation.belongsTo(CompanyProfile, { foreignKey: 'company_id', as: 'company' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
StudentProfile.hasMany(Logbook, { foreignKey: 'student_id', as: 'logbooks' });
Logbook.belongsTo(StudentProfile, { foreignKey: 'student_id', as: 'student' });

StudentProfile.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
Grade.belongsTo(StudentProfile, { foreignKey: 'student_id', as: 'student' });
User.hasMany(Grade, { foreignKey: 'coordinator_id', as: 'gradesGiven' });
Grade.belongsTo(User, { foreignKey: 'coordinator_id', as: 'coordinator' });

module.exports = {
  sequelize,
  User,
  StudentProfile,
  CompanyProfile,
  Internship,
  Application,
  Offer,
  Notification,
  Conversation,
  Message,
  Logbook,
  Grade,
};