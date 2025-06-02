import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contact: {
        name: String,
        email: String,
        phone: String,
        linkedin: String,
        github: String,
    },
    summary: String,
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String,
    }],
    education: [{
        degree: String,
        school: String,
        year: String,
    }],
    skills: [String],
    projects: [{
        title: String,
        description: String,
        tech: String,
    }],
    certifications: [{
        title: String,
        issuer: String,
    }],
    templateType: {
    type: String,
    enum: ['fresher', 'professional'],
    default: 'professional'
    }

}, { timestamps: true });

const ResumeModel = mongoose.model('Resume', ResumeSchema);
export default ResumeModel;
