import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Relationship from '../models/Relationship';
import { Kernel } from '../services/Kernel';
import { EventType } from '../models/LifeEvent';

export const createRelationship = async (req: AuthRequest, res: Response) => {
    try {
        const relationship: any = await Relationship.create({
            userId: req.user._id,
            ...req.body,
        });

        // Trigger life event for score update
        await Kernel.processEvent(req.user._id, {
            type: EventType.SOCIAL,
            title: `Added relationship: ${relationship.name}`,
            impact: 'positive',
            value: 5, // Significant impact for adding a connection
            metadata: { relationshipId: relationship._id }
        });

        res.status(201).json(relationship);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRelationships = async (req: AuthRequest, res: Response) => {
    try {
        const relationships = await Relationship.find({ userId: req.user._id });
        res.json(relationships);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const logInteraction = async (req: AuthRequest, res: Response) => {
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
            type: EventType.SOCIAL,
            title: `Interaction with ${relationship.name}`,
            impact: 'positive',
            value: 1,
            metadata: { relationshipId: relationship._id }
        });

        res.json(relationship);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRelationship = async (req: AuthRequest, res: Response) => {
    try {
        const relationship = await Relationship.findById(req.params.id);
        if (!relationship || relationship.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        await Relationship.findByIdAndDelete(req.params.id);

        // Recalculate scores
        await Kernel.updateLifeScores(req.user._id as string);

        res.json({ message: 'Relationship deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
