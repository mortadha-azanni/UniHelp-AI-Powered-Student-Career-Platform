import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'refreshTokens.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Read JSON file
async function readJsonFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return defaultValue;
        }
        throw error;
    }
}

// Write JSON file
async function writeJsonFile(filePath, data) {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// User operations
export const UserFile = {
    async create({ username, email, password }) {
        const users = await readJsonFile(USERS_FILE);

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            throw new Error('Email already exists');
        }
        if (users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            _id: crypto.randomUUID(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        await writeJsonFile(USERS_FILE, users);

        // Remove password from returned object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    async findByEmail(email) {
        const users = await readJsonFile(USERS_FILE);
        return users.find(u => u.email === email);
    },

    async findById(id) {
        const users = await readJsonFile(USERS_FILE);
        const user = users.find(u => u._id === id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    },

    async comparePassword(user, candidatePassword) {
        return await bcrypt.compare(candidatePassword, user.password);
    }
};

// RefreshToken operations
export const RefreshTokenFile = {
    async create(token, userId) {
        const tokens = await readJsonFile(TOKENS_FILE);

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const refreshToken = {
            _id: crypto.randomUUID(),
            token: hashedToken,
            userId,
            isValid: true,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            createdAt: new Date().toISOString()
        };

        tokens.push(refreshToken);
        await writeJsonFile(TOKENS_FILE, tokens);

        return refreshToken;
    },

    async findValidToken(token) {
        const tokens = await readJsonFile(TOKENS_FILE);
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        return tokens.find(t =>
            t.token === hashedToken &&
            t.isValid &&
            new Date(t.expiresAt) > new Date()
        );
    },

    async invalidateToken(token) {
        const tokens = await readJsonFile(TOKENS_FILE);
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const tokenIndex = tokens.findIndex(t => t.token === hashedToken);
        if (tokenIndex !== -1) {
            tokens[tokenIndex].isValid = false;
            await writeJsonFile(TOKENS_FILE, tokens);
            return true;
        }
        return false;
    }
};

// Initialize data directory on import
ensureDataDir();
