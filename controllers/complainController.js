// controllers/complainController.js
const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const complain = new Complain({
            ...req.body,
            school: req.body.adminID
        })
        const result = await complain.save()
        res.send(result)
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ school: req.params.id })
                                      .populate('user', 'name email')
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateComplainStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const result = await Complain.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateMultipleComplainsStatus = async (req, res) => {
    try {
        const { complainIds, status } = req.body;
        const result = await Complain.updateMany(
            { _id: { $in: complainIds } },
            { status },
            { new: true }
        );
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteComplain = async (req, res) => {
    try {
        const result = await Complain.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteComplains = async (req, res) => {
    try {
        const result = await Complain.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No complains found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

module.exports = { 
    complainCreate, 
    complainList, 
    updateComplainStatus, 
    updateMultipleComplainsStatus,
    deleteComplain, 
    deleteComplains 
};