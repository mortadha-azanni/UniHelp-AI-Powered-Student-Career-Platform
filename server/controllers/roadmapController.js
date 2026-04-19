import Roadmap from '../models/Roadmap.js';
import Profile from '../models/Profile.js';
import StudySchedule from '../models/StudySchedule.js';
import { generateRoadmapNodeContent } from '../services/roadmapNodeChain.js';
import { generateStudyScheduleContent } from '../services/studyScheduleChain.js';
import { generateRoadmapContent } from '../services/roadmapGeneratorChain.js';
import dagre from '@dagrejs/dagre';

// Get all roadmaps for the logged-in user
export const getRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ user: req.user.id }).sort({ updatedAt: -1 });
        res.json({ success: true, count: roadmaps.length, data: roadmaps });
    } catch (error) {
        console.error('Error fetching roadmaps:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get a single roadmap by ID
export const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        res.json({ success: true, data: roadmap });
    } catch (error) {
        console.error('Error fetching roadmap:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create a new roadmap
export const createRoadmap = async (req, res) => {
    try {
        const { title, description, category, difficulty, nodes, edges } = req.body;

        const newRoadmap = new Roadmap({
            user: req.user.id,
            title,
            description,
            category,
            difficulty,
            nodes: nodes || [],
            edges: edges || []
        });

        const savedRoadmap = await newRoadmap.save();
        res.status(201).json({ success: true, data: savedRoadmap });
    } catch (error) {
        console.error('Error creating roadmap:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Generate a full roadmap using AI
export const generateRoadmap = async (req, res) => {
    try {
        const { goal } = req.body;
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🗺️  [ROADMAP GENERATE] START  goal="${goal}"  user=${req.user.id}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (!goal) {
            return res.status(400).json({ success: false, message: 'Goal is required to generate a roadmap.' });
        }

        // STEP 1 — Fetch user profile
        console.log('📋 [STEP 1] Fetching user profile...');
        const profile = await Profile.findOne({ user: req.user.id });
        console.log(`📋 [STEP 1] Profile found: ${profile ? 'YES' : 'NO (using empty profile)'}`);
        if (profile) {
            console.log(`📋 [STEP 1] Skills: ${JSON.stringify(profile.technicalSkills?.slice(0, 5) || [])}`);
        }

        // STEP 2 — Call AI chain
        console.log('🤖 [STEP 2] Calling AI generation chain...');
        const t0 = Date.now();
        const aiRoadmapData = await generateRoadmapContent({
            goal,
            profile: profile || {}
        });
        console.log(`🤖 [STEP 2] AI done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
        console.log(`🤖 [STEP 2] title="${aiRoadmapData.title}"  nodes=${aiRoadmapData.nodes?.length}  edges=${aiRoadmapData.edges?.length}`);
        console.log(`🤖 [STEP 2] difficulty=${aiRoadmapData.difficulty}  status=${aiRoadmapData.status}  progress=${aiRoadmapData.progressPercentage}%`);

        // STEP 3 — Transform to React Flow nodes
        console.log('🔄 [STEP 3] Transforming nodes to React Flow format...');
        const reactFlowNodes = aiRoadmapData.nodes.map((node, index) => {
            return {
                id: node.id,
                type: 'customNode',
                position: { x: 250, y: index * 150 + 50 },
                data: {
                    label: node.title,
                    description: node.description,
                    status: node.status === 'done' ? 'completed' : (node.status === 'in_progress' ? 'in-progress' : 'pending'),
                    resources: node.resources && Array.isArray(node.resources) ? node.resources.map(r => ({
                        title: r.title,
                        url: r.url,
                        type: r.type === 'documentation' ? 'documentation' : (r.type === 'video' ? 'video' : 'article')
                    })) : [],
                    tools: node.tools || [],
                    xpReward: 50
                }
            };
        });
        console.log(`🔄 [STEP 3] ${reactFlowNodes.length} React Flow nodes created`);
        console.log(`🔄 [STEP 3] Node IDs: ${reactFlowNodes.map(n => n.id).join(', ')}`);

        // STEP 4 — Build edges
        console.log('🔗 [STEP 4] Building edges...');
        let reactFlowEdges = aiRoadmapData.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'customEdge',
            animated: true
        }));
        console.log(`🔗 [STEP 4] AI edges: ${reactFlowEdges.length}`);

        // Always rebuild edges from prerequisites
        const edgeSet = new Set(reactFlowEdges.map(e => `${e.source}|${e.target}`));
        aiRoadmapData.nodes.forEach(node => {
            if (node.prerequisites && Array.isArray(node.prerequisites)) {
                node.prerequisites.forEach(prereqId => {
                    const key = `${prereqId}|${node.id}`;
                    if (!edgeSet.has(key)) {
                        edgeSet.add(key);
                        reactFlowEdges.push({
                            id: `edge-${prereqId}-${node.id}`,
                            source: prereqId,
                            target: node.id,
                            type: 'customEdge',
                            animated: true
                        });
                    }
                });
            }
        });

        // Remove phantom edges
        const nodeIdSet = new Set(aiRoadmapData.nodes.map(n => n.id));
        const before = reactFlowEdges.length;
        reactFlowEdges = reactFlowEdges.filter(
            e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target)
        );
        console.log(`🔗 [STEP 4] After prerequisite merge: ${reactFlowEdges.length} edges  (${before - reactFlowEdges.length} phantom removed)`);

        // STEP 5 — Dagre layout
        console.log('📐 [STEP 5] Running Dagre layout...');
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: 'TB', ranksep: 180, nodesep: 120 });

        reactFlowNodes.forEach(node => {
            dagreGraph.setNode(node.id, { width: 280, height: 140 });
        });
        reactFlowEdges.forEach(edge => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const startX = 250;
        const startY = 50;

        const layoutedNodes = reactFlowNodes.map(node => {
            const nodeWithPosition = dagreGraph.node(node.id);
            if (nodeWithPosition) {
                node.position = {
                    x: nodeWithPosition.x - 140 + startX,
                    y: nodeWithPosition.y - 70 + startY
                };
            }
            return node;
        });

        // Check how many unique x positions (indicates branching vs single column)
        const uniqueX = new Set(layoutedNodes.map(n => Math.round(n.position.x))).size;
        console.log(`📐 [STEP 5] Layout done. Unique X positions: ${uniqueX} (>1 means branching tree ✅)`);

        // STEP 6 — Save to MongoDB
        console.log('💾 [STEP 6] Saving roadmap to MongoDB...');
        const newRoadmap = new Roadmap({
            user: req.user.id,
            title: aiRoadmapData.title || `Roadmap: ${goal}`,
            description: aiRoadmapData.description || 'Generated Roadmap',
            category: 'AI Generated',
            difficulty: aiRoadmapData.difficulty === 'beginner' ? 'Beginner' : (aiRoadmapData.difficulty === 'advanced' ? 'Advanced' : 'Intermediate'),
            nodes: layoutedNodes,
            edges: reactFlowEdges,
            progress: {
                totalNodes: layoutedNodes.length,
                completedNodes: layoutedNodes.filter(n => n.data.status === 'completed').length,

                percentage: layoutedNodes.length > 0 ? Math.round((layoutedNodes.filter(n => n.data.status === 'completed').length / layoutedNodes.length) * 100) : 0
            }
        });

        const savedRoadmap = await newRoadmap.save();
        res.status(201).json({ success: true, data: savedRoadmap });

    } catch (error) {
        console.error('\n🔴 [ROADMAP GENERATE] FAILED ──────────────────────');
        console.error('   Message :', error.message);
        console.error('   Status  :', error?.status ?? error?.statusCode ?? 'N/A');
        console.error('   Type    :', error?.constructor?.name);
        if (error?.cause) console.error('   Cause   :', error.cause);
        if (error?.stack) console.error('   Stack   :', error.stack.split('\n').slice(0, 5).join('\n'));
        console.error('─────────────────────────────────────────────────\n');
        res.status(500).json({
            success: false,
            message: 'Failed to generate roadmap',
            error: error.message
        });
    }
};

// Update an existing roadmap (nodes and edges state)
export const updateRoadmap = async (req, res) => {
    try {
        const { title, description, category, nodes, edges } = req.body;

        const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        if (title !== undefined) roadmap.title = title;
        if (description !== undefined) roadmap.description = description;
        if (category !== undefined) roadmap.category = category;
        if (nodes !== undefined) roadmap.nodes = nodes;
        if (edges !== undefined) roadmap.edges = edges;

        // Calculate progress
        if (nodes) {
            const totalNodes = nodes.length;
            const completedNodes = nodes.filter(n => n.data?.status === 'completed').length;
            roadmap.progress = {
                totalNodes,
                completedNodes,
                percentage: totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0
            };
        }

        const updatedRoadmap = await roadmap.save();
        res.json({ success: true, data: updatedRoadmap });
    } catch (error) {
        console.error('Error updating roadmap:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete a roadmap
export const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        res.json({ success: true, message: 'Roadmap deleted successfully' });
    } catch (error) {
        console.error('Error deleting roadmap:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Generate AI content for a specific node
export const generateNodeContent = async (req, res) => {
    try {
        const { id, nodeId } = req.params;

        // Fetch roadmap
        const roadmap = await Roadmap.findOne({ _id: id, user: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        // Find the node
        const nodeIndex = roadmap.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Node not found in this roadmap' });
        }

        const node = roadmap.nodes[nodeIndex];
        const nodeLabel = node.data?.label;

        if (!nodeLabel) {
            return res.status(400).json({ success: false, message: 'Node has no label to generate content for.' });
        }

        // Fetch user profile for skills context
        const profile = await Profile.findOne({ user: req.user.id });

        // Call LangChain service
        const aiContent = await generateRoadmapNodeContent({
            roadmapTitle: roadmap.title,
            nodeLabel: nodeLabel,
            profile: profile
        });

        // Update node data
        roadmap.nodes[nodeIndex].data = {
            ...roadmap.nodes[nodeIndex].data,
            description: aiContent.description,
            resources: aiContent.resources,
            status: aiContent.recommendedStatus,
            masteryLevel: aiContent.masteryLevel // Save the mastery level to the DB
        };

        // Recalculate progress
        const totalNodes = roadmap.nodes.length;
        const completedNodes = roadmap.nodes.filter(n => n.data?.status === 'completed').length;
        roadmap.progress = {
            totalNodes,
            completedNodes,
            percentage: totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0
        };

        await roadmap.save();

        res.json({ success: true, data: roadmap.nodes[nodeIndex] });

    } catch (error) {
        console.error('Error generating node content:', error);
        res.status(500).json({ success: false, message: 'Failed to generate content', error: error.message });
    }
};

// ==========================================
// COMMUNITY FEATURES (Phase 4)
// ==========================================

// Get all public roadmaps
export const getPublicRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ isPublic: true })
            .populate('user', 'username email')
            .sort({ 'likes.length': -1, createdAt: -1 });

        res.json({ success: true, count: roadmaps.length, data: roadmaps });
    } catch (error) {
        console.error('Error fetching public roadmaps:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Clone a public roadmap
export const cloneRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap || !roadmap.isPublic) {
            return res.status(404).json({ success: false, message: 'Public roadmap not found' });
        }

        // Deep copy nodes and reset progress
        const resetNodes = roadmap.nodes.map(node => ({
            ...node.toObject(),
            data: {
                ...node.data,
                status: 'pending' // Reset status for the new user
            }
        }));

        const newRoadmap = new Roadmap({
            user: req.user.id,
            title: `${roadmap.title} (Clone)`,
            description: roadmap.description,
            category: roadmap.category,
            difficulty: roadmap.difficulty,
            nodes: resetNodes,
            edges: roadmap.edges,
            isPublic: false,
            clonedFrom: roadmap._id,
            progress: { totalNodes: resetNodes.length, completedNodes: 0, percentage: 0 }
        });

        const savedClone = await newRoadmap.save();
        res.status(201).json({ success: true, data: savedClone });
    } catch (error) {
        console.error('Error cloning roadmap:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Toggle visibility (Public / Private)
export const toggleRoadmapVisibility = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        roadmap.isPublic = !roadmap.isPublic;
        await roadmap.save();

        res.json({ success: true, data: roadmap });
    } catch (error) {
        console.error('Error toggling roadmap visibility:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Like / Unlike a roadmap
export const likeRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap || !roadmap.isPublic) {
            return res.status(404).json({ success: false, message: 'Public roadmap not found' });
        }

        const userId = req.user.id;
        const likeIndex = roadmap.likes.indexOf(userId);

        if (likeIndex === -1) {
            // User hasn't liked it yet
            roadmap.likes.push(userId);
        } else {
            // User already liked it, remove like
            roadmap.likes.splice(likeIndex, 1);
        }

        await roadmap.save();
        res.json({ success: true, likesCount: roadmap.likes.length, data: roadmap });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==========================================
// AI STUDY SCHEDULE FEATURES (Phase 5)
// ==========================================

export const generateStudySchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { hoursPerDay, targetTimeframe, familiarityLevel } = req.body;

        const roadmap = await Roadmap.findOne({ _id: id, user: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        // Call the LangChain AI service
        const aiScheduleData = await generateStudyScheduleContent({
            roadmap,
            hoursPerDay,
            targetTimeframe,
            familiarityLevel
        });

        // Parse resulting days array and add default completed: false
        const scheduleDays = (aiScheduleData.days || []).map(day => ({
            dayNumber: day.dayNumber,
            focusArea: day.focusArea,
            tasks: (day.tasks || []).map(task => ({
                nodeId: task.nodeId,
                taskDescription: task.taskDescription,
                estimatedMinutes: task.estimatedMinutes,
                completed: false
            }))
        }));

        // Upsert the schedule (replace if exists)
        let schedule = await StudySchedule.findOne({ roadmap: id, user: req.user.id });

        if (schedule) {
            schedule.days = scheduleDays;
            schedule.progress = 0;
            await schedule.save();
        } else {
            schedule = new StudySchedule({
                user: req.user.id,
                roadmap: id,
                days: scheduleDays,
                progress: 0
            });
            await schedule.save();
        }

        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Error generating study schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to generate study schedule', error: error.message });
    }
};

export const getStudySchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await StudySchedule.findOne({ roadmap: id, user: req.user.id });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Error fetching study schedule:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const toggleScheduleTask = async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const schedule = await StudySchedule.findOne({ roadmap: id, user: req.user.id });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        let taskFound = false;
        let affectedNodeId = null;

        // 1. Toggle the task status
        for (const day of schedule.days) {
            const task = day.tasks.find(t => t._id.toString() === taskId);
            if (task) {
                task.completed = !task.completed;
                affectedNodeId = task.nodeId;
                taskFound = true;
                break;
            }
        }

        if (!taskFound) {
            return res.status(404).json({ success: false, message: 'Task not found in schedule' });
        }

        // 2. Recalculate schedule global progress
        let totalTasks = 0;
        let completedTasks = 0;
        schedule.days.forEach(day => {
            day.tasks.forEach(task => {
                totalTasks++;
                if (task.completed) completedTasks++;
            });
        });
        schedule.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        await schedule.save();

        // 3. Automatic Synchronization with Roadmap
        if (affectedNodeId) {
            const roadmap = await Roadmap.findOne({ _id: id, user: req.user.id });
            if (roadmap) {
                // Find all tasks across the schedule that belong to this node
                let allTasksForNode = [];
                schedule.days.forEach(day => {
                    day.tasks.forEach(task => {
                        if (task.nodeId === affectedNodeId) {
                            allTasksForNode.push(task);
                        }
                    });
                });

                if (allTasksForNode.length > 0) {
                    const allCompleted = allTasksForNode.every(t => t.completed);
                    const anyStarted = allTasksForNode.some(t => t.completed);

                    // Determine new status for the node
                    let newStatus = 'pending';
                    if (allCompleted) {
                        newStatus = 'completed';
                    } else if (anyStarted) {
                        newStatus = 'in-progress';
                    }

                    // Update node in roadmap
                    const nodeIndex = roadmap.nodes.findIndex(n => n.id === affectedNodeId);
                    if (nodeIndex !== -1 && roadmap.nodes[nodeIndex].data.status !== newStatus) {
                        roadmap.nodes[nodeIndex].data.status = newStatus;

                        // Recalculate roadmap progress
                        const totalNodes = roadmap.nodes.length;
                        const completedNodesCount = roadmap.nodes.filter(n => n.data?.status === 'completed').length;
                        roadmap.progress = {
                            totalNodes,
                            completedNodes: completedNodesCount,
                            percentage: totalNodes > 0 ? Math.round((completedNodesCount / totalNodes) * 100) : 0
                        };

                        await roadmap.save();
                    }
                }
            }
        }

        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Error toggling schedule task:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
