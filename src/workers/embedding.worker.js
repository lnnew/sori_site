import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are directly pulling from Hugging Face Hub
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Calculate cosine similarity between two 1D arrays
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // We expect { type: 'init' } or { type: 'calculate', text: '...', target: '...' }

    // Initialize the pipeline
    const progress_callback = (data) => {
        self.postMessage({ type: 'progress', data });
    };

    try {
        const extractor = await PipelineSingleton.getInstance(progress_callback);

        if (event.data.type === 'init') {
            // Pre-calculate target embeddings to save time later
            const targetWords = event.data.targetWords || ["독립", "안무", "극장", "극단"];
            const targetEmbeddings = {};

            for (let word of targetWords) {
                const output = await extractor(word, { pooling: 'mean', normalize: true });
                targetEmbeddings[word] = Array.from(output.data);
            }

            self.postMessage({ type: 'ready', targetEmbeddings });
        }

        else if (event.data.type === 'calculate') {
            const { id, text, targetEmbedding } = event.data;

            // Extract features for the user's word
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            const inputEmbedding = Array.from(output.data);

            // Calculate similarity score
            const similarity = cosineSimilarity(inputEmbedding, targetEmbedding);

            // We return a "Kkomentle Score" which is roughly (similarity * 100)
            const score = Math.round(similarity * 10000) / 100;

            self.postMessage({ type: 'result', id, text, score });
        }
    } catch (e) {
        console.error("Worker Error:", e);
        self.postMessage({ type: 'error', error: e.message });
    }
});
