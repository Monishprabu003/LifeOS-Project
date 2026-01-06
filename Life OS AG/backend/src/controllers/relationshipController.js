import Relationship from '../models/Relationship.js';
import { Kernel } from '../services/Kernel.js';

export const createRelationship = async (req, res) => {
    try {
        const relationship = await Relationship.create({
            userId: req.user._id,
            ...req.body,
        });

        // Trigger life event for score update
        await Kernel.processEvent(req.user._id, {
            type: 'social',
            title: `Added relationship: ${relationship.name}`,
            impact: 'positive',
            value: 5, // Significant impact for adding a connection
            metadata: { relationshipId: relationship._id }
        });

        res.status(201).json(relationship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRelationships = async (req, res) => {
    try {
        const relationships = await Relationship.find({ userId: req.user._id });
        res.json(relationships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logInteraction = async (req, res) => {
    try {
        const { type, description } = req.body;
        const relationship = await Relationship.findById(req.params.id);

        if (!relationship || relationship.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        relationship.lastInteraction = new Date();
        relationship.interactionHistory.push({
            date: new Date(),
            type,
            description
        });

        await relationship.save();

        // Log life event
        await Kernel.processEvent(req.user._id, {
            type: 'social',
            title: `Interaction with ${relationship.name}`,
            impact: 'positive',
            value: 1,
            metadata: { relationshipId: relationship._id }
        });

        res.json(relationship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRelationship = async (req, res) => {
    try {
        const relationship = await Relationship.findById(req.params.id);
        if (!relationship || relationship.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        await Relationship.findByIdAndDelete(req.params.id);

        // Recalculate scores
        await Kernel.updateLifeScores(req.user._id);

        res.json({ message: 'Relationship deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
