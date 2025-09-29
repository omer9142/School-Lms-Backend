const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        const existingSubjectBySubCode = await Subject.findOne({
            'subjects.subCode': subjects[0].subCode,
            school: req.body.adminID,
        });

        if (existingSubjectBySubCode) {
            res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        } else {
            const newSubjects = subjects.map((subject) => ({
                ...subject,
                sclassName: req.body.sclassName,
                school: req.body.adminID,
            }));

            const result = await Subject.insertMany(newSubjects);
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const allSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName")
        if (subjects.length > 0) {
            res.send(subjects)
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const classSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id })
            .populate("sclassName", "sclassName");

        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const freeSubjectList = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id)
            .populate("sclassName", "sclassName")
            .populate("teacher", "name");

        if (subject) {
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// FIXED: This was the main issue
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        if (!deletedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // FIXED: Use $pull to remove only the specific subject ID from the array
        // instead of $unset which removes the entire field
        await Teacher.updateMany(
            { teachSubject: deletedSubject._id },
            { $pull: { teachSubject: deletedSubject._id } }
        );

        // Remove the objects containing the deleted subject from students' examResult array
        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id } } }
        );

        // Remove the objects containing the deleted subject from students' attendance array
        await Student.updateMany(
            {},
            { $pull: { attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json(error);
    }
};

// FIXED: Similar issue in bulk delete functions
const deleteSubjects = async (req, res) => {
    try {
        const deletedSubjects = await Subject.find({ school: req.params.id });
        const subjectIds = deletedSubjects.map(subject => subject._id);

        await Subject.deleteMany({ school: req.params.id });

        // FIXED: Use $pull to remove specific subject IDs from arrays
        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $pull: { teachSubject: { $in: subjectIds } } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

// FIXED: Similar issue in class-specific delete
const deleteSubjectsByClass = async (req, res) => {
    try {
        const deletedSubjects = await Subject.find({ sclassName: req.params.id });
        const subjectIds = deletedSubjects.map(subject => subject._id);

        await Subject.deleteMany({ sclassName: req.params.id });

        // FIXED: Use $pull to remove specific subject IDs from arrays
        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $pull: { teachSubject: { $in: subjectIds } } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};
const deleteAllSubjects = async (req, res) => {
  try {
    const { classId } = req.params;

    // Remove subjects tied to that class
    await Subject.deleteMany({ class: classId });

    res.status(200).json({ message: "All subjects deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
    subjectCreate, 
    freeSubjectList, 
    classSubjects, 
    getSubjectDetail, 
    deleteSubjectsByClass, 
    deleteSubjects, 
    deleteSubject, 
    allSubjects,
    deleteAllSubjects
};